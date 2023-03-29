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

import { commands, window, workspace } from "vscode";
import { existsSync } from "fs";
import { join } from "path";
import _ from "lodash";
import { Project } from "@wso2-enterprise/choreo-core";
import { ExtendedLangClient } from "../../core";
import { terminateActivation } from "../activator";
import { ComponentModel, DIAGNOSTICS_WARNING, ERROR_MESSAGE, Location } from "../resources";
import { getChoreoExtAPI } from "../../choreo-features/activate";
import { deleteBallerinaPackage, deleteComponent } from "./component-handler-utils";

export function getComponentModel(langClient: ExtendedLangClient): Promise<Map<string, ComponentModel>> {
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
        }).then(async (response) => {
            let packageModels: Map<string, ComponentModel> = new Map(Object.entries(response.componentModels));
            for (let [_key, packageModel] of packageModels) {
                if (packageModel.hasCompilationErrors) {
                    window.showInformationMessage(DIAGNOSTICS_WARNING);
                    break;
                }
            }

            const choreoExt = await getChoreoExtAPI();
            if (choreoExt) {
                packageModels = await choreoExt.enrichChoreoMetadata(packageModels);
            }
            resolve(response.componentModels);
        }).catch((error) => {
            reject(error);
            terminateActivation(ERROR_MESSAGE);
        });
    });
}

export async function checkIsChoreoProject(): Promise<boolean> {
    const choreoExt = await getChoreoExtAPI();
    if (choreoExt) {
        return await choreoExt.isChoreoProject();
    }
    return false;
}

export async function getActiveChoreoProject(): Promise<Project> {
    const choreoExt = await getChoreoExtAPI();
    if (choreoExt) {
        return await choreoExt.getChoreoProject();
    }
    return undefined;
}

export async function showChoreoProjectOverview(project: Project | undefined): Promise<void> {
    if (project && await getChoreoExtAPI()) {
        return commands.executeCommand('wso2.choreo.project.overview', project);
    }
    window.showErrorMessage('Error while loading Choreo project overview.');
}

export async function deleteProjectComponent(projectId: string, location: Location, deletePkg: boolean): Promise<void> {
    if (projectId) {
        const choreoExt = await getChoreoExtAPI();
        if (choreoExt) {
            await choreoExt.deleteComponent(projectId, location.filePath);
        }
    } else {
        if (deletePkg) {
            deleteBallerinaPackage(location.filePath);
        } else {
            await deleteComponent(location);
        }
    }
}
