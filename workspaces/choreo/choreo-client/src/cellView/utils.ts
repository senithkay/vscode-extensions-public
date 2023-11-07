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

import { ComponentDisplayType, Inbound, Outbound } from "@wso2-enterprise/choreo-core";
import {
    BuildPack,
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
    ServiceTypes
} from "@wso2-enterprise/choreo-core";
import * as path from "path";
import { dirname, join } from "path";
import * as yaml from 'js-yaml';

export const CHOREO_CONFIG_DIR = ".choreo";
export const COMPONENT_CONFIG_FILE = "component-config.yaml";
export const CHOREO_PROJECT_ROOT = "choreo-project-root";

const MODEL_VERSION = "0.4.0";
const CHOREO_CONNECTION_ID_PREFIX = "choreo:///";

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

export function getServiceModels(endpoints: Inbound[],
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
                        internet: {isExposed: endpoint?.visibility === "Public"},
                        intranet: {isExposed: endpoint?.visibility === "Organization"},
                    },
                },
            });
        }
    }

    return services;
}

export function getConnectionModels(connections: Outbound, projectNameToIdMap: Map<string, string>, compHandlerToNameMap: Map<string, string>) {
    const connectionModels: CMDependency[] = [];

    if (connections && Array.isArray(connections.serviceReferences)) {
        for (const ref of connections.serviceReferences) {
            const isChoreoConnection = ref.name.startsWith(CHOREO_CONNECTION_ID_PREFIX);
            let connectionId = ref.name;
            if (isChoreoConnection) {
                const connectionIdParts = ref.name.split(CHOREO_CONNECTION_ID_PREFIX)[1].split("/");
                const orgName = connectionIdParts[0];
                const projectHandle = connectionIdParts[1];
                const componentHandle = connectionIdParts[2];
                const endpointHash = connectionIdParts[3];
                const projectId = projectNameToIdMap.has(projectHandle) ? projectNameToIdMap.get(projectHandle) : projectHandle;
                const componentName = compHandlerToNameMap.has(componentHandle) ? compHandlerToNameMap.get(componentHandle) : componentHandle;

                connectionId = `${orgName}:${projectId}:${componentName}:${endpointHash}`;
            }
            connectionModels.push({
                id: connectionId,
                onPlatform: isChoreoConnection,
                type: ref.connectionType
            });
        }
    }

    return connectionModels;
}

export function getDefaultComponentModel(orgName: string,
                                        componentName: string,
                                        componentType: ComponentType,
                                        buildPack: string,
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
        buildPack: buildPack,
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

export function getGeneralizedComponentType(
    type: ComponentDisplayType
): ComponentType {
    switch (type) {
        case ComponentDisplayType.RestApi:
        case ComponentDisplayType.Service:
        case ComponentDisplayType.ByocService:
        case ComponentDisplayType.GraphQL:
        case ComponentDisplayType.MiApiService:
        case ComponentDisplayType.MiRestApi:
        case ComponentDisplayType.BuildpackService:
        case ComponentDisplayType.BuildpackRestApi:
        case ComponentDisplayType.Websocket:
            return ComponentType.SERVICE;
        case ComponentDisplayType.ManualTrigger:
        case ComponentDisplayType.ByocJob:
        case ComponentDisplayType.BuildpackJob:
        case ComponentDisplayType.MiJob:
            return ComponentType.MANUAL_TASK;
        case ComponentDisplayType.ScheduledTask:
        case ComponentDisplayType.ByocCronjob:
        case ComponentDisplayType.BuildpackCronJob:
        case ComponentDisplayType.MiCronjob:
            return ComponentType.SCHEDULED_TASK;
        case ComponentDisplayType.Webhook:
        case ComponentDisplayType.ByocWebhook:
        case ComponentDisplayType.BuildpackWebhook:
            return ComponentType.WEB_HOOK;
        case ComponentDisplayType.Proxy:
            return ComponentType.API_PROXY;
        case ComponentDisplayType.ByocWebApp:
        case ComponentDisplayType.ByocWebAppDockerLess:
        case ComponentDisplayType.BuildpackWebApp:
            return ComponentType.WEB_APP;
        case ComponentDisplayType.MiEventHandler:
        case ComponentDisplayType.BallerinaEventHandler:
            return ComponentType.EVENT_HANDLER;
        case ComponentDisplayType.BuildpackTestRunner:
            return ComponentType.TEST;
        default:
            return ComponentType.SERVICE;
    }
}

export function getBuildPackFromFs(componentPath: string): BuildPack {
    if (existsSync(join(componentPath, "Ballerina.toml"))) {
        return BuildPack.Ballerina;
    }
    return BuildPack.Other;
}

export function getImplementedLangOrFramework(component: Component) {
    const { displayType, repository } = component;
    if (
        displayType === ComponentDisplayType.GraphQL ||
        displayType === ComponentDisplayType.ManualTrigger ||
        displayType === ComponentDisplayType.ScheduledTask ||
        displayType === ComponentDisplayType.Service ||
        displayType === ComponentDisplayType.Webhook ||
        displayType === ComponentDisplayType.Websocket
    ) {
        return BuildPack.Ballerina;
    }
    if (displayType.startsWith('buildpack')) {
        const latestVersion = getLatestComponentVersion(component)?.id;
        if (latestVersion && repository?.buildpackConfig) {
            const buildpackOfLatestVersion = repository.buildpackConfig.find(
                (config) => config.versionId === latestVersion
            );
            if (buildpackOfLatestVersion) {
                return buildpackOfLatestVersion.buildpack.language;
            }
        }
    }
    return BuildPack.Other;
}

export function getLatestComponentVersion(component: Component) {
    return component?.apiVersions?.find((apiVersion) => apiVersion.latest);
}
