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

import { ExtendedLangClient } from "src/core";
import { Uri } from "vscode";
import { camelCase } from "lodash";
import { CMService as Service } from "@wso2-enterprise/ballerina-languageclient";
import { STResponse } from "../../activator";
import { AddLinkArgs, ServiceTypes } from "../../resources";
import { getInitFunction, updateSourceFile, updateSyntaxTree } from "../shared-utils";
import { genClientName, getMainFunction, getMissingImports, getServiceDeclaration } from "./shared-utils";

let clientName: string;

export async function linkServices(langClient: ExtendedLangClient, args: AddLinkArgs): Promise<boolean> {
    const { source, target } = args;
    const filePath: string = args.source.elementLocation.filePath;

    const stResponse: STResponse = await langClient.getSyntaxTree({
        documentIdentifier: {
            uri: Uri.file(filePath).toString()
        }
    }) as STResponse;

    if (stResponse && stResponse.parseSuccess) {
        clientName = genClientName(stResponse.source, transformLabel(target.annotation.label || target.path || target.serviceId));
        const targetType: ServiceTypes = getServiceType(target.serviceType);
        const imports = new Set<string>([`ballerina/${targetType}`]);
        const missingImports: Set<string> = getMissingImports(stResponse.source, imports);
        const clientDecl: string = generateClientDecl(target, targetType, 'serviceId' in source);

        if ('serviceId' in source) {
            return linkFromService(stResponse, source, clientDecl, missingImports, filePath, langClient);
        } else {
            return linkFromMain(stResponse, clientDecl, missingImports, filePath, langClient);
        }
    }
    return false;
}

async function linkFromService(stResponse: STResponse, source: Service, clientDecl: string, imports: Set<string>,
    filePath: string, langClient: ExtendedLangClient): Promise<boolean> {
    const serviceDecl = getServiceDeclaration(stResponse.syntaxTree.members, source, true);
    const initMember = serviceDecl ? getInitFunction(serviceDecl) : undefined;

    let modifiedST: STResponse;
    if (initMember) {
        if (!initMember.functionSignature.returnTypeDesc) {
            modifiedST = await updateSyntaxTree(langClient, filePath, initMember.functionSignature.closeParenToken, ` returns error?`) as STResponse;
        } else if (!initMember.functionSignature.returnTypeDesc.type.source.replace(/\s/g, '').includes('error')) {
            modifiedST = await updateSyntaxTree(langClient, filePath, initMember.functionSignature.returnTypeDesc.type, ` | error?`) as STResponse;
        }
        modifiedST = await updateSyntaxTree(langClient, filePath, serviceDecl.openBraceToken, clientDecl) as STResponse;
        if (modifiedST && modifiedST.parseSuccess) {
            const members: any[] = modifiedST.syntaxTree.members;
            const serviceDecl = getServiceDeclaration(members, source, false);
            const updatedInitMember = serviceDecl ? getInitFunction(serviceDecl) : undefined;
            if (updatedInitMember) {
                modifiedST = await updateSyntaxTree(langClient, filePath, updatedInitMember.functionBody.openBraceToken,
                    generateClientInit(), imports) as STResponse;
                if (modifiedST && modifiedST.parseSuccess) {
                    return updateSourceFile(langClient, filePath, modifiedST.source);
                }
            }
        }
    } else {
        let genCode = `
                    ${clientDecl}
                    ${generateServiceInit()}
                `;
        modifiedST = await updateSyntaxTree(langClient, filePath, serviceDecl.openBraceToken, genCode, imports) as STResponse;
        if (modifiedST && modifiedST.parseSuccess) {
            return updateSourceFile(langClient, filePath, modifiedST.source);
        }
    }
}

async function linkFromMain(stResponse: STResponse, clientDecl: string, missingImports: Set<string>, filePath: string,
    langClient: ExtendedLangClient): Promise<boolean> {
    let mainFunc = getMainFunction(stResponse);
    if (mainFunc) {
        let modifiedST: STResponse;
        if (!mainFunc.functionSignature.returnTypeDesc) {
            modifiedST = await updateSyntaxTree(langClient, filePath, mainFunc.functionSignature.closeParenToken, ` returns error?`) as STResponse;
            mainFunc = getMainFunction(modifiedST);
        } else if (!mainFunc.functionSignature.returnTypeDesc.type.source.replace(/\s/g, '').includes('error')) {
            modifiedST = await updateSyntaxTree(langClient, filePath, mainFunc.functionSignature.returnTypeDesc.type, ` | error?`) as STResponse;
            mainFunc = getMainFunction(modifiedST);
        }
        modifiedST = await updateSyntaxTree(langClient, filePath, mainFunc.functionBody.openBraceToken, clientDecl, missingImports) as STResponse;
        if (modifiedST && modifiedST.parseSuccess) {
            return updateSourceFile(langClient, filePath, modifiedST.source);
        }
    }
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

function generateClientDecl(targetService: Service, targetType: ServiceTypes, isServiceSource: boolean): string {
    let clientDeclaration: string = `
        @display {
            label: "${targetService.annotation.label}",
            id: "${targetService.annotation.id}"
        }
        ${targetType}:Client ${clientName}${isServiceSource ? '' : ' = check new("")'};
    `;

    return clientDeclaration;
}

function transformLabel(rawName: string): string {
    const sansBeginnerNum: string = rawName.replace(/^\d+/, '');
    const camelCaseName: string = camelCase(sansBeginnerNum);
    return `${camelCaseName}Client`;
}

function generateServiceInit(): string {
    return `function init() returns error? {
        ${generateClientInit()}
    }`;
}

function generateClientInit(): string {
    return `self.${clientName} = check new ("");`;
}
