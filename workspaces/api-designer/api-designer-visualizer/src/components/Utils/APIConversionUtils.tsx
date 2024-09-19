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
import { OpenAPI, Operation, Schema } from '../../Definitions/ServiceDefinitions';

// export function resolveResponseType(response: Response): string {
//     if (!response.content) {
//         return response.description;
//     } else if (response.content["application/json"].schema.type === "array" && response.content["application/json"].schema.items.$ref) {
//         return response.content["application/json"].schema.items.$ref.replace("#/components/schemas/", "") + "[]";
//     } else if (response.content["application/json"].schema.type === "array" && response.content["application/json"].schema.items.type) {
//         return response.content["application/json"].schema.items.type + "[]";
//     } else if (response.content["application/json"].schema.type) {
//         return response.content["application/json"].schema.type;
//     } else if (response.content["application/json"].schema.$ref) {
//         return response.content["application/json"].schema.$ref.replace("#/components/schemas/", "");
//     } else {
//         return "string";
//     }
// }

// export function resolveResponseFromOperation(operation: Operation): ResponseConfig[] {
//     let responses: ResponseConfig[] = [];
//     if (operation.responses) {
//         let index = 0;
//         for (const [code, response] of Object.entries(operation.responses)) {
//             responses.push({
//                 id: index,
//                 code: code,
//                 type: resolveResponseType(response),
//                 description: response.description,
//             });
//             index++;
//         }
//     }
//     return responses;
// }

// export function resolveTypeFormSchema(schema: Schema): string {
//     if (schema.type === "array") {
//         return resolveTypeFormSchema(schema.items) + "[]";
//     }
//     return schema.type;
// }

// export function getParametersFromOperation(operation: Operation): ParameterConfig[] {
//     let parameters: ParameterConfig[] = [];
//     if (operation.parameters) {
//         let index = 0;
//         for (const parameter of operation.parameters) {
//             parameters.push({
//                 id: index,
//                 name: parameter.name,
//                 type: resolveTypeFormSchema(parameter.schema),
//             });
//             index++;
//         }
//     }
//     return parameters;
// }

// export function convertOpenAPItoService(openAPIDefinition: OpenAPI): Service {
//     let service: Service = {
//         path: "",
//         resources: [],
//     };
//     service.port = 0;
//     for (const [path, pathItem] of Object.entries(openAPIDefinition.paths)) {
//         const pathSegemnent = path.match(/\/\{.*?\}/g);
//         for (const [method, operation] of Object.entries(pathItem)) {
//             let resource: Resource = {
//                 methods: [method],
//                 path: path,
//                 pathSegments: pathSegemnent ? pathSegemnent.map((segment, index) => ({
//                     id: index, name: segment.replace("/", "").replace("{", "").replace("}", ""),
//                 })) : [],
//                 params: getParametersFromOperation(operation),
//                 responses: resolveResponseFromOperation(operation),

//             };
//             service.resources.push(resource);
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
