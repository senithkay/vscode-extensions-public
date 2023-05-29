/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import { window, Uri, commands, workspace, ProgressLocation } from "vscode";
import { existsSync, openSync, readFileSync, writeFile } from "fs";
import { INTERNAL_DEBUG_COMMAND } from "../editor-support/codelens-provider";
import { BALLERINA_COMMANDS, BAL_TOML, CONFIG_FILE, PALETTE_COMMANDS, runCommand } from "../project";
import { BallerinaExtension, BallerinaProject, PackageConfigSchemaResponse } from "../core";
import { getCurrentBallerinaProject } from "../utils/project-utils";
import EventEmitter from "events";
import { generateExistingValues, parseConfigToToml, parseTomlToConfig } from "./utils";


export async function configGenerator(ballerinaExtInstance: BallerinaExtension, filePath: string,
    isDebug: boolean): Promise<void> {
    let configFile: string = filePath;
    let packageName: string = "packageName";

    if (!filePath || !filePath.toString().endsWith(CONFIG_FILE)) {
        let currentProject: BallerinaProject = {};
        if (window.activeTextEditor) {
            currentProject = await getCurrentBallerinaProject();
        } else {
            const document = ballerinaExtInstance.getDocumentContext().getLatestDocument();
            if (document) {
                currentProject = await getCurrentBallerinaProject(document.toString());
            }
        }

        if (!currentProject) {
            return;
        }

        if (currentProject.kind == "SINGLE_FILE_PROJECT") {
            isDebug ? commands.executeCommand(INTERNAL_DEBUG_COMMAND) : commands.executeCommand(PALETTE_COMMANDS.RUN_CMD);
            return;
        }

        filePath = `${currentProject.path}/${BAL_TOML}`;

        packageName = currentProject.packageName!;
        await ballerinaExtInstance.langClient?.getBallerinaProjectConfigSchema({
            documentIdentifier: {
                uri: Uri.file(filePath).toString()
            }
        }).then(async response => {
            const data = response as PackageConfigSchemaResponse;
            if (data.configSchema === undefined || data.configSchema === null) {
                window.showErrorMessage('Unable to generate the configurables: Error while '
                    + 'retrieving the configurable schema.');
                return Promise.reject();
            }

            if (data.configSchema?.properties) {
                const props: object = data.configSchema?.properties;
                var firstKey = Object.keys(props)[0];
                var orgName = props[firstKey].properties;
                if (orgName) {
                    const configs: {
                        additionalProperties: boolean
                        properties: {}
                        required: []
                    } = orgName[packageName];
                    if (configs.required.length > 0) {

                        const openConfigButton = { title: 'Open Config', isCloseAffordance: true };
                        const ignoreButton = { title: 'Ignore' };

                        const result = await window.showInformationMessage(
                            'There are required configurables. You can open config file or just ignore.',
                            openConfigButton,
                            ignoreButton
                        );

                        if (result === openConfigButton) {
                            configFile = `${currentProject.path}/${CONFIG_FILE}`;
                            if (!existsSync(configFile)) {
                                openSync(configFile, 'w');
                            }
                            if (configFile) {
                                const uri = Uri.file(configFile);
                                const tomlContent: string = readFileSync(uri.fsPath, 'utf8');
                                const existingConfigs: object = generateExistingValues(parseTomlToConfig(tomlContent), orgName, packageName);

                                // Check for existing configs
                                if (existingConfigs) {
                                    const obj = existingConfigs['[object Object]'][packageName]

                                    // If there are existing configs check for new ones
                                    if (Object.keys(obj).length > 0) {
                                        const newValues = [];
                                        configs.required.forEach(value => {
                                            if (!(value in obj)) {
                                                // New configs found
                                                newValues.push({ name: value, type: '' });
                                            }
                                        });
                                        // Assign types to values
                                        newValues.forEach(val => {
                                            val.type = configs.properties[val.name].type;
                                        })

                                        let updatedContent = tomlContent + `\n`;

                                        newValues.forEach(obj => {
                                            updatedContent += `${obj.name} = "${obj.type}"\n`;
                                        });

                                        writeFile(uri.fsPath, updatedContent, function (error) {
                                            if (error) {
                                                return window.showInformationMessage("Unable to update the configurable values: " + error);
                                            }
                                            window.showInformationMessage("Successfully updated the configurable values.");
                                        });

                                    } else {
                                       // If there are no existing configs
                                        const newValues = [];
                                        configs.required.forEach(value => {
                                            // New configs found
                                            newValues.push({ name: value, type: '' });
                                        });
                                        // Assign types to values
                                        newValues.forEach(val => {
                                            val.type = configs.properties[val.name].type;
                                        })

                                        let updatedContent = '';

                                        newValues.forEach(obj => {
                                            updatedContent += `${obj.name} = "${obj.type}"\n`;
                                        });

                                        writeFile(uri.fsPath, updatedContent, function (error) {
                                            if (error) {
                                                return window.showInformationMessage("Unable to update the configurable values: " + error);
                                            }
                                            window.showInformationMessage("Successfully updated the configurable values.");
                                        });
                                    }
                                }

                                await workspace.openTextDocument(uri).then(async document => {
                                    window.showTextDocument(document, { preview: false });
                                    const runButton = { title: 'Run Now', isCloseAffordance: true };

                                    const runAgain = await window.showInformationMessage(
                                        'You have to run the project again after updating the configs.',
                                        runButton
                                    );

                                    if (runAgain === runButton) {
                                        runCommand(currentProject, ballerinaExtInstance.getBallerinaCmd(), BALLERINA_COMMANDS.RUN,
                                            currentProject.path!);
                                    }
                                });
                            }
                        } else if (result === ignoreButton) {
                            commands.executeCommand(PALETTE_COMMANDS.RUN_CMD);
                        }

                    }
                }

            }
        });

    }

}
