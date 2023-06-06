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
import { generateExistingValues, parseTomlToConfig } from "./utils";
import { ConfigProperty, ConfigTypes, Property } from "./model";


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
        } else {
            ballerinaExtInstance.getDocumentContext().setCurrentProject(currentProject);
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

            if (Object.keys(data.configSchema?.properties).length > 0) {
                const props: object = data.configSchema?.properties;
                var firstKey = Object.keys(props)[0];
                var orgName = props[firstKey].properties;
                if (orgName) {
                    const configs: {
                        additionalProperties: boolean
                        properties: {}
                        required: []
                    } = orgName[packageName];
                    if (configs.required?.length > 0) {

                        configFile = `${currentProject.path}/${CONFIG_FILE}`;
                        const uri = Uri.file(configFile);

                        const newValues: ConfigProperty[] = [];
                        let updatedContent = '';

                        // If the config file exist check for existing values
                        if (existsSync(configFile)) {
                            const tomlContent: string = readFileSync(uri.fsPath, 'utf8');
                            const existingConfigs: object = generateExistingValues(parseTomlToConfig(tomlContent), orgName, packageName);
                            const obj = existingConfigs['[object Object]'][packageName]

                            // If there are existing configs check for new ones
                            if (Object.keys(obj).length > 0) {

                                configs.required.forEach(value => {
                                    if (!(value in obj)) {
                                        // New configs found
                                        newValues.push({ name: value, type: '', property: undefined });
                                    }
                                });
                                // Assign types to values
                                newValues.forEach(val => {
                                    val.type = configs.properties[val.name].type;
                                    val.property = configs.properties[val.name]
                                })

                                updatedContent = tomlContent + `\n`;

                            } else {
                                // If the config file is empty
                                configs.required.forEach(value => {
                                    // New configs
                                    newValues.push({ name: value, type: '', property: undefined });
                                });
                                // Assign types to values
                                newValues.forEach(val => {
                                    val.type = configs.properties[val.name].type;
                                    val.property = configs.properties[val.name]
                                })
                            }
                        } else {
                            // If no config files add all the required config values
                            configs.required.forEach(value => {
                                // New configs found
                                newValues.push({ name: value, type: '', property: undefined });
                            });
                            // Assign types to values
                            newValues.forEach(val => {
                                val.type = configs.properties[val.name].type;
                                val.property = configs.properties[val.name]
                            })
                        }

                        // If there are newValues to be added to the config ask the message
                        if (newValues.length > 0) {
                            let btnTitle = "Open config";
                            let message = "There are mandatory configurables that are required to run the project."
                            if (!existsSync(configFile)) {
                                btnTitle = "Create new config";
                            }
                            // Config generation message with button
                            const openConfigButton = { title: btnTitle, isCloseAffordance: true };
                            const ignoreButton = { title: 'Ignore' };

                            const result = await window.showInformationMessage(
                                message,
                                openConfigButton,
                                ignoreButton
                            );

                            if (result === openConfigButton) {

                                if (!existsSync(configFile)) {
                                    openSync(configFile, 'w');
                                }

                                // Update the config toml file with new values
                                updateConfigToml(newValues, updatedContent, uri.fsPath);

                                await workspace.openTextDocument(uri).then(async document => {
                                    window.showTextDocument(document, { preview: false });
                                    window.showWarningMessage('You have to run the project again after updating the new configurable values.');
                                });

                            } else if (result === ignoreButton) {
                                commands.executeCommand(PALETTE_COMMANDS.RUN_CMD);
                            }

                        } else {
                            commands.executeCommand(PALETTE_COMMANDS.RUN_CMD);
                        }
                    } else {
                        commands.executeCommand(PALETTE_COMMANDS.RUN_CMD);
                    }

                }

            } else {
                commands.executeCommand(PALETTE_COMMANDS.RUN_CMD);
            }
        });

    }

}

function updateConfigToml(newValues: ConfigProperty[], updatedContent, configPath) {
    newValues.forEach(obj => {
        let comment = `# Following config value should be a type of ${obj.type && obj.type.toUpperCase() || "STRING"}\n`;
        let newConfigValue = getConfigValue(obj.name, obj.property);
        updatedContent += comment + newConfigValue + '\n';
    });

    writeFile(configPath, updatedContent, function (error) {
        if (error) {
            return window.showInformationMessage("Unable to update the configurable values: " + error);
        }
        window.showInformationMessage("Successfully updated the configurable values.");
    });
}

function getConfigValue(name: string, obj: Property): string {
    let newConfigValue = '';
    switch (obj.type) {
        case ConfigTypes.BOOLEAN:
            newConfigValue = `${name} = false\n`;
            break;
        case ConfigTypes.INTEGER:
            newConfigValue = `${name} = 0\n`;
            break;
        case ConfigTypes.NUMBER:
            newConfigValue = `${name} = 0.0\n`;
            break;
        case ConfigTypes.STRING:
            newConfigValue = `${name} = ""\n`;
            break;
        case ConfigTypes.ARRAY:
            newConfigValue = getArrayConfigValue(name, obj);
            break;
        case ConfigTypes.OBJECT:
            newConfigValue = getObjectConfigValue(name, obj);
            break;
        default:
            if ('anyOf' in obj) {
                const anyType: Property = obj.anyOf[0];
                if (anyType.type === ConfigTypes.INTEGER || anyType.type === ConfigTypes.NUMBER) {
                    newConfigValue = `${name} = 0\n`;
                } else if (anyType.type === ConfigTypes.STRING) {
                    newConfigValue = `${name} = ""\n`;
                } else {
                    newConfigValue = `[${name}]\n`;
                }
            } else {
                newConfigValue = `${name} = ""\n`;
            }
            break;
    }
    return newConfigValue;
}

function getArrayConfigValue(name: string, item: Property): string {
    let newConfigValue = '';
    switch (item.type) {
        case ConfigTypes.BOOLEAN:
            newConfigValue = `${name} = [false, false]\n`;
            break;
        case ConfigTypes.INTEGER:
            newConfigValue = `${name} = [0, 0]\n`;
            break;
        case ConfigTypes.NUMBER:
            newConfigValue = `${name} = [0.0, 0.0]\n`;
            break;
        case ConfigTypes.STRING:
            newConfigValue = `${name} = ["", ""]\n`;
            break;
        case ConfigTypes.ARRAY:
            newConfigValue = getArrayConfigValue(name, item.items);
            break;
        case ConfigTypes.OBJECT:
            if (item.additionalProperties && item.additionalProperties.type === ConfigTypes.STRING) {
                newConfigValue = `[[${name}]]\nname = "John"\ncity = "Paris"\n[[${name}]]\nname = "Jack"\ncity = "Colombo"\n`;
            } else {
                newConfigValue = getObjectConfigValue(`[${name}]`, item);
            }
            break;
        default:
            newConfigValue = `${name} = ""\n`;
            break;
    }
    return newConfigValue;
}

function getObjectConfigValue(name: string, property: Property, parentObject?: string): string {
    let newConfigValue = parentObject ? '' :`[${name}]\n`;
    if (property && property.required?.length > 0) {
        property.required.forEach(val => {
            const obj: Property = property.properties[val];
            let propertyValue = '';
            if (parentObject) {
                val = `${parentObject}.${val}`;
            }
            switch (obj.type) {
                case ConfigTypes.INTEGER:
                    propertyValue = `${val} = 0\n`;
                    break;
                case ConfigTypes.STRING:
                    propertyValue = `${val} = ""\n`;
                    break;
                case ConfigTypes.NUMBER:
                    propertyValue = `${val} = 0.0\n`;
                    break;
                case ConfigTypes.ARRAY:
                    propertyValue = getArrayConfigValue(name, obj);
                    break;
                case ConfigTypes.OBJECT:
                    propertyValue = getObjectConfigValue(name, obj, val);
                    break;
                default:
                    propertyValue = `${val} = ""\n`;
                    break;
            }
            newConfigValue += propertyValue;
        });
    }
    return newConfigValue;
}
