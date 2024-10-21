/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import yaml from 'js-yaml';

import { ParameterConfig, Resource, ResponseConfig, Service } from "@wso2-enterprise/service-designer";
import { OpenAPI, Operation, Param, Parameter, PathItem, Schema, Response, Header } from '../../Definitions/ServiceDefinitions';
import { colors, darkerColors } from '../../constants';

export function resolveResponseType(response: Response): string {
    const contentType = Object.keys(response.content)[0];
    if (!response.content || Object.keys(response.content).length === 0) {
        return response.description;
    } else if (response.content["application/json"].schema.type === "array" && response.content["application/json"].schema.items.$ref) {
        return response.content["application/json"].schema.items.$ref.replace("#/components/schemas/", "") + "[]";
    } else if (response.content["application/json"].schema.type === "array" && response.content["application/json"].schema.items.type) {
        return response.content["application/json"].schema.items.type + "[]";
    } else if (response.content["application/json"].schema.type) {
        return response.content["application/json"].schema.type;
    } else if (response.content["application/json"].schema.$ref) {
        return response.content["application/json"].schema.$ref.replace("#/components/schemas/", "");
    } else {
        return "string";
    }
}

export function resolveResponseFromOperation(operation: Operation): ResponseConfig[] {
    let responses: ResponseConfig[] = [];
    if (operation.responses) {
        let index = 0;
        for (const [code, response] of Object.entries(operation.responses)) {
            responses.push({
                id: index,
                code: code,
                type: resolveResponseType(response),
                description: response.description,
            });
            index++;
        }
    }
    return responses;
}

export function resolveTypeFormSchema(schema: Schema): string {
    // if (schema?.type === "array") {
    //     return resolveTypeFormSchema(schema.items) + "[]";
    // }
    return schema.type;
}

export function getParametersFromOperation(operation: Operation): ParameterConfig[] {
    let parameters: ParameterConfig[] = [];
    if (operation.parameters) {
        let index = 0;
        for (const parameter of operation.parameters) {
            parameters.push({
                id: index,
                name: parameter.name,
                type: resolveTypeFormSchema(parameter.schema),
            });
            index++;
        }
    }
    return parameters;
}

// export function convertOpenAPItoService(openAPIDefinition: OpenAPI): Service {
//     let service: Service = {
//         path: "",
//         resources: [],
//     };
//     service.port = 0;
//     if (openAPIDefinition.paths !== undefined) {
//         for (const [path, pathItem] of Object?.entries(openAPIDefinition.paths)) {
//             const pathSegemnent = path.match(/\/\{.*?\}/g);
//             for (const [method, operation] of Object.entries(pathItem)) {
//                 let resource: Resource = {
//                     methods: [method],
//                     path: path,
//                     pathSegments: pathSegemnent ? pathSegemnent.map((segment, index) => ({
//                         id: index, name: segment.replace("/", "").replace("{", "").replace("}", ""),
//                     })) : [],
//                     params: getParametersFromOperation(operation),
//                     responses: resolveResponseFromOperation(operation),
    
//                 };
//                 service.resources.push(resource);
//             }
            
//         }
//     }
//     return service;
// }

export function convertJSONtoOpenAPI(json: string): OpenAPI {
    return JSON.parse(json);
}

export function convertYAMLtoOpenAPI(yamlString: string): OpenAPI {
    return yaml.load(yamlString) as OpenAPI;
}

// export function convertOpenAPIStringToObject(openAPIString: string, type: "yaml" | "json"): Service {
//     if (type === "yaml") {
//         return convertOpenAPItoService(convertYAMLtoOpenAPI(openAPIString));
//     } else {
//         return convertOpenAPItoService(convertJSONtoOpenAPI(openAPIString));
//     }
// }

export function convertOpenAPIStringToOpenAPI(openAPIString: string, type: "yaml" | "json"): OpenAPI {
    if (type === "yaml") {
        return convertYAMLtoOpenAPI(openAPIString);
    } else {
        return convertJSONtoOpenAPI(openAPIString);
    }
}

export function getColorByMethod(method: string) {
    switch (method.toUpperCase()) {
        case "GET":
            return colors.GET;
        case "PUT":
            return colors.PUT;
        case "POST":
            return colors.POST;
        case "DELETE":
            return colors.DELETE;
        case "PATCH":
            return colors.PATCH;
        case "OPTIONS":
            return colors.OPTIONS;
        case "HEAD":
            return colors.HEAD;
        default:
            return '#876036'; // Default color
    }
}

export function getBackgroundColorByMethod(method: string) {
    switch (method.toUpperCase()) {
        case "GET":
            return darkerColors.GET;
        case "PUT":
            return darkerColors.PUT;
        case "POST":
            return darkerColors.POST;
        case "DELETE":
            return darkerColors.DELETE;
        case "PATCH":
            return darkerColors.PATCH;
        case "OPTIONS":
            return darkerColors.OPTIONS;
        case "HEAD":
            return darkerColors.HEAD;
        default:
            return '#876036'; // Default color
    }
}

export function getResourceID(path: string, method: string): string {
    return `${method.toUpperCase()}$${path}`;
}

export function getMethodFromResourceID(resourceID: string): string {
    return (resourceID.split("$")[0]).toLowerCase();
}

export function getPathFromResourceID(resourceID: string): string {
    return resourceID?.split("$")[1];
}

export function getPathParametersFromParameters(parameters: Parameter[]): Param[] {
    return parameters?.filter((param) => param.in === "path").map((param) => ({
        ...param,
        name: param.name,
        type: param?.schema?.type === "array" ? param.schema.items.type : param.schema.type,
        description: param.description,
        isArray: param.schema ? param.schema.type === "array" : false,
        isRequired: param.required || false,
    }));
}

export function getPathParametersFromPath(path: string): Param[] {
    const pathSegments = path.split("/");
    let pathParams: Param[] = [];
    pathSegments.forEach((segment) => {
        if (segment.startsWith("{") && segment.endsWith("}")) {
            pathParams.push({
                name: segment.replace("{", "").replace("}", ""),
                type: "string",
                isArray: false,
                isRequired: true,
            });
        }
    });
    return pathParams;
}

export function isNameNotInParams(name: string, params: Param[]): boolean {
    return !params.some((param) => param.name === name);
}

export function getQueryParametersFromParameters(parameters: Parameter[]): Param[] {
    return parameters?.filter((param) => param.in === "query").map((param) => ({
        ...param,
        name: param.name,
        type: param.schema ? ( param.schema.type === "array" ? param.schema.items.type : param.schema.type ) : "string",
        description: param.description,
        isArray: param.schema ? param.schema.type === "array" : false,
        isRequired: param.required,
    }));
}

export function getHeaderParametersFromParameters(parameters: Parameter[]): Param[] {
    return parameters?.filter((param) => param.in === "header").map((param) => ({
        ...param,
        name: param.name,
        type: param.schema ? ( param.schema.type === "array" ? param.schema.items.type : param.schema.type ) : "string",
        description: param.description,
        isArray: param.schema ? param.schema.type === "array" : false,
        isRequired: param.required,
    }));
}

export function getResponseHeadersFromResponse(response: Header[]): Param[] {
    return Object.entries(response).map(([name, header]) => ({
        name: header.name,
        type: header.schema ? ( header.schema.type === "array" ? header.schema.items.type : header.schema.type ) : "string",
        description: header.description,
        isArray: header.schema ? header.schema.type === "array" : false,
        isRequired: header.required,
    }));
}

export function getOperationFromPathItem(pathItem: PathItem, method: string): Operation {
    const operation = pathItem[method];
    return typeof operation === 'object' ? operation : undefined; // Ensure it's an Operation
}

export function getOperationFromOpenAPI(path: string, method: string, openAPI: OpenAPI): Operation {
    const pathItem = openAPI.paths[path] as PathItem;
    if (pathItem) {
        if (pathItem && typeof pathItem === 'object') { // Ensure pathItem is an object
            return getOperationFromPathItem(pathItem, method);
        } else {
            return undefined;
        }
    } else {
        return undefined;
    }
}

// Convert Param[] to Parameter[]
export function convertParamsToParameters(params: Param[], type: "path" | "query" | "header"): Parameter[] {
    let parameters: Parameter[] = [];
    params?.forEach((param) => {
        const newParam = { ...param };
        delete newParam.isArray;
        delete newParam.isRequired;
        delete newParam.type;
        if (param.isArray) {
            parameters.push({
                ...newParam,
                name: param.name,
                in: type,
                required: param.isRequired,
                schema: {
                    ...newParam.schema,
                    type: "array",
                    items: {
                        type: param.type,
                    }
                },
            });
        } else {
            parameters.push({
                ...newParam,
                name: param.name,
                in: type,
                required: param.isRequired,
                schema: {
                    ...newParam.schema,
                    type: param.type,
                }
            });
        }
    });
    return parameters;
}

export function resolveTypeFromSchema(schema: Schema): string {
    // Add [] if the schema is an array
    if (schema.type === "array") {
        return resolveTypeFromSchema(schema.items);
    } else if (schema.$ref) {
        return schema.$ref.replace("#/components/schemas/", "");
    } else if (schema.items && schema.items.$ref) {
        return schema.items.$ref.replace("#/components/schemas/", "");
    } else {
        return schema.type;
    }
}

export function resolveResonseColor(responseCode: string): string {
    if (responseCode.startsWith("2")) {
        return 'var(--vscode-statusBarItem-remoteBackground)';
    } else if (responseCode.startsWith("4")) {
        return 'var(--vscode-debugExceptionWidget-border)';
    } else {
        return 'var(--vscode-symbolIcon-variableForeground)';
    }
}

export function resolveResonseHoverColor(responseCode: string): string {
    if (responseCode.startsWith("2")) {
        return 'var(--vscode-editorGutter-addedBackground)';
    } else if (responseCode.startsWith("4")) {
        return 'var(--vscode-errorForeground)';
    } else {
        return 'var(--vscode-minimap-selectionHighlight)';
    }
}
