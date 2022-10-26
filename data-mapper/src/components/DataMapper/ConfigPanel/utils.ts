import { IBallerinaLangClient } from "@wso2-enterprise/ballerina-languageclient";
import { FunctionDefinition, ModulePart, NodePosition, RequiredParam, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import * as monaco from "monaco-editor";
import { Diagnostic } from "vscode-languageserver-protocol";

import { TypeDescriptor } from "../../Diagram/Node/commons/DataMapperNode";

import { DataMapperInputParam } from "./InputParamsPanel/types";

export const FILE_SCHEME = "file://";
export const EXPR_SCHEME = "expr://";

export function getFnNameFromST(fnST: FunctionDefinition) {
    return fnST && fnST.functionName.value;
}

export function getInputsFromST(fnST: FunctionDefinition): DataMapperInputParam[] {
    let params: DataMapperInputParam[] = [];
    if (fnST) {
        // TODO: Check other Param Types
        const reqParams = fnST.functionSignature.parameters.filter((val) => STKindChecker.isRequiredParam(val)) as RequiredParam[];
        params = reqParams.map((param) => ({
            name: param.paramName.value,
            type: getTypeFromTypeDesc(param.typeName)
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
    }
    return "";
}

export function getModifiedTargetPosition(currentRecords: string[], currentTargetPosition: NodePosition, syntaxTree: STNode) {
    if (currentRecords.length === 0) {
        return currentTargetPosition;
    } else {
        if(STKindChecker.isModulePart(syntaxTree)) {
            const modulePart = syntaxTree as ModulePart;
            const memberPositions: NodePosition[] = [];
            modulePart.members.forEach((member: STNode) => {
                if(STKindChecker.isTypeDefinition(member)) {
                    const name = member.typeName.value;
                    if(currentRecords.includes(name)) {
                        memberPositions.push(member.position);
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
                if(position.endLine >= newTargetPosition.endLine) {
                    newTargetPosition = {...newTargetPosition, startLine: position.endLine + 1, endLine: position.endLine + 1};
                }
            })

            return newTargetPosition
        } else {
            return currentTargetPosition;
        }
    }
}

export async function getVirtualDiagnostics(filePath: string, currentFileContent: string,
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
