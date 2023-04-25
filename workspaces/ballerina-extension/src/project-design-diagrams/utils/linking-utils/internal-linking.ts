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
import { ServiceTypes } from "../../resources";
import { getInitFunction, updateSourceFile, updateSyntaxTree } from "../shared-utils";
import { genClientName, getMissingImports, getServiceDeclaration } from "./shared-utils";

let clientName: string;

// TODO: Handle errors from the FE
export async function linkServices(langClient: ExtendedLangClient, sourceService: Service, targetService: Service)
    : Promise<boolean> {
    const filePath: string = sourceService.elementLocation.filePath;

    const stResponse: STResponse = await langClient.getSyntaxTree({
        documentIdentifier: {
            uri: Uri.file(filePath).toString()
        }
    }) as STResponse;

    if (stResponse && stResponse.parseSuccess) {
        clientName = genClientName(stResponse.source,
            transformLabel(targetService.annotation.label || targetService.path || targetService.serviceId));

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
