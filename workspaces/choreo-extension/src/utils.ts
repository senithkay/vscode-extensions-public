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

export function enrichDeploymentData(pkgServices: Map<string, Service>, apiVersions: ApiVersion[], componentLocation: string,
    isLocal: boolean, accessibility?: string): boolean {
    const services = [...pkgServices.values()];
    const componentServices = services.filter((service) => service.elementLocation?.filePath.includes(componentLocation));
    for (const service of componentServices) {
        let isInternetExposed = false;
        let isIntranetExposed = false;
        if (!isLocal && apiVersions.length > 0) {
            apiVersions.forEach((version: ApiVersion) => {
                if (version.accessibility === "internal") {
                    isIntranetExposed = true;
                }
                if (version.accessibility === "external") {
                    isInternetExposed = true;
                }
            });
        } else if (isLocal) {
            if (accessibility === "internal") {
                isIntranetExposed = true;
            }
            if (accessibility === "external") {
                isInternetExposed = true;
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
        serviceId: component.displayName,
        serviceType: component.displayType,
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
        path: "",
        dependencies: [],
        remoteFunctions: [],
        resources: [],
        isNoData: true
    };
    return {
        packageId: { name: component.name, org: component.orgHandler, version: component.version },
        services: pkgServices as any,
        entities: new Map(),
        hasCompilationErrors: false
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
                    identifier: `${pathMethod} ${pathKey}`,
                    interactions: [],
                    resourceId: { action: pathMethod, path: pathKey, serviceId },
                    parameters: [],
                    returns: [],
                });
            }
        }
    }
    return resourceList;
};