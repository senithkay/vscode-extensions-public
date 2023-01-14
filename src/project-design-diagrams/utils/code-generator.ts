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
import {
    BallerinaConnectorInfo, Connector, GetSyntaxTreeResponse, STModification
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { getFormattedModuleName } from "@wso2-enterprise/ballerina-low-code-edtior-commons/src/utils/Diagram/modification-util";
import { STResponse } from "../activator";
import { Service, ServiceTypes } from "../resources";
import { getConnectorImports, getDefaultParams, getFormFieldReturnType } from "./connector-code-gen-utils";

const ClientVarNameRegex: RegExp = /[^a-zA-Z0-9_]/g;
let clientName: string;

// TODO: Handle errors from the FE
export async function linkServices(langClient: ExtendedLangClient, sourceService: Service, targetService: Service)
    : Promise<boolean> {
    clientName = transformLabel(targetService.annotation.label) || transformLabel(targetService.annotation.id);
    const filePath: string = sourceService.elementLocation.filePath;

    const stResponse: STResponse = await langClient.getSyntaxTree({
        documentIdentifier: {
            uri: Uri.file(filePath).toString()
        }
    }) as STResponse;

    if (stResponse && stResponse.parseSuccess) {
        const targetType: ServiceTypes = getServiceType(targetService.serviceType);
        const imports = new Set<string>([`ballerina/${targetType}`]);

        const members: any[] = stResponse.syntaxTree.members;
        const serviceDecl = getServiceDeclaration(members, sourceService, true);
        const initMember = serviceDecl ? getInitFunction(serviceDecl) : undefined;
        let modifiedST: STResponse;

        if (initMember) {
            modifiedST = await updateSyntaxTree(langClient, filePath, serviceDecl.openBraceToken,
                generateClientDecl(targetService, targetType)) as STResponse;
            if (modifiedST && modifiedST.parseSuccess) {
                const members: any[] = modifiedST.syntaxTree.members;
                const serviceDecl = getServiceDeclaration(members, sourceService, false);
                const updatedInitMember = serviceDecl ? getInitFunction(serviceDecl) : undefined;
                if (updatedInitMember) {
                    modifiedST = await updateSyntaxTree(langClient, filePath, updatedInitMember.functionBody.openBraceToken,
                        generateClientInit(), getMissingImports(modifiedST.source, imports)) as STResponse;
                    if (modifiedST && modifiedST.parseSuccess) {
                        return updateSourceFile(langClient, filePath, modifiedST.source);
                    }
                }
            }
        } else {
            let genCode = `
                    ${generateClientDecl(targetService, targetType)}
                    ${generateServiceInit()}
                `;
            modifiedST = await updateSyntaxTree(langClient, filePath, serviceDecl.openBraceToken, genCode,
                getMissingImports(stResponse.source, imports)) as STResponse;
            if (modifiedST && modifiedST.parseSuccess) {
                return updateSourceFile(langClient, filePath, modifiedST.source);
            }
        }
    }
    return false;
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
    const serviceDecl = getServiceDeclaration(members, targetService, true);

    const connectorInfo = await fetchConnectorInfo(langClient, connector);
    if (!(connectorInfo && connectorInfo.moduleName)) {
        return false;
    }

    const imports = getConnectorImports((stResponse as GetSyntaxTreeResponse).syntaxTree,
        connectorInfo.package.organization, connectorInfo.moduleName);

    const initMember = getInitFunction(serviceDecl);
    if (initMember) {
        const updatedSTRes = await updateSyntaxTree(langClient, filePath, serviceDecl.openBraceToken,
            generateConnectorClientDecl(connectorInfo), imports);
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
                    updatedInitMember.functionBody.openBraceToken,
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
            ${generateServiceInit(connectorInfo)}
        `;
        const modifiedST = (await updateSyntaxTree(langClient, filePath, serviceDecl.openBraceToken, template, imports)) as STResponse;
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

function getServiceDeclaration(members: any[], service: Service, checkEnd: boolean): any {
    return members.find((member) => (
        member.kind === "ServiceDeclaration" &&
        service.elementLocation.startPosition.line === member.position.startLine &&
        service.elementLocation.startPosition.offset === member.position.startColumn && (
            checkEnd ? service.elementLocation.endPosition.line === member.position.endLine &&
                service.elementLocation.endPosition.offset === member.position.endColumn : true
        )
    ));
}

function getInitFunction(serviceDeclaration: any): any {
    const serviceNodeMembers: any[] = serviceDeclaration.members;
    return serviceNodeMembers.find((member) =>
        (member.kind === "ObjectMethodDefinition" && member.functionName.value === "init")
    );
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
        startLine: stObject.position.endLine,
        startColumn: stObject.position.endColumn,
        endLine: stObject.position.endLine,
        endColumn: stObject.position.endColumn,
        type: "INSERT",
        config: {
            STATEMENT: generatedCode,
        }
    });

    return langClient.stModify({
        astModifications: modifications,
        documentIdentifier: {
            uri: Uri.file(filePath).toString(),
        }
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

function generateServiceInit(connectorInfo?: BallerinaConnectorInfo): string {
    let serviceInit: string = `function init() returns error? {
        ${connectorInfo ? generateConnectorClientInit(connectorInfo) : generateClientInit()}
    }`;
    return serviceInit;
}

function generateClientInit(): string {
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
