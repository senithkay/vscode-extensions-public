/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the 'License'); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import { workspace } from "vscode";
import { existsSync } from "fs";
import { join } from "path";
import { ExtendedLangClient } from "src/core";
import { terminateActivation } from "../activator";
import { ComponentModel, ERROR_MESSAGE, Service } from "../resources";

export function getProjectResources(langClient: ExtendedLangClient): Promise<Map<string, ComponentModel>> {
    return new Promise((resolve, reject) => {
        let ballerinaFiles: string[] = [];
        let workspaceFolders = workspace.workspaceFolders;
        if (workspaceFolders !== undefined) {
            workspaceFolders.forEach(folder => {
                const isBalProject = existsSync(join(folder.uri.fsPath, "Ballerina.toml"));
                if (isBalProject) {
                    ballerinaFiles.push(join(folder.uri.fsPath, "Ballerina.toml"));
                }
            });
        } else {
            workspace.textDocuments.forEach(file => {
                ballerinaFiles.push(file.uri.fsPath);
            });
        }

        langClient.getPackageComponentModels({
            documentUris: ballerinaFiles
        }).then((response) => {
            injectDeploymentMetadata(new Map(Object.entries(response.componentModels)));
            resolve(response.componentModels);
        }).catch((error) => {
            reject(error);
            terminateActivation(ERROR_MESSAGE);
        });
    });
}

// For testing purposes
function injectDeploymentMetadata(components: Map<string, ComponentModel>) {
    components.forEach((component) => {
        const services: Map<string, Service> = new Map(Object.entries(component.services));
        services.forEach((service) => {
            service.deploymentMetadata = {
                gateways: {
                    internet: {
                        isExposed: Math.random() < 0.5
                    },
                    intranet: {
                        isExposed: Math.random() > 0.5
                    }
                }
            }
        })
    })
}
