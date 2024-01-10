/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { responseCodes, STModification } from '@wso2-enterprise/ballerina-core';
import { VersionedTextDocumentIdentifier } from '@wso2-enterprise/ballerina-core';
import { BallerinaRpcClient } from '@wso2-enterprise/ballerina-rpc-client';
import * as Handlebars from 'handlebars';
import { Annotation, NodePosition, OptionalTypeDesc, ResourceAccessorDefinition, ServiceDeclaration, STKindChecker } from "@wso2-enterprise/syntax-tree";
import { URI } from 'vscode-uri';
import { PARAM_TYPES, ParameterConfig, ResourceInfo, ResponseConfig } from '../definitions';

export interface ResourceDefinition {
    METHOD: string;
    PATH: string;
    PARAMETERS: string;
    ADD_RETURN?: string;
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

export async function getServiceST(documentIdentifier: VersionedTextDocumentIdentifier,
    ballerinaRpcClient: BallerinaRpcClient, position: NodePosition): Promise<ServiceDeclaration> {
    const response = await ballerinaRpcClient.getVisualizerRpcClient().getSTByRange({
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

export function getResourceInfo(resource: ResourceAccessorDefinition): ResourceInfo {
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

    // Collect query params
    const queryParams: ParameterConfig[] = [];
    let payloadConfig: ParameterConfig;
    const advanceParams: Map<string, ParameterConfig> = new Map();
    let index = 0;
    resource.functionSignature?.parameters?.forEach((queryParam) => {
        if (!STKindChecker.isCommaToken(queryParam)) {
            if (isAdvancedParam(queryParam?.typeName?.source?.trim())) {
                advanceParams.set(getParamType(queryParam?.typeName?.source?.trim()), {
                    id: index,
                    name: queryParam?.paramName?.value,
                    type: queryParam?.typeName?.source?.trim(),
                    option: getParamType(queryParam?.typeName?.source?.trim()),
                    isRequired: !STKindChecker.isOptionalTypeDesc(queryParam?.typeName),
                });
            } else if (isPayloadParam(queryParam?.annotations)) {
                payloadConfig = {
                    id: index,
                    name: queryParam?.paramName?.value,
                    type: STKindChecker.isOptionalTypeDesc(queryParam?.typeName) ? (queryParam?.typeName as OptionalTypeDesc).typeDescriptor?.source?.trim() : queryParam?.typeName?.source?.trim(),
                    defaultValue: STKindChecker.isDefaultableParam(queryParam) && queryParam?.expression?.source?.trim(),
                    option: getParamType("@http:Payload"),
                    isRequired: !STKindChecker.isOptionalTypeDesc(queryParam?.typeName),
                };
            } else {
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
        }
    });

    index = 0;
    // Collect resource responses
    const response: ResponseConfig[] = [];
    if (resource?.functionSignature?.returnTypeDesc?.type?.typeData?.typeSymbol?.typeKind === "union") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resource?.functionSignature?.returnTypeDesc?.type?.typeData?.typeSymbol?.members?.forEach((member: any) => {
            // eg: record {|int body; readonly ballerina/http:2.9.5:StatusAlreadyReported status; string mediaType?; map<string|int|boolean|string[]|int[]|boolean[]> headers?;|}"
            let type = "";
            let description = "";
            if (member.typeKind === "record") {
                const statusRegex = /readonly\s+ballerina\/http:[\d.]+:(\w+)\s+status;/;
                const statusMatch = member.signature.match(statusRegex);
                const status = statusMatch ? statusMatch[1] : "";
                const subTypeRegex = /\b(\w+)\s+body;/;
                const subTypeMatch =  member.signature.match(subTypeRegex);
                const subtype =  subTypeMatch ? subTypeMatch[1] : "";
                response.push({
                    id: index,
                    code: getCodeFromResponse(`http:${status.replace("Status", "")}`, resource.functionName.value as HTTP_METHOD),
                    description: description,
                    source: getResponseRecordCode(getCodeFromResponse(`http:${status.replace("Status", "")}`, resource.functionName.value as HTTP_METHOD), subtype)
                });
                index++;
            } else if (member.typeKind === "typeReference") {
                description = member.signature;
                response.push({
                    id: index,
                    code: getDefaultResponse(resource.functionName.value as HTTP_METHOD),
                    description: description,
                    type: member.name,
                    source: member.name
                });
                index++;
            } else if (member.typeKind !== "nil") {
                // Check if member next index is nil and add ? to the type, otherwise add the type as member.typeKind
                if (resource?.functionSignature?.returnTypeDesc?.type?.typeData?.typeSymbol?.members[index + 1]?.typeKind === "nil") {
                    type = member.typeKind + "?";
                } else {
                    type = member.typeKind;
                }
                response.push({
                    id: index,
                    code: ((type === "error" || type === "error?") ? 500 : getCodeFromResponse(member.name as string, resource.functionName.value as HTTP_METHOD)),
                    description: description,
                    type: type,
                    source: type
                });
                index++;
            }
        });
    }
    return {
        method: resource.functionName.value,
        path: resourcePath,
        pathSegments: pathParams,
        params: queryParams,
        advancedParams: advanceParams,
        payloadConfig: payloadConfig,
        responses: response,
        ST: resource,
    };
}

export function removeStatement(targetPosition: NodePosition): STModification {
    const removeLine: STModification = {
        type: 'DELETE',
        ...targetPosition
    };

    return removeLine;
}
