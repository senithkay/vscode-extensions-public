/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

export interface OpenAPI {
    openapi: string;
    info: Info;
    paths: Paths;
    components?: Components;
    servers?: Server[]; // Added to handle servers
    [key: string]: any; // To accommodate extensions and additional properties
}

export interface Info {
    title: string;
    version: string;
    description?: string;
    termsOfService?: string;
    contact?: Contact;
    license?: License;
    summary?: string;
    [key: string]: any;
}

export interface Contact {
    name?: string;
    url?: string;
    email?: string;
    [key: string]: any;
}

export interface License {
    name: string;
    url?: string;
    identifier?: string;
    [key: string]: any;
}

export interface Paths {
    [path: string]: PathItem;
}

export interface PathItem {
    [method: string]: Operation; // GET, POST, etc.
}

export interface Operation {
    tags?: string[];
    summary?: string;
    description?: string;
    operationId?: string;
    parameters?: Parameter[];
    requestBody?: RequestBody;
    responses?: Responses;
    [key: string]: any; // To accommodate extensions and additional properties
}

export interface Parameter {
    name: string;
    in: 'query' | 'header' | 'path' | 'cookie';
    description?: string;
    required?: boolean;
    deprecated?: boolean;
    schema?: Schema;
    [key: string]: any;
}

export interface RequestBody {
    description?: string;
    content: Content;
    required?: boolean;
    [key: string]: any;
}

export interface Content {
    [mediaType: string]: MediaType;
}

export interface MediaType {
    schema?: Schema;
    example?: any;
    examples?: { [exampleName: string]: Example };
    encoding?: Encoding;
    [key: string]: any;
}

export interface Responses {
    [statusCode: string]: Response;
}

export interface Response {
    description: string;
    headers?: Headers;
    content?: Content;
    links?: Links;
    [key: string]: any;
}

export interface Headers {
    [headerName: string]: Header;
}

export interface Header extends Parameter { }

export interface Links {
    [linkName: string]: Link;
}

export interface Link {
    operationRef?: string;
    operationId?: string;
    parameters?: { [parameterName: string]: any };
    requestBody?: any;
    description?: string;
    server?: Server;
    [key: string]: any;
}

export interface Schema {
    type?: string;
    format?: string;
    properties?: { [propertyName: string]: Schema };
    items?: Schema;
    required?: string[];
    maximum?: number; // Added to handle "maximum" in schemas
    isArray?: boolean; // Added to handle arrays in schemas
    [key: string]: any; // To accommodate extensions and additional properties
}

export interface Components {
    schemas?: { [schemaName: string]: Schema };
    responses?: { [responseName: string]: Response };
    parameters?: { [parameterName: string]: Parameter };
    examples?: { [exampleName: string]: Example };
    requestBodies?: { [requestBodyName: string]: RequestBody };
    headers?: { [headerName: string]: Header };
    securitySchemes?: { [securitySchemeName: string]: SecurityScheme };
    links?: { [linkName: string]: Link };
    callbacks?: { [callbackName: string]: Callback };
    [key: string]: any;
}

export interface Example {
    summary?: string;
    description?: string;
    value?: any;
    externalValue?: string;
    [key: string]: any;
}

export interface Encoding {
    [propertyName: string]: EncodingProperty;
}

export interface EncodingProperty {
    contentType?: string;
    headers?: Headers;
    style?: string;
    explode?: boolean;
    allowReserved?: boolean;
    [key: string]: any;
}

export interface SecurityScheme {
    type: string;
    description?: string;
    name?: string;
    in?: string;
    scheme?: string;
    bearerFormat?: string;
    flows?: OAuthFlows;
    openIdConnectUrl?: string;
    [key: string]: any;
}

export interface OAuthFlows {
    implicit?: OAuthFlow;
    password?: OAuthFlow;
    clientCredentials?: OAuthFlow;
    authorizationCode?: OAuthFlow;
    [key: string]: any;
}

export interface OAuthFlow {
    authorizationUrl?: string;
    tokenUrl?: string;
    refreshUrl?: string;
    scopes: { [scopeName: string]: string };
    [key: string]: any;
}

export interface Callback {
    [expression: string]: PathItem;
}

export interface Server {
    url: string;
    description?: string;
    variables?: { [variableName: string]: ServerVariable };
    [key: string]: any;
}

export interface ServerVariable {
    enum?: string[];
    default: string;
    description?: string;
    [key: string]: any;
}

export type Param = {
    name?: string;
    type?: string;
    defaultValue?: string;
    isRequired?: boolean;
    isArray?: boolean;
    [key: string]: any;
};

export type Path = {
    method: string;
    path: string;
    initialMethod: string;
    initialPath: string;
    initialOperation: Operation;
    [key: string]: any;
};
