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

import { CMResourceFunction, ComponentModel, CMService as Service } from "@wso2-enterprise/ballerina-languageclient";
import { ApiVersion, Component } from "@wso2-enterprise/choreo-core";
import { existsSync, readFileSync } from "fs";
import * as yaml from 'js-yaml';
import { ProjectRegistry } from "./registry/project-registry";
import { dirname, join } from "path";

export async function enrichDeploymentData(orgId: string, componentId: string, pkgServices: Map<string, Service>,
                                           apiVersions: ApiVersion[], componentLocation: string): Promise<boolean> {
    const services = [...pkgServices.values()];
    const componentServices = services.filter((service) =>
        service.sourceLocation?.filePath.includes(componentLocation)
    );
    for (const service of componentServices) {
        let isInternetExposed = false;
        let isIntranetExposed = false;
        if (apiVersions.length > 0) {
            // Get the latest version of the API
            const version = apiVersions.find((apiVersion) => apiVersion.latest);
            if (version) {
                const epData = await ProjectRegistry.getInstance().getEndpointsForVersion(
                    componentId, version.id, parseInt(orgId)
                );
                // TODO: Handle multiple endpoints
                if (epData?.componentEndpoints && epData.componentEndpoints.length === 1) {
                    const endpoint = epData.componentEndpoints[0];
                    const visibility = endpoint.visibility;
                    if (visibility === "Organization") {
                        isIntranetExposed = true;
                    }
                    if (visibility === "Public") {
                        isInternetExposed = true;
                    }
                }
            }
        }

        service.deploymentMetadata = {
            gateways: {
                internet: {
                    isExposed: isInternetExposed
                },
                intranet: {
                    isExposed: isIntranetExposed
                }
            }
        };
    }
    return componentServices.length > 0;
}

export function enrichConsoleDeploymentData(pkgServices: Map<string, Service>, apiVersion: ApiVersion): boolean {
    const modelMap: Map<string, Service> = new Map(Object.entries(pkgServices));
    const services = [...modelMap.values()];
    for (const service of services) {
        let isInternetExposed = false;
        let isIntranetExposed = false;
        if (apiVersion.accessibility === "internal") {
            isIntranetExposed = true;
        }
        if (apiVersion.accessibility === "external") {
            isInternetExposed = true;
        }
        service.deploymentMetadata = {
            gateways: {
                internet: {
                    isExposed: isInternetExposed
                },
                intranet: {
                    isExposed: isIntranetExposed
                }
            }
        };
    }
    return services.length > 0;
}

export function mergeNonClonedProjectData(component: Component): ComponentModel {
    const pkgServices: { [key: string]: Service } = {};
    pkgServices[component.id] = {
        id: component.displayName,
        label: component.displayName,
        type: component.displayType,
        annotation: {
            id: component.id,
            label: component.displayName
        },
        deploymentMetadata: {
            gateways: {
                internet: {
                    isExposed: false
                },
                intranet: {
                    isExposed: false
                }
            }
        },
        dependencies: [],
        remoteFunctions: [],
        resourceFunctions: [],
        isNoData: true
    };
    return {
        id: component.name,
        orgName: component.orgHandler,
        modelVersion: "0.4.0",
        version: component.version,
        services: pkgServices as any,
        entities: new Map(),
        connections: [],
        hasCompilationErrors: false,
        hasModelErrors: false
    };
}


// sanitize the component display name to make it url friendly
export function makeURLSafe(input: string): string {
    return input.trim().replace(/\s+/g, '-').toLowerCase();
}

export const getResourcesFromOpenApiFile = (openApiFilePath: string, serviceId: string) => {
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
};

export const getComponentDirPath = (component: Component, projectLocation: string) => {
    const repository = component.repository;
    if (projectLocation && (repository?.appSubPath || repository?.byocBuildConfig)) {
        const { organizationApp, nameApp, appSubPath, byocWebAppBuildConfig, byocBuildConfig } = repository;
        if (appSubPath) {
            return join(dirname(projectLocation), "repos", organizationApp, nameApp, appSubPath);
        } else if (byocWebAppBuildConfig) {
            if (byocWebAppBuildConfig?.dockerContext) {
                return join(dirname(projectLocation), "repos", organizationApp, nameApp, byocWebAppBuildConfig?.dockerContext);
            } else if (byocWebAppBuildConfig?.outputDirectory) {
                return join(dirname(projectLocation), "repos", organizationApp, nameApp, byocWebAppBuildConfig?.outputDirectory);
            }
        } else if (byocBuildConfig) {
            return join(dirname(projectLocation), "repos", organizationApp, nameApp, byocBuildConfig?.dockerContext);
        }
    }
};

export const filePathChecker = (path: string, regex: RegExp) => {
    return regex.test(path);
};