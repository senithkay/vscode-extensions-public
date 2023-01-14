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
import { BallerinaConnectorInfo, Connector, GetSyntaxTreeResponse, STModification } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { getFormattedModuleName } from "@wso2-enterprise/ballerina-low-code-edtior-commons/src/utils/Diagram/modification-util";
import { STResponse } from "../activator";
import { Service } from "../resources";
import { getConnectorImports, getDefaultParams, getFormFieldReturnType } from "./connector-code-gen-utils";
import { runBackgroundTerminalCommand } from "../../utils/runCommand";

const ClientVarNameRegex: RegExp = /[^a-zA-Z0-9_]/g;
let clientName: string;

export async function linkServices(langClient: ExtendedLangClient, sourceService: Service, targetService: Service)
    : Promise<boolean> {
    const filePath: string = sourceService.elementLocation.filePath;
    clientName = transformLabel(targetService.annotation.label) || transformLabel(targetService.annotation.id);

    langClient.getSyntaxTree({
        documentIdentifier: {
            uri: Uri.file(filePath).toString()
        }
    }).then((response: any) => {
        const stResponse = response as STResponse;
        if (stResponse && stResponse.parseSuccess) {
            const members: any[] = stResponse.syntaxTree.members;
            const serviceDecl = members.find((member) => (
                member.kind === "ServiceDeclaration" &&
                sourceService.elementLocation.startPosition.line === member.position.startLine &&
                sourceService.elementLocation.endPosition.line === member.position.endLine &&
                sourceService.elementLocation.startPosition.offset === member.position.startColumn &&
                sourceService.elementLocation.endPosition.offset === member.position.endColumn
            ));

            const initMember = getInitFunction(serviceDecl);

            if (initMember) {
                updateSyntaxTree(langClient, filePath, serviceDecl, generateClientDecl(targetService))
                    .then((response) => {
                        let modifiedST = response as STResponse;
                        if (modifiedST && modifiedST.parseSuccess) {
                            updateSourceFile(langClient, filePath, modifiedST.source).then(() => {
                                const members: any[] = modifiedST.syntaxTree.members;
                                const serviceDecl = members.find((member) => (
                                    member.kind === "ServiceDeclaration" &&
                                    sourceService.elementLocation.startPosition.line === member.position.startLine &&
                                    sourceService.elementLocation.startPosition.offset === member.position.startColumn
                                ));

                                const updatedInitMember = getInitFunction(serviceDecl);
                                if (updatedInitMember) {
                                    updateSyntaxTree(langClient, filePath, updatedInitMember.functionBody,
                                        generateClientInit(targetService)).then((response) => {
                                            modifiedST = response as STResponse;
                                            if (modifiedST && modifiedST.parseSuccess) {
                                                return updateSourceFile(langClient, filePath, modifiedST.source);
                                            }
                                        })
                                }
                            })
                        }
                    })
            } else {
                let genCode = `
                        ${generateClientDecl(targetService)}
                        ${generateServiceInit(targetService)}
                    `;
                updateSyntaxTree(langClient, filePath, serviceDecl, genCode).then((response) => {
                    const modifiedST = response as STResponse;
                    if (modifiedST && modifiedST.parseSuccess) {
                        return updateSourceFile(langClient, filePath, modifiedST.source);
                    }
                })
            }
        }
    });

    return false;
}

export async function pullConnector(langClient: ExtendedLangClient, connector: Connector, targetService: Service): Promise<boolean> {
    const filePath: string = targetService.elementLocation.filePath;
    const stResponse = await langClient.getSyntaxTree({
        documentIdentifier: {
            uri: Uri.file(filePath).toString(),
        },
    });
    if (!(stResponse as GetSyntaxTreeResponse)?.parseSuccess) {
        return false;
    }
    if(!connector.moduleName){
        return false;
    }
    const imports = getConnectorImports((stResponse as GetSyntaxTreeResponse).syntaxTree, connector.package.organization, connector.moduleName);
    if (imports && imports?.size > 0) {
        let pullCommand = "";
        imports.forEach(function (impt) {
            if (pullCommand !== "") {
                pullCommand += ` && `;
            }
            pullCommand += `bal pull ${impt.replace(" as _", "")}`;
        });
        console.log('running terminal command:', pullCommand);
        const cmdRes = await runBackgroundTerminalCommand(pullCommand);
        console.log('terminal command message:', cmdRes);
        if(cmdRes.error && cmdRes.message.indexOf("package already exists") < 0){
            return false;
        }
    }
    return true;
}

export async function addConnector(langClient: ExtendedLangClient, connector: Connector, targetService: Service): Promise<boolean> {
    const filePath: string = targetService.elementLocation.filePath;

    const stResponse = await langClient.getSyntaxTree({
        documentIdentifier: {
            uri: Uri.file(filePath).toString(),
        },
    });
    if (!(stResponse as GetSyntaxTreeResponse)?.parseSuccess) {
        return false;
    }

    const members: any[] = (stResponse as GetSyntaxTreeResponse).syntaxTree.members;
    const serviceDecl = members.find(
        (member) =>
            member.kind === "ServiceDeclaration" &&
            targetService.elementLocation.startPosition.line === member.position.startLine &&
            targetService.elementLocation.endPosition.line === member.position.endLine &&
            targetService.elementLocation.startPosition.offset === member.position.startColumn &&
            targetService.elementLocation.endPosition.offset === member.position.endColumn
    );

    const connectorInfo = await fetchConnectorInfo(langClient, connector);
    if (!(connectorInfo && connectorInfo.moduleName)) {
        return false;
    }

    const imports = getConnectorImports((stResponse as GetSyntaxTreeResponse).syntaxTree, connectorInfo.package.organization, connectorInfo.moduleName);

    const initMember = getInitFunction(serviceDecl);
    if (initMember) {
        const updatedSTRes = await updateSyntaxTree(langClient, filePath, serviceDecl, generateConnectorClientDecl(connectorInfo), imports);
        let updatedST = updatedSTRes as STResponse;
        if (updatedST?.parseSuccess) {
            await updateSourceFile(langClient, filePath, updatedST.source);
            const newLines = imports.size || 0;
            const serviceDecl = updatedST.syntaxTree.members.find(
                (member) =>
                    member.kind === "ServiceDeclaration" &&
                    targetService.elementLocation.startPosition.line + newLines === member.position.startLine &&
                    targetService.elementLocation.startPosition.offset === member.position.startColumn
            );          

            const updatedInitMember = getInitFunction(serviceDecl);
            if (updatedInitMember) {
                const modifiedST = (await updateSyntaxTree(
                    langClient,
                    filePath,
                    updatedInitMember.functionBody,
                    generateConnectorClientInit(connectorInfo),
                    getMissingImports(updatedST.source, imports)
                )) as STResponse;
                if (modifiedST && modifiedST.parseSuccess) {
                    return await updateSourceFile(langClient, filePath, modifiedST.source);
                }
            }
        }
    } else {
        const template = `
            ${generateConnectorClientDecl(connectorInfo)}
            ${generateServiceInit(targetService, connectorInfo)}
        `;
        const modifiedST = (await updateSyntaxTree(langClient, filePath, serviceDecl, template, imports)) as STResponse;
        if (modifiedST && modifiedST.parseSuccess) {
            return await updateSourceFile(langClient, filePath, modifiedST.source);
        }
    }

    return false;
}

async function fetchConnectorInfo(langClient: ExtendedLangClient, connector: Connector): Promise<BallerinaConnectorInfo | undefined> {
    const connectorRes = await langClient.getConnector({
        name: connector.name,
        package: connector.package,
        id: connector.id,
    });
    if ((connectorRes as BallerinaConnectorInfo)?.functions?.length > 0) {
        return connectorRes as BallerinaConnectorInfo;
    }
    return undefined;
}


function getInitFunction(serviceDeclaration: any): any {
    const serviceNodeMembers: any[] = serviceDeclaration.members;
    const initMember = serviceNodeMembers.find((member) =>
        (member.kind === "ObjectMethodDefinition" && member.functionName.value === "init")
    );
    return initMember;
}

async function updateSyntaxTree(
    langClient: ExtendedLangClient,
    filePath: string,
    stObject: any,
    generatedCode: string,
    imports?: Set<string>
): Promise<STResponse | {}> {
    const modifications: STModification[] = [];

    if (imports && imports?.size > 0) {
        imports.forEach(function (stmt) {
            modifications.push({
                startLine: 0,
                startColumn: 0,
                endLine: 0,
                endColumn: 0,
                type: "INSERT",
                config: {
                    STATEMENT: `import ${stmt};`,
                },
                isImport: true,
            });
        });
    }

    modifications.push({
        startLine: stObject.openBraceToken.position.endLine,
        startColumn: stObject.openBraceToken.position.endColumn,
        endLine: stObject.openBraceToken.position.endLine,
        endColumn: stObject.openBraceToken.position.endColumn,
        type: "INSERT",
        config: {
            STATEMENT: generatedCode,
        },
    });

    return langClient.stModify({
        astModifications: modifications,
        documentIdentifier: {
            uri: Uri.file(filePath).toString(),
        },
    });
}

async function updateSourceFile(langClient: ExtendedLangClient, filePath: string, fileContent: string): Promise<boolean> {
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
        http:Client ${clientName};
    `;

    return clientDeclaration;
}

function generateServiceInit(targetService: Service, connectorInfo?: BallerinaConnectorInfo): string {
    let serviceInit: string = `function init() returns error? {
        ${connectorInfo ? generateConnectorClientInit(connectorInfo) : generateClientInit(targetService)}
    }`;
    return serviceInit;
}

function generateClientInit(targetService: Service): string {
    return `self.${clientName} = check new ("");`;
}

function generateConnectorClientDecl(connector: BallerinaConnectorInfo): string {
    if (!connector?.moduleName) {
        return "";
    }
    const moduleName = getFormattedModuleName(connector.moduleName);
    const epName = genVarName(moduleName);
    let clientDeclaration: string = `
        @display {
            label: "${connector.displayName || moduleName}",
            id: "${moduleName}-${connector.id}"
        }
        ${moduleName}:${connector.name} ${epName};
    `;

    return clientDeclaration;
}

function generateConnectorClientInit(connector: BallerinaConnectorInfo): string {
    if (!connector?.moduleName) {
        return "";
    }
    const moduleName = getFormattedModuleName(connector.moduleName);
    const epName = genVarName(moduleName);

    const initFunction = connector.functions?.find((func) => func.name === "init");
    if (!initFunction?.returnType) {
        return "";
    }

    const defaultParameters = getDefaultParams(initFunction.parameters);
    const returnType = getFormFieldReturnType(initFunction.returnType);

    return `self.${epName} = ${returnType?.hasError ? "check" : ""} new (${defaultParameters.join()});`;
}

function getMissingImports(source: string, imports: Set<string>) {
    const missingImports = new Set<string>();
    if (imports && imports?.size > 0) {
        imports.forEach(function (stmt) {
            if (!source.includes(`import ${stmt};`)) {
                missingImports.add(stmt);
            }
        });
    }
    return missingImports;
}

function genVarName(label: string) {
    return `${label}Ep`; //TODO: validate name generation with duplications
}

function transformLabel(label: string): string {
    return label.split(ClientVarNameRegex).reduce((varName: string, subname: string) =>
        varName + subname.charAt(0).toUpperCase() + subname.substring(1).toLowerCase(), '');
}
