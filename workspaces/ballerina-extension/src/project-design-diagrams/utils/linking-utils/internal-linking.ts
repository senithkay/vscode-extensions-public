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
import { genClientName, getMissingImports, getServiceDeclaration } from "./shared-utils";

let clientName: string;
let sourceFilePath: string;
let extLangClient: ExtendedLangClient;

// TODO: Handle errors from the FE
export async function linkServices(langClient: ExtendedLangClient, args: AddLinkArgs): Promise<boolean> {
    const { source, target } = args;
    sourceFilePath = source.elementLocation.filePath;
    extLangClient = langClient;

    const stResponse: STResponse = await langClient.getSyntaxTree({
        documentIdentifier: {
            uri: Uri.file(sourceFilePath).toString()
        }
    }) as STResponse;

    if (stResponse && stResponse.parseSuccess) {
        clientName = genClientName(stResponse.source, transformLabel(target.annotation.label || target.path || target.serviceId));
        const targetType: ServiceTypes = getServiceType(target.serviceType);
        const imports = new Set<string>([`ballerina/${targetType}`]);
        const missingImports: Set<string> = getMissingImports(stResponse.source, imports);
        const clientDecl: string = generateClientDecl(target, targetType, 'serviceId' in source);

        if ('serviceId' in source) {
            return linkFromService(stResponse, source, clientDecl, missingImports);
        } else {
            return linkFromMain(stResponse, clientDecl, missingImports);
        }
    }
    return false;
}

async function linkFromService(stResponse: STResponse, source: Service, clientDecl: string, imports: Set<string>) {
    const serviceDecl = getServiceDeclaration(stResponse.syntaxTree.members, source, true);
    const initMember = serviceDecl ? getInitFunction(serviceDecl) : undefined;

    let modifiedST: STResponse;
    if (initMember) {
        if (!initMember.functionSignature.returnTypeDesc) {
            modifiedST = await updateSyntaxTree(extLangClient, sourceFilePath, initMember.functionSignature.closeParenToken, ` returns error?`) as STResponse;
        }
        modifiedST = await updateSyntaxTree(extLangClient, sourceFilePath, serviceDecl.openBraceToken, clientDecl) as STResponse;
        if (modifiedST && modifiedST.parseSuccess) {
            const members: any[] = modifiedST.syntaxTree.members;
            const serviceDecl = getServiceDeclaration(members, source, false);
            const updatedInitMember = serviceDecl ? getInitFunction(serviceDecl) : undefined;
            if (updatedInitMember) {
                modifiedST = await updateSyntaxTree(extLangClient, sourceFilePath, updatedInitMember.functionBody.openBraceToken,
                    generateClientInit(), imports) as STResponse;
                if (modifiedST && modifiedST.parseSuccess) {
                    return updateSourceFile(extLangClient, sourceFilePath, modifiedST.source);
                }
            }
        }
    } else {
        let genCode = `
                    ${clientDecl}
                    ${generateServiceInit()}
                `;
        modifiedST = await updateSyntaxTree(extLangClient, sourceFilePath, serviceDecl.openBraceToken, genCode, imports) as STResponse;
        if (modifiedST && modifiedST.parseSuccess) {
            return updateSourceFile(extLangClient, sourceFilePath, modifiedST.source);
        }
    }
}

async function linkFromMain(stResponse: STResponse, clientDecl: string, missingImports: Set<string>) {
    const mainFunc = stResponse.syntaxTree.members.find((member: any) => member.kind === 'FunctionDefinition'
        && member.functionName.value === 'main');
    if (mainFunc) {
        const modifiedST = await updateSyntaxTree(extLangClient, sourceFilePath, mainFunc.functionBody.openBraceToken, clientDecl, missingImports) as STResponse;
        if (modifiedST && modifiedST.parseSuccess) {
            return updateSourceFile(extLangClient, sourceFilePath, modifiedST.source);
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
