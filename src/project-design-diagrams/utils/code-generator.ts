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
import { STResponse } from "../activator";
import { Service, ServiceTypes } from "../resources";

const ClientVarNameRegex: RegExp = /[^a-zA-Z0-9_]/g;
let clientName: string;
let filePath: string;
let extendedLangClient: ExtendedLangClient;

// TODO: Handle errors from the FE
export async function addConnector(langClient: ExtendedLangClient, sourceService: Service, targetService: Service)
    : Promise<boolean> {
    extendedLangClient = langClient;
    filePath = sourceService.elementLocation.filePath;
    clientName = transformLabel(targetService.annotation.label) || transformLabel(targetService.annotation.id);

    const stResponse: STResponse = await extendedLangClient.getSyntaxTree({
        documentIdentifier: {
            uri: Uri.file(filePath).toString()
        }
    }) as STResponse;

    if (stResponse && stResponse.parseSuccess) {
        const targetType: ServiceTypes = getServiceType(targetService.serviceType);
        const addImport: boolean = !isImportPresent(stResponse.syntaxTree.imports, targetType);

        const members: any[] = stResponse.syntaxTree.members;
        const serviceDecl = getServiceDeclaration(members, sourceService, true);
        const initMember = serviceDecl ? getInitFunction(serviceDecl) : undefined;
        let modifiedST: STResponse;

        if (initMember) {
            modifiedST = await updateSyntaxTree(serviceDecl.openBraceToken, generateClientDecl(targetService, targetType)) as STResponse;
            if (modifiedST && modifiedST.parseSuccess) {
                const members: any[] = modifiedST.syntaxTree.members;
                const serviceDecl = getServiceDeclaration(members, sourceService, false);
                const updatedInitMember = serviceDecl ? getInitFunction(serviceDecl) : undefined;
                if (updatedInitMember) {
                    modifiedST = await updateSyntaxTree(updatedInitMember.functionBody.openBraceToken, generateClientInit()) as STResponse;
                    if (modifiedST && modifiedST.parseSuccess) {
                        if (!addImport) {
                            return updateSourceFile(modifiedST.source);
                        } else {
                            return addImportDeclaration(modifiedST, targetType);
                        }
                    }
                }
            }
        } else {
            let genCode = `
                    ${generateClientDecl(targetService, targetType)}
                    ${generateServiceInit()}
                `;
            modifiedST = await updateSyntaxTree(serviceDecl.openBraceToken, genCode) as STResponse;
            if (modifiedST && modifiedST.parseSuccess) {
                if (!addImport) {
                    return updateSourceFile(modifiedST.source);
                } else {
                    return addImportDeclaration(modifiedST, targetType);
                }
            }
        }
    }

    return false;
}

function getServiceType(serviceType: string): ServiceTypes {
    if (serviceType.includes('ballerina/grpc:')) {
        return ServiceTypes.GRPC;
    } else if (serviceType.includes('ballerina/graphql:')) {
        return ServiceTypes.GRAPHQL;
    } else if (serviceType.includes('ballerina/http:')) {
        return ServiceTypes.HTTP;
    } else if (serviceType.includes('ballerina/websocket:')) {
        return ServiceTypes.WEBSOCKET;
    } else {
        throw new Error('Could not process target service type.');
    }
}

function isImportPresent(members: any[], targetType: ServiceTypes) {
    return members.some((member) => (
        member.orgName?.source === "ballerina/" &&
        member.moduleName[0]?.value === targetType
    ));
}

async function addImportDeclaration(modifiedST: STResponse, targetType: ServiceTypes): Promise<boolean> {
    const imports: any[] = modifiedST.syntaxTree.imports;
    const stResponse: STResponse = await updateSyntaxTree(imports[imports.length - 1], generateImport(targetType)) as STResponse;
    if (stResponse && stResponse.parseSuccess) {
        return updateSourceFile(stResponse.source);
    }
    return false;
}

function getServiceDeclaration(members: any[], sourceService: Service, checkEnd: boolean): any {
    return members.find((member) => (
        member.kind === "ServiceDeclaration" &&
        sourceService.elementLocation.startPosition.line === member.position.startLine &&
        sourceService.elementLocation.startPosition.offset === member.position.startColumn && (
            checkEnd ? sourceService.elementLocation.endPosition.line === member.position.endLine &&
                sourceService.elementLocation.endPosition.offset === member.position.endColumn : true
        )
    ));
}

function getInitFunction(serviceDeclaration: any): any {
    const serviceNodeMembers: any[] = serviceDeclaration.members;
    return serviceNodeMembers.find((member) =>
        (member.kind === "ObjectMethodDefinition" && member.functionName.value === "init")
    );
}

function updateSyntaxTree(stObject: any, generatedCode: string): Promise<STResponse | {}> {
    let stModification = {
        startLine: stObject.position.endLine,
        startColumn: stObject.position.endColumn,
        endLine: stObject.position.endLine,
        endColumn: stObject.position.endColumn,
        type: "INSERT",
        config: {
            "STATEMENT": generatedCode
        }
    };

    return extendedLangClient.stModify({
        astModifications: [stModification],
        documentIdentifier: {
            uri: Uri.file(filePath).toString()
        }
    });
}

async function updateSourceFile(fileContent: string): Promise<boolean> {
    const doc = workspace.textDocuments.find((doc) => doc.fileName === filePath);
    if (doc) {
        const edit = new WorkspaceEdit();
        edit.replace(Uri.file(filePath), new Range(new Position(0, 0), doc.lineAt(doc.lineCount - 1).range.end), fileContent);
        await workspace.applyEdit(edit);
        extendedLangClient.updateStatusBar();
        return doc.save();
    } else {
        extendedLangClient.didChange({
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
        extendedLangClient.updateStatusBar();
    }
    return false;
}

function generateClientDecl(targetService: Service, targetType: ServiceTypes): string {
    let clientDeclaration: string = `
        @display {
            label: "${targetService.annotation.label}",
            id: "${targetService.annotation.id}"
        }
        ${targetType}:Client ${clientName};
    `;

    return clientDeclaration;
}

function generateServiceInit(): string {
    let serviceInit: string = `function init() returns error? {
                                ${generateClientInit()}
                            }`;
    return serviceInit;
}

function generateClientInit(): string {
    return `self.${clientName} = check new ("");`;
}

function generateImport(targetServiceType: ServiceTypes): string {
    return `import ballerina/${targetServiceType};`;
}

function transformLabel(label: string): string {
    return label.split(ClientVarNameRegex).reduce((varName: string, subname: string) =>
        varName + subname.charAt(0).toUpperCase() + subname.substring(1).toLowerCase(), '');
}
