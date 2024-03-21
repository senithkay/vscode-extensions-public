/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { responseCodes, STModification } from '@wso2-enterprise/ballerina-core';
import { DocumentIdentifier } from '@wso2-enterprise/ballerina-core';
import { BallerinaRpcClient } from '@wso2-enterprise/ballerina-rpc-client';
import * as Handlebars from 'handlebars';
import { Annotation, NodePosition, OptionalTypeDesc, ResourceAccessorDefinition, ServiceDeclaration, STKindChecker } from "@wso2-enterprise/syntax-tree";
import { URI } from 'vscode-uri';
import { PARAM_TYPES, ParameterConfig, PathConfig, Resource, ResponseConfig, Service, ServiceData } from '@wso2-enterprise/service-designer';

export interface ResourceDefinition {
    METHOD: string;
    PATH: string;
    PARAMETERS: string;
    ADD_RETURN?: string;
}

export interface ServiceDefinition {
    BASE_PATH: string;
    SERVICE_TYPE: string;
    PORT: string;
}

export enum HTTP_METHOD {
    "GET" = "GET",
    "PUT" = "PUT",
    "POST" = "POST",
    "DELETE" = "DELETE",
    "PATCH" = "PATCH"
}

export function generateNewResourceFunction(data: ResourceDefinition): string {
    // Your Handlebars template
    const templateString = `resource function {{{ METHOD }}} {{{ PATH }}} ( {{{ PARAMETERS }}} ) {{#if ADD_RETURN}}returns {{{ADD_RETURN}}}{{/if}} {}`;
    // Compile the template
    const compiledTemplate = Handlebars.compile(templateString);
    // Apply data to the template
    const resultString = compiledTemplate(data);
    return resultString;
}

export function updateResourceFunction(data: ResourceDefinition): string {
    // Your Handlebars template
    const templateString = `{{{ METHOD }}} {{{ PATH }}}({{{ PARAMETERS }}}) {{#if ADD_RETURN}}returns {{{ADD_RETURN}}}{{/if}}`;
    // Compile the template
    const compiledTemplate = Handlebars.compile(templateString);
    // Apply data to the template
    const resultString = compiledTemplate(data);
    return resultString;
}

export function updateServiceDecl(data: ServiceDefinition): string {
    // Your Handlebars template
    const templateString = `service {{{ BASE_PATH }}} on new {{{ SERVICE_TYPE }}}:Listener({{{ PORT }}})`;
    // Compile the template
    const compiledTemplate = Handlebars.compile(templateString);
    // Apply data to the template
    const resultString = compiledTemplate(data);
    return resultString;
}

export function getModification(code: string, targetPosition: NodePosition): STModification {
    return {
        type: "INSERT",
        isImport: false,
        config: {
            "STATEMENT": code
        },
        ...targetPosition
    };
}

export async function getServiceST(documentIdentifier: DocumentIdentifier,
    rpcClient: BallerinaRpcClient, position: NodePosition): Promise<ServiceDeclaration> {
    const response = await rpcClient.getLangServerRpcClient().getSTByRange({
        lineRange: {
            start: {
                line: position.startLine,
                character: position.startColumn
            },
            end: {
                line: position.endLine,
                character: position.endColumn
            }
        },
        documentIdentifier: {
            uri: URI.file(documentIdentifier.uri).toString()
        }
    });
    if (!response.syntaxTree || !STKindChecker.isServiceDeclaration(response.syntaxTree)) {
        throw new Error("Service Syntax tree not found");
    } else {
        return response.syntaxTree;
    }
}

export function getDefaultResponse(httpMethod: HTTP_METHOD): number {
    switch (httpMethod) {
        case HTTP_METHOD.GET:
            return 200;
        case HTTP_METHOD.PUT:
            return 200;
        case HTTP_METHOD.POST:
            return 201;
        case HTTP_METHOD.DELETE:
            return 200;
        case HTTP_METHOD.PATCH:
            return 200;
        default:
            return 200;
    }
}

export function getCodeFromResponse(response: string, httpMethod: HTTP_METHOD): number {
    const code = responseCodes.find((responseCode) => responseCode.source === response);
    return code?.code || getDefaultResponse(httpMethod);
}

export function findResponseCodeByRecordSource(recordSource: string): number {
    const code = responseCodes.find((responseCode) =>  recordSource?.includes(responseCode.source));
    return code?.code || 200;
}

export function getCodeFromSource(response: string, httpMethod: HTTP_METHOD): number {
    const code = responseCodes.find((responseCode) => responseCode.source === response);
    return code?.code || getDefaultResponse(httpMethod);
}

export function getTitleFromResponseCode(code: number): string {
    const response = responseCodes.find((response) => response.code === code);
    return response ? response.title : "";
}

export function getSourceFromResponseCode(code: number): string {
    const response = responseCodes.find((response) => response.code === code);
    return response ? response.source : "";
}

export function getResponseRecordCode(code: number, type: string): string {
    const genCode = `record {|*${getSourceFromResponseCode(code)}; ${type} body;|}`;
    return genCode;
}

export function getResponseRecordDefCode(name: string, code: number, type: string): string {
    const genCode = `type ${name} record {|*${getSourceFromResponseCode(code)}; ${type} body;|};`;
    return genCode;
}

export function getParamType(typeName: string): PARAM_TYPES {
    switch (typeName) {
        case "http:Headers":
        case "@http:Header":
            return PARAM_TYPES.HEADER;
        case "http:Request":
            return PARAM_TYPES.REQUEST;
        case "http:Caller":
            return PARAM_TYPES.CALLER;
        case "@http:Payload":
            return PARAM_TYPES.PAYLOAD;
        default:
            return PARAM_TYPES.DEFAULT;
    }
}

export function isAdvancedParam(type: string): boolean {
    return type === "http:Caller" || type === "http:Request" || type === "http:Headers";
}

export function isPayloadParam(annotations: Annotation[]): boolean {
    return annotations?.some((annotation) => annotation?.source.trim() === "@http:Payload");
}

export function isHeaderParam(annotations: Annotation[]): boolean {
    return annotations?.some((annotation) => annotation?.source.trim() === "@http:Header");
}

export const getRecordSource = async (recordName: string, rpcClient: any): Promise<string> => {
    const response = await rpcClient?.getRecordST({ recordName: recordName });
    return response?.recordST.source;
};

export const getServiceData = async (service: ServiceDeclaration): Promise<ServiceData> => {
    let serviceData: ServiceData;
    if (service && STKindChecker.isExplicitNewExpression(service?.expressions[0])) {
        if (
            STKindChecker.isQualifiedNameReference(
                service.expressions[0].typeDescriptor
            )
        ) {
            const expression = service.expressions[0];
            const port = expression.parenthesizedArgList?.arguments[0]?.source.trim();
            let absolutePath = "";
            service.absoluteResourcePath?.forEach((path) => {
                absolutePath += path.value;
            });
            serviceData = {
                port: parseInt(port, 10),
                path: absolutePath
            };          
        }
    }
    return serviceData;
}

export async function getResource(resource: ResourceAccessorDefinition, rpcClient: any): Promise<Resource> {
    const pathConfig = getResourcePath(resource);
    const queryParams: ParameterConfig[] = getQueryParams(resource);
    const payloadConfig: ParameterConfig = getPayloadConfig(resource);
    const advanceParams: Map<string, ParameterConfig> = getAdvancedParams(resource);
    const response: ResponseConfig[] = await getResponseConfig(resource, rpcClient);
    const position = {
        startLine: resource?.functionName?.position?.startLine,
        startColumn: resource?.functionName?.position?.startColumn,
        endLine: resource?.functionSignature?.position?.endLine,
        endColumn: resource?.functionSignature?.position?.endColumn
    };
    return {
        methods: [resource.functionName.value],
        path: pathConfig.path,
        pathSegments: pathConfig.resources,
        params: queryParams,
        advancedParams: advanceParams,
        payloadConfig: payloadConfig,
        responses: response,
        updatePosition: position,
        position: resource.position
    };
}

export function getServicePosition(service: ServiceDeclaration): NodePosition {
    const serviceKeywordPosition = service.serviceKeyword?.position;
    const serviceExpressionPosition = service.expressions[0]?.position;
    return {
        startLine: serviceKeywordPosition.startLine,
        startColumn: serviceKeywordPosition.startColumn,
        endLine: serviceExpressionPosition.endLine,
        endColumn: serviceExpressionPosition.endColumn
    };
}

export async function getService(serviceDecl: ServiceDeclaration, rpcClient: any): Promise<Service> {
    const serviceData: ServiceData = await getServiceData(serviceDecl);
    const resources: Resource[] = [];
    for (const member of serviceDecl.members) {
        if (STKindChecker.isResourceAccessorDefinition(member)) {
            resources.push(await getResource(member, rpcClient));
        }
    }
    return {
        ...serviceData,
        resources: resources,
        position: getServicePosition(serviceDecl)
    }
}

export async function getResponseConfig(resource: ResourceAccessorDefinition, rpcClient: any): Promise<ResponseConfig[]> {
    let index = 0;
    const response: ResponseConfig[] = [];
    const members = resource?.functionSignature?.returnTypeDesc?.type?.typeData?.typeSymbol?.members;
    if (resource?.functionSignature?.returnTypeDesc?.type?.typeData?.typeSymbol?.typeKind === "union" && members) {
        for (const member of members) {
            let type = "";
            if (member.typeKind === "record") {
                response.push(
                    getInlineRecordConfig(resource, index, member)
                );
                index++;
            } else if (member.typeKind === "typeReference" && !member.signature?.includes("ballerina")) {
                const recordST: string = await getRecordSource(member.name, rpcClient);
                response.push({
                    id: index,
                    code: findResponseCodeByRecordSource(recordST),
                    type: member.name,
                    source: member.name
                });
                index++;
            } else if (member.typeKind !== "nil") {
                type = (members[index + 1]?.typeKind === "nil") ? member.typeKind + "?" : member.typeKind;
                response.push({
                    id: index,
                    code: ((type === "error" || type === "error?") ? 500 : getCodeFromResponse(member.name as string, resource.functionName.value as HTTP_METHOD)),
                    type: type,
                    source: type
                });
                index++;
            }
        }
    } else if (resource?.functionSignature?.returnTypeDesc?.type?.typeData?.typeSymbol) {
        const type = resource?.functionSignature?.returnTypeDesc?.type?.typeData?.typeSymbol?.typeKind;
        response.push({
            id: index,
            code: ((type === "error" || type === "error?") ? 500 : getCodeFromResponse(resource?.functionSignature?.returnTypeDesc?.type?.typeData?.typeSymbol?.name as string, resource.functionName.value as HTTP_METHOD)),
            type: type,
            source: type
        });
    }
    return response;
}

export function getInlineRecordConfig(resource: ResourceAccessorDefinition, index: number, member: any): ResponseConfig {
    const statusRegex = /readonly\s+ballerina\/http:[\d.]+:(\w+)\s+status;/;
    const statusMatch = member.signature.match(statusRegex);
    const status = statusMatch ? statusMatch[1] : "";
    const subTypeRegex = /\b(\w+)\s+body;/;
    const subTypeMatch =  member.signature.match(subTypeRegex);
    const subtype =  subTypeMatch ? subTypeMatch[1] : "";
    return ({
        id: index,
        code: getCodeFromResponse(`http:${status.replace("Status", "")}`, resource.functionName.value as HTTP_METHOD),
        source: getResponseRecordCode(getCodeFromResponse(`http:${status.replace("Status", "")}`, resource.functionName.value as HTTP_METHOD), subtype)
    });
}

export function getResourcePath(resource: ResourceAccessorDefinition): PathConfig {
    let resourcePath = "";
    const pathParams: ParameterConfig[] = [];
    // Collect path segments
    resource.relativeResourcePath?.forEach((path, index) => {
        if (STKindChecker.isResourcePathSegmentParam(path)) {
            pathParams.push({
                id: index,
                name: path?.paramName?.value,
                type: path?.typeDescriptor?.source?.trim(),
            });
        }
        resourcePath += STKindChecker.isResourcePathSegmentParam(path) ? path.source : path?.value;
    });
    return { path: resourcePath, resources: pathParams }; 
}

export function getQueryParams(resource: ResourceAccessorDefinition): ParameterConfig[] {
    const queryParams: ParameterConfig[] = [];
    let index = 0;
    resource.functionSignature?.parameters?.forEach((queryParam) => {
        if (!STKindChecker.isCommaToken(queryParam) && !(isAdvancedParam(queryParam?.typeName?.source?.trim())) && !(isPayloadParam(queryParam?.annotations))) {
            queryParams.push({
                id: index,
                name: queryParam?.paramName?.value,
                type: STKindChecker.isOptionalTypeDesc(queryParam?.typeName) ? (queryParam?.typeName as OptionalTypeDesc).typeDescriptor?.source?.trim() : queryParam?.typeName?.source?.trim(),
                defaultValue: STKindChecker.isDefaultableParam(queryParam) && queryParam?.expression?.source?.trim(),
                option: isHeaderParam(queryParam?.annotations) ? getParamType("@http:Header") : getParamType(queryParam?.typeName?.source?.trim()),
                isRequired: !STKindChecker.isOptionalTypeDesc(queryParam?.typeName),
            });
            index++;
        }
    });
    return queryParams;
}

export function getPayloadConfig(resource: ResourceAccessorDefinition): ParameterConfig {
    let payloadConfig: ParameterConfig;
    resource.functionSignature?.parameters?.forEach((queryParam) => {
        if (!STKindChecker.isCommaToken(queryParam) && isPayloadParam(queryParam?.annotations)) {
            payloadConfig = {
                id: 0,
                name: queryParam?.paramName?.value,
                type: STKindChecker.isOptionalTypeDesc(queryParam?.typeName) ? (queryParam?.typeName as OptionalTypeDesc).typeDescriptor?.source?.trim() : queryParam?.typeName?.source?.trim(),
                defaultValue: STKindChecker.isDefaultableParam(queryParam) && queryParam?.expression?.source?.trim(),
                option: getParamType("@http:Payload"),
                isRequired: !STKindChecker.isOptionalTypeDesc(queryParam?.typeName),
            };
        }
    });
    return payloadConfig;
}

export function getAdvancedParams(resource: ResourceAccessorDefinition): Map<string, ParameterConfig> {
    const advanceParams: Map<string, ParameterConfig> = new Map();
    resource.functionSignature?.parameters?.forEach((queryParam) => {
        if (!STKindChecker.isCommaToken(queryParam) && isAdvancedParam(queryParam?.typeName?.source?.trim())) {
            advanceParams.set(getParamType(queryParam?.typeName?.source?.trim()), {
                id: 0,
                name: queryParam?.paramName?.value,
                type: queryParam?.typeName?.source?.trim(),
                option: getParamType(queryParam?.typeName?.source?.trim()),
                isRequired: !STKindChecker.isOptionalTypeDesc(queryParam?.typeName),
            });
        }
    });
    return advanceParams;
}

export function removeStatement(targetPosition: NodePosition): STModification {
    const removeLine: STModification = {
        type: 'DELETE',
        ...targetPosition
    };

    return removeLine;
}
