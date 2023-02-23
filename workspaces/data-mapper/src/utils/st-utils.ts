import { IBallerinaLangClient } from "@wso2-enterprise/ballerina-languageclient";
import { LinePosition } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    CaptureBindingPattern,
    LetExpression,
    ModulePart,
    NodePosition,
    STKindChecker,
    STNode
} from "@wso2-enterprise/syntax-tree";
import {
    Location,
    LocationLink
} from "vscode-languageserver-protocol";

import { FnDefInfo } from "../components/Diagram/utils/fn-definition-store";

export function isObject(item: unknown) {
    return (typeof item === "object" && !Array.isArray(item) && item !== null);
}

export function isPositionsEquals(position1: NodePosition, position2: NodePosition): boolean {
    return position1?.startLine === position2?.startLine &&
        position1?.startColumn === position2?.startColumn &&
        position1?.endLine === position2?.endLine &&
        position1?.endColumn === position2?.endColumn;
}

export function genLetClauseVariableName(intermediateClauses: (STNode)[]): string {
    const baseName = 'variable';
    let index = 0;
    const allVariableNames: string[] = []

    for (const clause of intermediateClauses) {
        if (STKindChecker.isLetClause(clause)) {
            for (const item of clause.letVarDeclarations) {
                if (STKindChecker.isLetVarDecl(item)) {
                    allVariableNames.push(item.typedBindingPattern.bindingPattern.source.trim())
                }
            }
        }else if (STKindChecker.isJoinClause(clause)){
            allVariableNames.push((clause?.typedBindingPattern?.bindingPattern as CaptureBindingPattern)?.variableName?.value)
        }
    }
    while (allVariableNames.includes(`${baseName}${index ? index : ""}`)){
        index++;
    }

    return `${baseName}${index ? index : ""}`;
}

export function genLetExpressionVariableName(letExpressions: LetExpression[]): string {
    const baseName = 'variable';
    let varName = baseName;
    let index = 0;

    if (!letExpressions.some(expr => expr === undefined)) {
        for (const expr of letExpressions) {
            for (const decl of expr.letVarDeclarations) {
                if (STKindChecker.isLetVarDecl(decl) && decl.typedBindingPattern.bindingPattern.source.trim() === varName) {
                    index++;
                    varName = baseName + index.toString();
                }
            }
        }
    }
    return varName;
}

export async function getFnDefsForFnCalls(fnCallPositions: LinePosition[],
                                          fileUri: string,
                                          langClientPromise: Promise<IBallerinaLangClient>): Promise<FnDefInfo[]> {
    const langClient = await langClientPromise;
    const fnDefs: FnDefInfo[] = [];
    const fnDefinitions: Map<string, FnDefInfo[]> = new Map();
    for (const position of fnCallPositions) {
        const reply = await langClient.definition({
            position: {
                line: position.line,
                character: position.offset
            },
            textDocument: {
                uri: fileUri
            }
        });
        let defLoc: Location;
        if (Array.isArray(reply)) {
            if (isLocationLink(reply[0])) {
                defLoc = {
                    uri: reply[0].targetUri,
                    range: reply[0].targetRange
                };
            } else {
                defLoc = reply[0];
            }
        } else {
            defLoc = reply;
        }
        const defPosition: NodePosition = {
            startLine: defLoc.range.start.line,
            startColumn: defLoc.range.start.character,
            endLine: defLoc.range.end.line,
            endColumn: defLoc.range.end.character
        }

        const fnDefInfo: FnDefInfo = {
            fnCallPosition: position,
            fnDefPosition: defPosition,
            fileUri: defLoc.uri,
            isExprBodiedFn: false
        }
        if (fnDefinitions.has(defLoc.uri)) {
            const existingDefs = fnDefinitions.get(defLoc.uri);
            existingDefs.push(fnDefInfo);
            fnDefinitions.set(defLoc.uri, existingDefs);
        } else {
            fnDefinitions.set(defLoc.uri, [fnDefInfo]);
        }
    }

    for (const [key, value] of fnDefinitions) {
        const stResp = await langClient.getSyntaxTree({
            documentIdentifier: {
                uri: key
            }
        });

        if (stResp.parseSuccess) {
            const modPart = stResp.syntaxTree as ModulePart;
            modPart.members.forEach((mem) => {
                if (STKindChecker.isFunctionDefinition(mem)) {
                    const fnNamePosition = mem.functionName.position as NodePosition;
                    const fnDefInfo = value.find(v => {
                        return isPositionsEquals(v.fnDefPosition, fnNamePosition)
                    });
                    if (fnDefInfo) {
                        fnDefInfo.isExprBodiedFn = STKindChecker.isExpressionFunctionBody(mem.functionBody);
                        fnDefs.push(fnDefInfo);
                    }
                }
            });
        }
    }

    return fnDefs;
}

function isLocationLink(obj: any): obj is LocationLink {
    return obj.targetUri !== undefined && obj.targetRange !== undefined;
}
