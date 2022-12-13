/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import { writeFileSync } from "fs";
import { ExtendedLangClient } from "src/core";
import { Position, Range, Uri, workspace, WorkspaceEdit } from "vscode";
import { STResponse } from "./activator";
import { Service } from "./resources";

export async function addConnector(langClient: ExtendedLangClient, sourceService: Service, targetService: Service)
    : Promise<boolean> {
    const filePath: string = sourceService.elementLocation.filePath;
    langClient.getSyntaxTree({
        documentIdentifier: {
            uri: Uri.file(filePath).toString()
        }
    }).then((response: any) => {
        const stResponseObj = response as STResponse;
        if (stResponseObj && stResponseObj.parseSuccess) {
            const members: any[] = stResponseObj.syntaxTree.members;
            const serviceDecl = members.find((member) => (
                member.kind === "ServiceDeclaration" &&
                sourceService.elementLocation.startPosition.line === member.position.startLine &&
                sourceService.elementLocation.endPosition.line === member.position.endLine &&
                sourceService.elementLocation.startPosition.offset === member.position.startColumn &&
                sourceService.elementLocation.endPosition.offset === member.position.endColumn
            ));

            const initMember = getInitFunction(serviceDecl);

            if (initMember) {
                executeCodeModifier(langClient, filePath, serviceDecl, generateClientDecl(targetService))
                    .then(() => {
                        // TO:DO Check ways to populate the template with the exiting initMember object
                        langClient.getSyntaxTree({
                            documentIdentifier: {
                                uri: Uri.file(filePath).toString()
                            }
                        }).then((response: any) => {
                            const updatedSTResponse = response as STResponse;
                            if (updatedSTResponse && updatedSTResponse.parseSuccess) {
                                const members: any[] = updatedSTResponse.syntaxTree.members;
                                const serviceDecl = members.find((member) => (
                                    member.kind === "ServiceDeclaration" &&
                                    sourceService.elementLocation.startPosition.line === member.position.startLine &&
                                    sourceService.elementLocation.startPosition.offset === member.position.startColumn
                                ));

                                const initMember = getInitFunction(serviceDecl);
                                if (initMember) {
                                    return executeCodeModifier(langClient, filePath, initMember.functionBody,
                                        generateClientInit(targetService));
                                }
                            }
                        });
                    })
            } else {
                let genCode = `
                        ${generateClientDecl(targetService)}
                        ${generateServiceInit(targetService)}
                    `;
                return executeCodeModifier(langClient, filePath, serviceDecl, genCode);
            }
        }
    });

    return false;
}


function getInitFunction(serviceDeclaration: any): any {
    const serviceNodeMembers: any[] = serviceDeclaration.members;
    const initMember = serviceNodeMembers.find((member) =>
        (member.kind === "ObjectMethodDefinition" && member.functionName.value === "init")
    );
    return initMember;
}

async function executeCodeModifier(langClient: ExtendedLangClient, filePath: string, stObject: any, generatedCode: string)
    : Promise<boolean> {
    let stModification = {
        startLine: stObject.openBraceToken.position.endLine,
        startColumn: stObject.openBraceToken.position.endColumn,
        endLine: stObject.openBraceToken.position.endLine,
        endColumn: stObject.openBraceToken.position.endColumn,
        type: "INSERT",
        config: {
            "STATEMENT": generatedCode
        }
    };

    langClient.stModify({
        astModifications: [stModification],
        documentIdentifier: {
            uri: Uri.file(filePath).toString()
        }
    }).then((response) => {
        const updatedST = response as STResponse;
        if (updatedST && updatedST.parseSuccess) {
            return updateSourceContent(langClient, filePath, updatedST.source);
        }
    });

    return false;
}

async function updateSourceContent(langClient: ExtendedLangClient, filePath: string, fileContent: string): Promise<boolean> {
    const doc = workspace.textDocuments.find((doc) => doc.fileName === filePath);
    if (doc) {
        const edit = new WorkspaceEdit();
        edit.replace(Uri.file(filePath), new Range(new Position(0, 0), doc.lineAt(doc.lineCount - 1).range.end), fileContent);
        await workspace.applyEdit(edit);
        langClient.updateStatusBar();
        return doc.save();
    } else {
        langClient.didChange({
            contentChanges: [
                {
                    text: fileContent
                }
            ],
            textDocument: {
                uri: Uri.file(filePath).toString(),
                version: 1
            }
        });
        writeFileSync(filePath, fileContent);
        langClient.updateStatusBar();
    }
    return false;
}

function generateClientDecl(targetService: Service): string {
    let clientDeclaration: string = `
        @display {
            label: "${targetService.annotation.label}",
            id: "${targetService.annotation.id}"
        }
        http:Client ${targetService.annotation.label || targetService.annotation.id};
    `;

    return clientDeclaration;
}

function generateServiceInit(targetService: Service): string {
    let serviceInit: string = `function init() returns error? {
                                ${generateClientInit(targetService)}
                            }`;
    return serviceInit;
}

function generateClientInit(targetService: Service): string {
    return `self.${targetService.annotation.label || targetService.annotation.id} = check new ("");`;
}
