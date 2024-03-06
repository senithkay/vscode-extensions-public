/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ExtendedLangClient } from "src/core";
import { Uri } from "vscode";
import { camelCase } from "lodash";
import { CMService as Service } from "@wso2-enterprise/ballerina-languageclient";
import { AddLinkArgs, ServiceTypes } from "../../../../project-design-diagrams/resources";
import { getInitFunction, updateSourceFile, updateSyntaxTree } from "../shared-utils";
import { genClientName, getMainFunction, getMissingImports, getServiceDeclaration } from "./shared-utils";
import { BallerinaSTModifyResponse } from "@wso2-enterprise/ballerina-core";
import { FunctionBodyBlock } from "@wso2-enterprise/syntax-tree";

let clientName: string;

export async function linkServices(langClient: ExtendedLangClient, args: AddLinkArgs): Promise<boolean> {
    const { source, target } = args;
    const filePath: string = args.source.sourceLocation.filePath;

    const stResponse: BallerinaSTModifyResponse = await langClient.getSyntaxTree({
        documentIdentifier: {
            uri: Uri.file(filePath).toString()
        }
    }) as BallerinaSTModifyResponse;

    if (stResponse && stResponse.parseSuccess) {
        clientName = genClientName(stResponse.source, transformLabel(target.label || target.annotation.label || target.id));
        const targetType: ServiceTypes = getServiceType(target.type);
        const imports = new Set<string>([`ballerina/${targetType}`]);
        const missingImports: Set<string> = getMissingImports(stResponse.source, imports);
        const clientDecl: string = generateClientDecl(target, targetType, 'serviceId' in source);

        if ('resourceFunctions' in source) {
            return linkFromService(stResponse, source, clientDecl, missingImports, filePath, langClient);
        } else {
            return linkFromMain(stResponse, clientDecl, missingImports, filePath, langClient);
        }
    }
    return false;
}

async function linkFromService(stResponse: BallerinaSTModifyResponse, source: Service, clientDecl: string, imports: Set<string>,
    filePath: string, langClient: ExtendedLangClient): Promise<boolean> {
    const serviceDecl = getServiceDeclaration(stResponse.syntaxTree.members, source, true);
    const initMember = serviceDecl ? getInitFunction(serviceDecl) : undefined;

    let modifiedST: BallerinaSTModifyResponse;
    if (initMember) {
        if (!initMember.functionSignature.returnTypeDesc) {
            modifiedST = await updateSyntaxTree(langClient, filePath, initMember.functionSignature.closeParenToken, ` returns error?`) as BallerinaSTModifyResponse;
        } else if (!initMember.functionSignature.returnTypeDesc.type.source.replace(/\s/g, '').includes('error')) {
            modifiedST = await updateSyntaxTree(langClient, filePath, initMember.functionSignature.returnTypeDesc.type, ` | error?`) as BallerinaSTModifyResponse;
        }
        modifiedST = await updateSyntaxTree(langClient, filePath, serviceDecl.openBraceToken, clientDecl) as BallerinaSTModifyResponse;
        if (modifiedST && modifiedST.parseSuccess) {
            const members: any[] = modifiedST.syntaxTree.members;
            const serviceDecl = getServiceDeclaration(members, source, false);
            const updatedInitMember = serviceDecl ? getInitFunction(serviceDecl) : undefined;
            if (updatedInitMember) {
                modifiedST = await updateSyntaxTree(langClient, filePath, updatedInitMember.functionBody.openBraceToken,
                    generateClientInit(), imports) as BallerinaSTModifyResponse;
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
        modifiedST = await updateSyntaxTree(langClient, filePath, serviceDecl.openBraceToken, genCode, imports) as BallerinaSTModifyResponse;
        if (modifiedST && modifiedST.parseSuccess) {
            return updateSourceFile(langClient, filePath, modifiedST.source);
        }
    }
}

async function linkFromMain(stResponse: BallerinaSTModifyResponse, clientDecl: string, missingImports: Set<string>, filePath: string,
    langClient: ExtendedLangClient): Promise<boolean> {
    let mainFunc = getMainFunction(stResponse);
    if (mainFunc) {
        let modifiedST: BallerinaSTModifyResponse;
        if (!mainFunc.functionSignature.returnTypeDesc) {
            modifiedST = await updateSyntaxTree(langClient, filePath, mainFunc.functionSignature.closeParenToken, ` returns error?`) as BallerinaSTModifyResponse;
            mainFunc = getMainFunction(modifiedST);
        } else if (!mainFunc.functionSignature.returnTypeDesc.type.source.replace(/\s/g, '').includes('error')) {
            modifiedST = await updateSyntaxTree(langClient, filePath, mainFunc.functionSignature.returnTypeDesc.type, ` | error?`) as BallerinaSTModifyResponse;
            mainFunc = getMainFunction(modifiedST);
        }
        const funcBody = mainFunc.functionBody as FunctionBodyBlock;
        modifiedST = await updateSyntaxTree(langClient, filePath, funcBody.openBraceToken, clientDecl, missingImports) as BallerinaSTModifyResponse;
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
            label: "${targetService.label}",
            id: "${targetService.id}"
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
