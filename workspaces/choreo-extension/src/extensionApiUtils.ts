/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */

import {
    CMResourceFunction,
    CMService,
    ComponentModel,
    Project as ProjectModel
} from "@wso2-enterprise/ballerina-languageclient";
import { Component, Endpoint, Organization, ServiceTypes } from "@wso2-enterprise/choreo-core";
import { getResourcesFromOpenApiFile } from "./utils";
import * as path from "path";

const MODEL_VERSION = "0.4.0";

export function getDefaultServiceModel(): CMService {
    return {
        id: "",
        label: "",
        remoteFunctions: [],
        resourceFunctions: [],
        type: ServiceTypes.OTHER,
        dependencies: [],
        annotation: { id: "", label: "" },
    };
}

export function getServices(endpoints: Endpoint[],
                            orgName: string,
                            projectName: string,
                            componentName: string,
                            componentPath: string,
                            yamlPath: string) {

    const services: { [key: string]: CMService } = {};

    if (endpoints && Array.isArray(endpoints)) {
        const services: { [key: string]: CMService } = {};
        for (const endpoint of endpoints) {
            let resources: CMResourceFunction[] = [];

            const serviceId = `${orgName}:${projectName}:${componentName}:${endpoint.name}`;
            const defaultService = getDefaultServiceModel();

            if (endpoint.schemaFilePath) {
                const openApiPath = path.join(componentPath, endpoint.schemaFilePath);
                resources = getResourcesFromOpenApiFile(openApiPath, serviceId);
            }

            services[serviceId] = {
                ...defaultService,
                id: serviceId,
                type: endpoint?.type || ServiceTypes.HTTP,
                resourceFunctions: resources,
                annotation: {id: serviceId, label: endpoint.name},
                sourceLocation: {
                    filePath: yamlPath,
                    startPosition: {line: 0, offset: 0},
                    endPosition: {line: 0, offset: 0},
                },
                deploymentMetadata: {
                    gateways: {
                        internet: {isExposed: endpoint?.networkVisibility === "Public"},
                        intranet: {isExposed: endpoint?.networkVisibility === "Organization"},
                    },
                },
            };
        }
    }

    return  new Map<string, CMService>(Object.entries(services));
}

export function getDefaultComponentModel(component: Component, organization: Organization): ComponentModel {
    return {
        id: component.name,
        orgName: organization.name,
        version: component.version,
        modelVersion: MODEL_VERSION,
        services: new Map(),
        entities: new Map(),
        hasCompilationErrors: false,
        connections: []
    };
}

export function getDefaultProjectModel(id: string, name: string): ProjectModel {
    return {
        id: id,
        name: name,
        components: [],
        version: MODEL_VERSION
    };
}
