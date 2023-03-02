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

import {ApiVersion, ComponentModel, Service} from "@wso2-enterprise/choreo-core";

export function enrichDeploymentData(pkgServices: Map<string, Service>, apiVersions: ApiVersion[], componentLocation: string,
    isLocal: boolean, accessibility?: string): boolean {
    const services = [...pkgServices.values()];
    const componentServices = services.filter((service) => service.elementLocation.filePath.includes(componentLocation));
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

export function enrichConsoleDeploymentData(pkgServices: Map<string, Service>, apiVersions: ApiVersion[]): boolean {
    const modelMap: Map<string, Service> = new Map(Object.entries(pkgServices));
    const services = [...modelMap.values()];
    for (const service of services) {
        let isInternetExposed = false;
        let isIntranetExposed = false;
        if (apiVersions.length > 0) {
            apiVersions.forEach((version: ApiVersion) => {
                if (version.accessibility === "internal") {
                    isIntranetExposed = true;
                }
                if (version.accessibility === "external") {
                    isInternetExposed = true;
                }
            });
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
