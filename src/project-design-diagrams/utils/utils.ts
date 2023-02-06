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

import { window, workspace } from "vscode";
import { existsSync } from "fs";
import { join } from "path";
import { ExtendedLangClient } from "src/core";
import { terminateActivation } from "../activator";
import { ComponentModel, DIAGNOSTICS_WARNING, ERROR_MESSAGE, Service } from "../resources";
import { getChoreoExtAPI } from "../../choreo-features/activate";

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
            let packageModels: Map<string, ComponentModel> = new Map(Object.entries(response.componentModels));
            for (let [_key, packageModel] of packageModels) {
                if (packageModel.hasCompilationErrors) {
                    window.showInformationMessage(DIAGNOSTICS_WARNING);
                    break;
                }
            }
            getChoreoExtAPI().then(async(resp) => {
                const enrichedModel = await resp.enrichChoreoMetadata(packageModels);
                packageModels = enrichedModel;
                resolve(response.componentModels);
            });
        }).catch((error) => {
            reject(error);
            terminateActivation(ERROR_MESSAGE);
        });
    });
}
