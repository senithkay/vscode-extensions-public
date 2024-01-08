/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { STModification } from '@wso2-enterprise/ballerina-core';
import { VersionedTextDocumentIdentifier } from '@wso2-enterprise/ballerina-core';
import { BallerinaRpcClient } from '@wso2-enterprise/ballerina-rpc-client';
import * as Handlebars from 'handlebars';
import { Annotation, NodePosition, OptionalTypeDesc, ResourceAccessorDefinition, ServiceDeclaration, STKindChecker } from "@wso2-enterprise/syntax-tree";
import { URI } from 'vscode-uri';
import { PARAM_TYPES, ParameterConfig, ResourceInfo, ResponseCode, ResponseConfig } from '../definitions';

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

export const responseCodes: ResponseCode[] = [
    { code: 200, title: "200 - OK", source: "http:Ok" },
    { code: 100, title: "100 - Continue", source: "http:Continue" },
    { code: 101, title: "101 - Switching Protocols", source: "http:SwitchingProtocols" },
    { code: 201, title: "201 - Created", source: "http:Created" },
    { code: 202, title: "202 - Accepted", source: "http:Accepted" },
    { code: 203, title: "203 - Non-Authoritative Information", source: "http:NonAuthoritativeInformation" },
    { code: 204, title: "204 - No Content", source: "http:NoContent" },
    { code: 205, title: "205 - Reset Content", source: "http:ResetContent" },
    { code: 206, title: "206 - Partial Content", source: "http:PartialContent" },
    { code: 207, title: "207 - Multi-Status", source: "http:MultiStatus" },
    { code: 208, title: "208 - Already Reported", source: "http:AlreadyReported" },
    { code: 226, title: "226 - IM Used", source: "http:IMUsed" },
    { code: 300, title: "300 - Multiple Choices", source: "http:MultipleChoices" },
    { code: 301, title: "301 - Moved Permanently", source: "http:MovedPermanently" },
    { code: 302, title: "302 - Found", source: "http:Found" },
    { code: 303, title: "303 - See Other", source: "http:SeeOther" },
    { code: 304, title: "304 - Not Modified", source: "http:NotModified" },
    { code: 305, title: "305 - Use Proxy", source: "http:UseProxy" },
    { code: 307, title: "307 - Temporary Redirect", source: "http:TemporaryRedirect" },
    { code: 308, title: "308 - Permanent Redirect", source: "http:PermanentRedirect" },
    { code: 400, title: "400 - Bad Request", source: "http:BadRequest" },
    { code: 401, title: "401 - Unauthorized", source: "http:Unauthorized" },
    { code: 402, title: "402 - Payment Required", source: "http:PaymentRequired" },
    { code: 403, title: "403 - Forbidden", source: "http:Forbidden" },
    { code: 404, title: "404 - Not Found", source: "http:NotFound" },
    { code: 405, title: "405 - Method Not Allowed", source: "http:MethodNotAllowed" },
    { code: 406, title: "406 - Not Acceptable", source: "http:NotAcceptable" },
    { code: 407, title: "407 - Proxy Authentication Required", source: "http:ProxyAuthenticationRequired" },
    { code: 408, title: "408 - Request Timeout", source: "http:RequestTimeout" },
    { code: 409, title: "409 - Conflict", source: "http:Conflict" },
    { code: 410, title: "410 - Gone", source: "http:Gone" },
    { code: 411, title: "411 - Length Required", source: "http:LengthRequired" },
    { code: 412, title: "412 - Precondition Failed", source: "http:PreconditionFailed" },
    { code: 413, title: "413 - Payload Too Large", source: "http:PayloadTooLarge" },
    { code: 414, title: "414 - URI Too Long", source: "http:UriTooLong" },
    { code: 415, title: "415 - Unsupported Media Type", source: "http:UnsupportedMediaType" },
    { code: 416, title: "416 - Range Not Satisfiable", source: "http:RangeNotSatisfiable" },
    { code: 417, title: "417 - Expectation Failed", source: "http:ExpectationFailed" },
    { code: 422, title: "422 - Unprocessable Entity", source: "http:UnprocessableEntity" },
    { code: 423, title: "423 - Locked", source: "http:Locked" },
    { code: 424, title: "424 - Failed Dependency", source: "http:FailedDependency" },
    { code: 425, title: "425 - Too Early", source: "http:TooEarly" },
    { code: 426, title: "426 - Upgrade Required", source: "http:UpgradeRequired" },
    { code: 428, title: "428 - Precondition Required", source: "http:PreconditionRequired" },
    { code: 429, title: "429 - Too Many Requests", source: "http:TooManyRequests" },
    { code: 431, title: "431 - Request Header Fields Too Large", source: "http:RequestHeaderFieldsTooLarge" },
    { code: 451, title: "451 - Unavailable Due To Legal Reasons", source: "http:UnavailableDueToLegalReasons" },
    { code: 500, title: "500 - Internal Server Error", source: "http:InternalServerError" },
    { code: 501, title: "501 - Not Implemented", source: "http:NotImplemented" },
    { code: 502, title: "502 - Bad Gateway", source: "http:BadGateway" },
    { code: 503, title: "503 - Service Unavailable", source: "http:ServiceUnavailable" },
    { code: 504, title: "504 - Gateway Timeout", source: "http:GatewayTimeout" },
    { code: 505, title: "505 - HTTP Version Not Supported", source: "http:HttpVersionNotSupported" },
    { code: 506, title: "506 - Variant Also Negotiates", source: "http:VariantAlsoNegotiates" },
    { code: 507, title: "507 - Insufficient Storage", source: "http:InsufficientStorage" },
    { code: 508, title: "508 - Loop Detected", source: "http:LoopDetected" },
    { code: 510, title: "510 - Not Extended", source: "http:NotExtended" },
    { code: 511, title: "511 - Network Authentication Required", source: "http:NetworkAuthorizationRequired" }
]

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

    // Collect resource responses
    const response: ResponseConfig[] = [];
    if (resource?.functionSignature?.returnTypeDesc?.type?.typeData?.typeSymbol?.typeKind === "union") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resource?.functionSignature?.returnTypeDesc?.type?.typeData?.typeSymbol?.members?.forEach((member: any, index: number) => {
            // eg: record {|int body; readonly ballerina/http:2.9.5:StatusAlreadyReported status; string mediaType?; map<string|int|boolean|string[]|int[]|boolean[]> headers?;|}"
            let subtype = "";
            let type = "";
            let description = "";
            if (member.typeKind === "record") {
                const parts = member.signature.split(/\brecord\s*\{/);
                if (parts.length === 2) {
                    subtype = parts[1].trim().split(/\s+/)[0];
                }
                response.push({
                    id: index,
                    code: getCodeFromResponse(member.name as string, resource.functionName.value as HTTP_METHOD),
                    description: description,
                    type: subtype ? subtype : type,
    
                });
            } else if (member.typeKind === "typeReference") {
                type = member.name;
                description = member.signature;
                response.push({
                    id: index,
                    code: getCodeFromResponse(member.name as string, resource.functionName.value as HTTP_METHOD),
                    description: description,
                    type: subtype ? subtype : type,
    
                });
            } else if (member.typeKind !== "nil") {
                // Check if member next index is nil and add ? to the type, otherwise add the type as member.typeKind
                if (resource?.functionSignature?.returnTypeDesc?.type?.typeData?.typeSymbol?.members[index + 1]?.typeKind === "nil") {
                    type = member.typeKind + "?";
                } else {
                    type = member.typeKind;
                }
                response.push({
                    id: index,
                    code: getCodeFromResponse(member.name as string, resource.functionName.value as HTTP_METHOD),
                    description: description,
                    type: subtype ? subtype : type,
    
                });
            }
        });
    } else {
        response.push({
            id: index,
            code: getCodeFromResponse("", resource.functionName.value as HTTP_METHOD),
            type: resource?.functionSignature?.returnTypeDesc?.type?.typeData?.typeSymbol?.typeKind,
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
