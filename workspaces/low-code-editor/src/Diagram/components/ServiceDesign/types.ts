/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import { DiagramDiagnostic } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

export interface PathSegment {
    id: number;
    isParam: boolean;
    type?: string;
    name: string;
    isLastSlash?: boolean;
}

export interface Path {
    segments: PathSegment[];
}

export interface QueryParam {
    id: number;
    type: string;
    name: string;
    option: string;
    mappedName?: string;
    defaultValue?: string;
}

export interface ReturnType {
    id: number;
    type: string;
    isOptional: boolean
}

export interface ReturnTypeCollection {
    types: ReturnType[];
    defaultReturnValue?: string;
}

export interface QueryParamCollection {
    queryParams: QueryParam[];
}

export interface Resource {
    id: number;
    method: string;
    path: string;
    queryParams?: string;
    payload?: string;
    payloadError?: boolean;
    isCaller?: boolean;
    isRequest?: boolean;
    returnType?: string;
    isPathDuplicated?: boolean;
    returnTypeDefaultValue?: string;
    initialPathDiagnostics?: DiagramDiagnostic[];
}

export interface Payload {
    type: string;
    name: string;
    defaultValue?: string;
}

export interface AdvancedParams {
    payload?: Payload;
    requestParamName?: string;
    callerParamName?: string;
    headerParamName?: string;
}

export interface ResourceDiagnostics {
    queryNameSemDiagnostic?: string;
    queryTypeSemDiagnostic?: string;
    payloadNameSemDiagnostic?: string;
    payloadTypeSemDiagnostic?: string;
    callerNameSemDiagnostics?: string;
    requestNameSemDiagnostics?: string;
    headersNameSemDiagnostics?: string;
}

export interface Advanced {
    isCaller?: boolean;
    isRequest?: boolean;
}

export interface AdvancedResourceState {
    path: Map<number, boolean>;
    payloadSelected: Map<number, boolean>;
}

interface ResponseCode {
    code: number;
    title: string;
    source: string;
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
