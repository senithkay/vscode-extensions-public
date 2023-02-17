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

import { ApiVersion, Service } from "@wso2-enterprise/choreo-core";

export function enrichDeploymentData(services: Map<string, Service>, apiVersions: ApiVersion[], componentLocation: string,
    isLocal: boolean, accessibility?: string) {
    for (const service of services.values()) {
        // Checks whether both Choreo and local paths are same
        if (service.elementLocation.filePath.includes(componentLocation)) {
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
            break;
        }
    }
}
