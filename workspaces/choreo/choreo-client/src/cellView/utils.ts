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

import { ComponentDisplayType } from "@wso2-enterprise/choreo-core";
import {
    CMDependency,
    CMResourceFunction,
    CMService,
    ComponentModel,
    ComponentType,
    Project as ProjectModel
} from "@wso2-enterprise/ballerina-languageclient";
import { existsSync, readFileSync } from "fs";
import {
    Component,
    Connection,
    Endpoint,
    ServiceTypes
} from "@wso2-enterprise/choreo-core";
import * as path from "path";
import { dirname, join } from "path";
import * as yaml from 'js-yaml';

export const CHOREO_CONFIG_DIR = ".choreo";
export const COMPONENTS_FILE = "component.yaml";
export const ENDPOINTS_FILE = "endpoint.yaml";
export const CHOREO_PROJECT_ROOT = "choreo-project-root";

const MODEL_VERSION = "0.4.0";
const CHOREO_CONNECTION_ID_PREFIX = "choreo://";

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

export function getServiceModels(endpoints: Endpoint[],
                                 orgName: string,
                                 projectId: string,
                                 componentName: string,
                                 componentPath: string,
                                 yamlPath: string) {

    const services: CMService[] = [];

    if (endpoints && Array.isArray(endpoints)) {
        for (const endpoint of endpoints) {
            let resources: CMResourceFunction[] = [];

            const serviceId = `${orgName}:${projectId}:${componentName}:${endpoint.name}`;
            const defaultService = getDefaultServiceModel();

            if (endpoint.schemaFilePath) {
                const openApiPath = path.join(componentPath, endpoint.schemaFilePath);
                resources = getResourcesFromOpenApiFile(openApiPath, serviceId);
            }

            services.push({
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
            });
        }
    }

    return services;
}

export function getConnectionModels(orgName: string, connections: Connection[], projectNameToIdMap: Map<string, string>) {
    const connectionModels: CMDependency[] = [];

    if (connections && Array.isArray(connections)) {
        for (const connection of connections) {
            const isChoreoConnection = connection.id.startsWith(CHOREO_CONNECTION_ID_PREFIX);
            let connectionId = connection.id;
            if (isChoreoConnection) {
                const connectionIdParts = connection.id.split('/');
                const projectName = connectionIdParts[2];
                const componentName = connectionIdParts[3];
                const endpointName = connectionIdParts[5];
                const projectId = projectNameToIdMap.has(projectName) ? projectNameToIdMap.get(projectName) : projectName;
                
                connectionId = `${orgName}:${projectId}:${componentName}:${endpointName}`;
            }
            const hasServiceUrl = connection.mappings.some(mapping => Object.keys(mapping).includes('service.url'));
            connectionModels.push({
                id: connectionId,
                isWithinPlatform: isChoreoConnection,
                type: hasServiceUrl ? "http" : "connector"
            });
        }
    }

    return connectionModels;
}

export function getDefaultComponentModel(orgName: string,
                                        componentName: string,
                                        componentType: ComponentType,
                                        componentKind: ComponentDisplayType,
                                        componentVersion?: string): ComponentModel {
    const services: CMService[] = [];

    services.push({
        id: "SAMPLE_SVC_ID",
        label: "",
        remoteFunctions: [],
        resourceFunctions: [],
        type: ServiceTypes.OTHER,
        dependencies: [],
        annotation: { id: "", label: "" }
    });
    // Create a map of services
    const serviceMap: Map<string, CMService> = new Map();
    serviceMap.set("SAMPLE_SVC_ID", services[0]);
    
    return {
        id: componentName,
        orgName: orgName,
        version: componentVersion,
        ...(componentVersion && { version: componentVersion }),
        modelVersion: MODEL_VERSION,
        type: componentType,
        kind: componentKind,
        services: serviceMap,
        entities: new Map(),
        hasCompilationErrors: true,
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

export function getResourcesFromOpenApiFile(openApiFilePath: string, serviceId: string) {
    const resourceList: CMResourceFunction[] = [];
    if (existsSync(openApiFilePath)) {
        const apiSchema: any = yaml.load(readFileSync(openApiFilePath, "utf8"));
        const paths = apiSchema.paths;
        for (const pathKey of Object.keys(paths)) {
            for (const pathMethod of Object.keys(paths[pathKey])) {
                resourceList.push({
                    id: `${serviceId}:${pathKey}:${pathMethod}`,
                    label: "",
                    path: pathKey,
                    interactions: [],
                    parameters: [],
                    returns: [],
                });
            }
        }
    }
    return resourceList;
}

export function getComponentDirPath(component: Component, projectLocation: string) {
    const repository = component.repository;
    if (projectLocation && (repository?.appSubPath || repository?.byocBuildConfig)) {
        const { organizationApp, nameApp, appSubPath, byocWebAppBuildConfig, byocBuildConfig } = repository;
        if (appSubPath) {
            return join(dirname(projectLocation), "repos", organizationApp, nameApp, appSubPath);
        } else if (byocWebAppBuildConfig) {
            if (byocWebAppBuildConfig?.dockerContext) {
                return join(dirname(projectLocation),
                 "repos", organizationApp, nameApp, byocWebAppBuildConfig?.dockerContext);
            } else if (byocWebAppBuildConfig?.outputDirectory) {
                return join(dirname(projectLocation),
                 "repos", organizationApp, nameApp, byocWebAppBuildConfig?.outputDirectory);
            }
        } else if (byocBuildConfig) {
            return join(dirname(projectLocation), "repos", organizationApp, nameApp, byocBuildConfig?.dockerContext);
        }
    }
    return undefined;
}

export function getGeneralizedComponentType(type: ComponentDisplayType): ComponentType {
    switch (type) {
        case ComponentDisplayType.RestApi:
        case ComponentDisplayType.Service:
        case ComponentDisplayType.ByocService:
        case ComponentDisplayType.GraphQL:
        case ComponentDisplayType.MiApiService:
        case ComponentDisplayType.MiRestApi:
            return ComponentType.SERVICE;
        case ComponentDisplayType.ManualTrigger:
        case ComponentDisplayType.ByocJob:
            return ComponentType.MANUAL_TASK;
        case ComponentDisplayType.ScheduledTask:
        case ComponentDisplayType.ByocCronjob:
            return ComponentType.SCHEDULED_TASK;
        case ComponentDisplayType.Webhook:
        case ComponentDisplayType.ByocWebhook:
            return ComponentType.WEB_HOOK;
        case ComponentDisplayType.Proxy:
            return ComponentType.API_PROXY;
        case ComponentDisplayType.ByocWebApp:
        case ComponentDisplayType.ByocWebAppDockerLess:
            return ComponentType.WEB_APP;
        case ComponentDisplayType.Websocket:
        case ComponentDisplayType.MiEventHandler:
            return ComponentType.EVENT_HANDLER;
        default:
            return ComponentType.SERVICE;
    }
}

export function getComoponentKind(): ComponentDisplayType {
    // TODO: Evaluate the component build pack and return the component kind (ballerinaService, byocService, etc.)
    return ComponentDisplayType.Service;
}
