import { IBallerinaLangClient } from "@wso2-enterprise/ballerina-languageclient";
import {
    addToTargetPosition,
    CompletionParams,
    createFunctionSignature,
    getSelectedDiagnostics,
    getSource,
    STModification,
    updateFunctionSignature
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FunctionDefinition, NodePosition, RequiredParam, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import * as monaco from "monaco-editor";
import { CompletionItemKind, Diagnostic } from "vscode-languageserver-protocol";

import { TypeDescriptor } from "../../Diagram/Node/commons/DataMapperNode";

import { DM_DEFAULT_FUNCTION_NAME } from "./DataMapperConfigPanel";
import { DataMapperInputParam } from "./InputParamsPanel/types";

export const FILE_SCHEME = "file://";
export const EXPR_SCHEME = "expr://";

export function getFnNameFromST(fnST: FunctionDefinition) {
    return fnST && fnST.functionName.value;
}

export const isValidInput = (param: RequiredParam): boolean => {
    return (
        param?.typeName &&
        (STKindChecker.isSimpleNameReference(param?.typeName) ||
            STKindChecker.isQualifiedNameReference(param?.typeName))
    );
};

export const isValidOutput = (fnST: FunctionDefinition): boolean => {
    return (
        fnST?.functionSignature?.returnTypeDesc?.type &&
        (STKindChecker.isSimpleNameReference(fnST?.functionSignature?.returnTypeDesc?.type) ||
            STKindChecker.isQualifiedNameReference(fnST?.functionSignature?.returnTypeDesc?.type))
    );
};

export function getInputsFromST(fnST: FunctionDefinition): DataMapperInputParam[] {
    let params: DataMapperInputParam[] = [];
    if (fnST) {
        // TODO: Check other Param Types
        const reqParams = fnST.functionSignature.parameters.filter((val) => STKindChecker.isRequiredParam(val)) as RequiredParam[];
        params = reqParams.map((param) => ({
            name: param.paramName.value,
            type: getTypeFromTypeDesc(param.typeName),
            inInvalid: !isValidInput(param)
        }));
    }
    return params;
}

export function getOutputTypeFromST(fnST: FunctionDefinition) {
    return getTypeFromTypeDesc(fnST.functionSignature?.returnTypeDesc?.type)
}

export function getTypeFromTypeDesc(typeDesc: TypeDescriptor) {
    if (typeDesc && STKindChecker.isSimpleNameReference(typeDesc)) {
        return typeDesc.name.value;
    } else if (typeDesc && STKindChecker.isQualifiedNameReference(typeDesc)) {
        return typeDesc.source?.trim();
    }
    return typeDesc?.source?.trim() || "";
}

export function getModifiedTargetPosition(currentRecords: string[], currentTargetPosition: NodePosition, syntaxTree: STNode) {
    if (currentRecords.length === 0) {
        return currentTargetPosition;
    } else {
        if (STKindChecker.isModulePart(syntaxTree)) {
            const modulePart = syntaxTree ;
            const memberPositions: NodePosition[] = [];
            modulePart.members.forEach((member: STNode) => {
                if (STKindChecker.isTypeDefinition(member)) {
                    const name = member.typeName.value;
                    if (currentRecords.includes(name)) {
                        memberPositions.push(member.position as NodePosition);
                    }
                }
            });

            let newTargetPosition: NodePosition = {
                endColumn: 0,
                endLine: 0,
                startColumn: 0,
                startLine: 0
            }

            memberPositions.forEach(position => {
                if (position.endLine >= newTargetPosition.endLine) {
                    newTargetPosition = {...newTargetPosition, startLine: position.endLine + 1, endLine: position.endLine + 1};
                }
            })

            return newTargetPosition
        } else {
            return currentTargetPosition;
        }
    }
}

export async function getDiagnosticsForFnName(name: string,
                                              inputParams: DataMapperInputParam[],
                                              outputType: string,
                                              fnST: FunctionDefinition,
                                              targetPosition: NodePosition,
                                              currentFileContent: string,
                                              filePath: string,
                                              langClientPromise: Promise<IBallerinaLangClient>) {
    const parametersStr = inputParams
        .map((item) => `${item.type} ${item.name}`)
        .join(",");
    const returnTypeStr = outputType ? `returns ${outputType}` : '';

    let stModification: STModification;
    let fnConfigPosition: NodePosition;
    let diagTargetPosition: NodePosition;
    if (fnST && STKindChecker.isFunctionDefinition(fnST)) {
        fnConfigPosition = {
            ...fnST?.functionSignature?.position as NodePosition,
            startLine: (fnST.functionName.position as NodePosition)?.startLine,
            startColumn: (fnST.functionName.position as NodePosition)?.startColumn
        }
        diagTargetPosition = {
            startLine: (fnST.functionName.position as NodePosition).startLine,
            startColumn: (fnST.functionName.position as NodePosition).startColumn,
            endLine: (fnST.functionName.position as NodePosition).endLine,
            endColumn: (fnST.functionName.position as NodePosition).startColumn + name.length
        };
        stModification = updateFunctionSignature(name, parametersStr, returnTypeStr, fnConfigPosition);
    } else {
        fnConfigPosition = targetPosition;
        const fnNameStartColumn = "function ".length + 1;
        diagTargetPosition = {
            startLine: targetPosition.startLine + 1,
            startColumn: targetPosition.startColumn + fnNameStartColumn,
            endLine: targetPosition.endLine + 1,
            endColumn: targetPosition.endColumn + (fnNameStartColumn + name.length)
        };
        stModification = createFunctionSignature(
            "",
            name,
            parametersStr,
            returnTypeStr,
            targetPosition,
            false,
            true,
            outputType ? `{}` : `()`  // TODO: Find default value for selected output type when DM supports types other than records
        );
    }
    const source = getSource(stModification);
    const content = addToTargetPosition(currentFileContent, fnConfigPosition, source);

    const diagnostics = await getVirtualDiagnostics(filePath, currentFileContent, content, langClientPromise);

    return getSelectedDiagnostics(diagnostics, diagTargetPosition, 0, name.length);
}

export async function getDefaultFnName(filePath: string, targetPosition: NodePosition,
                                       langClientPromise: Promise<IBallerinaLangClient>): Promise<string> {
    const langClient = await langClientPromise;
    const completionParams: CompletionParams = {
        textDocument: {
            uri: monaco.Uri.file(filePath).toString()
        },
        position: {
            character: targetPosition.endColumn,
            line: targetPosition.endLine
        },
        context: {
            triggerKind: 3
        }
    };
    const completions = await langClient.getCompletion(completionParams);
    const existingFnNames = completions.map((completion) => {
        if (completion.kind === CompletionItemKind.Function) {
            return completion?.filterText;
        }
    }).filter((name) => name !== undefined);

    let suffixIndex = 2;
    while (existingFnNames.includes(`${DM_DEFAULT_FUNCTION_NAME}${suffixIndex}`)) {
        suffixIndex++;
    }

    return `${DM_DEFAULT_FUNCTION_NAME}${suffixIndex}`;
}

async function getVirtualDiagnostics(filePath: string,
                                     currentFileContent: string,
                                     newContent: string,
                                     langClientPromise: Promise<IBallerinaLangClient>): Promise<Diagnostic[]> {
    const docUri = monaco.Uri.file(filePath).toString().replace(FILE_SCHEME, EXPR_SCHEME);
    const langClient = await langClientPromise;
    langClient.didOpen({
        textDocument: {
            uri: docUri,
            languageId: "ballerina",
            text: currentFileContent,
            version: 1
        }
    });
    langClient.didChange({
        contentChanges: [
            {
                text: newContent
            }
        ],
        textDocument: {
            uri: docUri,
            version: 1
        }
    });
    const diagResp = await langClient.getDiagnostics({
        documentIdentifier: {
            uri: docUri,
        }
    });
    langClient.didClose({
        textDocument: {
            uri: docUri
        }
    });

    return diagResp[0]?.diagnostics || [];
}
