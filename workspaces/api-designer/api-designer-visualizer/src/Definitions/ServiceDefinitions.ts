/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

interface OpenAPI {
    openapi: string;
    info: Info;
    paths: Paths;
    components?: Components;
    servers?: Server[]; // Added to handle servers
    [key: string]: any; // To accommodate extensions and additional properties
}

interface Info {
    title: string;
    version: string;
    description?: string;
    termsOfService?: string;
    contact?: Contact;
    license?: License;
}

interface Contact {
    name?: string;
    url?: string;
    email?: string;
}

interface License {
    name: string;
    url?: string;
}

interface Paths {
    [path: string]: PathItem;
}

interface PathItem {
    [method: string]: Operation; // GET, POST, etc.
}

interface Operation {
    tags?: string[];
    summary?: string;
    description?: string;
    operationId?: string;
    parameters?: Parameter[];
    requestBody?: RequestBody;
    responses: Responses;
    [key: string]: any; // To accommodate extensions and additional properties
}

interface Parameter {
    name: string;
    in: 'query' | 'header' | 'path' | 'cookie';
    description?: string;
    required?: boolean;
    deprecated?: boolean;
    schema?: Schema;
}

interface RequestBody {
    description?: string;
    content: Content;
    required?: boolean;
}

interface Content {
    [mediaType: string]: MediaType;
}

interface MediaType {
    schema?: Schema;
    example?: any;
    examples?: { [exampleName: string]: Example };
    encoding?: Encoding;
}

interface Responses {
    [statusCode: string]: Response;
}

interface Response {
    description: string;
    headersDef?: Headers;
    content?: Content;
    links?: Links;
}

interface Headers {
    [headerName: string]: Header;
}

interface Header extends Parameter { }

interface Links {
    [linkName: string]: Link;
}

interface Link {
    operationRef?: string;
    operationId?: string;
    parameters?: { [parameterName: string]: any };
    requestBody?: any;
    description?: string;
    server?: Server;
}

interface Schema {
    type?: string;
    format?: string;
    properties?: { [propertyName: string]: Schema };
    items?: Schema;
    required?: string[];
    maximum?: number; // Added to handle "maximum" in schemas
    [key: string]: any; // To accommodate extensions and additional properties
}

interface Components {
    schemas?: { [schemaName: string]: Schema };
    responses?: { [responseName: string]: Response };
    parameters?: { [parameterName: string]: Parameter };
    examples?: { [exampleName: string]: Example };
    requestBodies?: { [requestBodyName: string]: RequestBody };
    headers?: { [headerName: string]: Header };
    securitySchemes?: { [securitySchemeName: string]: SecurityScheme };
    links?: { [linkName: string]: Link };
    callbacks?: { [callbackName: string]: Callback };
}

interface Example {
    summary?: string;
    description?: string;
    value?: any;
    externalValue?: string;
}

interface Encoding {
    [propertyName: string]: EncodingProperty;
}

interface EncodingProperty {
    contentType?: string;
    headers?: Headers;
    style?: string;
    explode?: boolean;
    allowReserved?: boolean;
}

interface SecurityScheme {
    type: string;
    description?: string;
    name?: string;
    in?: string;
    scheme?: string;
    bearerFormat?: string;
    flows?: OAuthFlows;
    openIdConnectUrl?: string;
}

interface OAuthFlows {
    implicit?: OAuthFlow;
    password?: OAuthFlow;
    clientCredentials?: OAuthFlow;
    authorizationCode?: OAuthFlow;
}

interface OAuthFlow {
    authorizationUrl?: string;
    tokenUrl?: string;
    refreshUrl?: string;
    scopes: { [scopeName: string]: string };
}

interface Callback {
    [expression: string]: PathItem;
}

interface Server {
    url: string;
    description?: string;
    variables?: { [variableName: string]: ServerVariable };
}

interface ServerVariable {
    enum?: string[];
    default: string;
    description?: string;
}
