/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
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

import { window, Uri, commands, workspace } from "vscode";
import { existsSync, openSync, readFileSync, writeFile } from "fs";
import { BAL_TOML, CONFIG_FILE, PALETTE_COMMANDS } from "../project";
import { BallerinaExtension, BallerinaProject, PackageConfigSchemaResponse } from "../core";
import { getCurrentBallerinaProject } from "../utils/project-utils";
import { generateExistingValues, parseTomlToConfig } from "./utils";
import { ConfigProperty, ConfigTypes, Constants, Property } from "./model";

const typeOfComment = 'Type of';

export async function configGenerator(ballerinaExtInstance: BallerinaExtension, filePath: string): Promise<void> {
    let configFile: string = filePath;
    let packageName: string = 'packageName';

    if (!filePath || !filePath.toString().endsWith(CONFIG_FILE)) {
        const currentProject: BallerinaProject | undefined = await getCurrentBallerinaProjectFromContext(ballerinaExtInstance);

        if (!currentProject) {
            return;
        }

        ballerinaExtInstance.getDocumentContext().setCurrentProject(currentProject);

        if (currentProject.kind === 'SINGLE_FILE_PROJECT') {
            // TODO: How to pass config values to single files
            executeRunCommand(ballerinaExtInstance);
            return;
        }

        filePath = `${currentProject.path}/${BAL_TOML}`;

        packageName = currentProject.packageName!;

        try {
            const response = await ballerinaExtInstance.langClient?.getBallerinaProjectConfigSchema({
                documentIdentifier: {
                    uri: Uri.file(filePath).toString()
                }
            });

            const data = response as PackageConfigSchemaResponse;
            if (data.configSchema === undefined || data.configSchema === null) {
                window.showErrorMessage('Unable to generate the configurables: Error while retrieving the configurable schema.');
                return Promise.reject();
            }

            const configSchema = data.configSchema;
            if (Object.keys(configSchema.properties).length === 0) {
                executeRunCommand(ballerinaExtInstance);
                return;
            }

            const props: object = configSchema.properties;
            const firstKey = Object.keys(props)[0];
            const orgName = props[firstKey].properties;

            if (!orgName) {
                executeRunCommand(ballerinaExtInstance);
                return;
            }

            const configs: Property = orgName[packageName];

            if (configs.required?.length === 0) {
                executeRunCommand(ballerinaExtInstance);
                return;
            }

            configFile = `${currentProject.path}/${CONFIG_FILE}`;
            const ignoreFile = `${currentProject.path}/.gitignore`;
            const uri = Uri.file(configFile);

            const newValues: ConfigProperty[] = [];
            let updatedContent = '';

            if (existsSync(configFile)) {
                const tomlContent: string = readFileSync(uri.fsPath, 'utf8');
                // TODO: There is an issue when parsing the toml file where we have variables after object definitions using [] notations and it takes
                // the rest of the variables below that as attributes of that object.
                const existingConfigs: object = generateExistingValues(parseTomlToConfig(tomlContent), orgName, packageName);
                const obj = existingConfigs['[object Object]'][packageName];

                if (Object.keys(obj).length > 0) {
                    findPropertyValues(configs, newValues, obj, tomlContent);
                    updatedContent = tomlContent + '\n';
                } else {
                    findPropertyValues(configs, newValues);
                }
            } else {
                findPropertyValues(configs, newValues);
            }

            if (newValues.length > 0) {
                await handleNewValues(packageName, newValues, configFile, updatedContent, uri, ignoreFile, ballerinaExtInstance);
            } else {
                executeRunCommand(ballerinaExtInstance);
            }
        } catch (error) {
            console.error('Error while generating config:', error);
        }
    }
}

function findPropertyValues(configs: Property, newValues: ConfigProperty[], obj?: any, tomlContent?: string): void {
    const properties = configs.properties;
    const requiredKeys = configs.required || [];

    for (let propertyKey in properties) {
        if (properties.hasOwnProperty(propertyKey)) {
            const property: Property = properties[propertyKey];
            const isRequired = requiredKeys.includes(propertyKey);
            if (!isRequired && property.required && property.required.length > 0) {
                findPropertyValues(property, newValues, obj, tomlContent);
            } else {
                const valueExists = obj ? (propertyKey in obj || tomlContent.includes(propertyKey)) : false;
                if (!valueExists) {
                    newValues.push({
                        name: propertyKey,
                        type: property.type,
                        property,
                        required: isRequired
                    });
                }
            }
        }
    }
}

async function getCurrentBallerinaProjectFromContext(ballerinaExtInstance: BallerinaExtension): Promise<BallerinaProject | undefined> {
    let currentProject: BallerinaProject = {};

    if (window.activeTextEditor) {
        currentProject = await getCurrentBallerinaProject();
    } else {
        const document = ballerinaExtInstance.getDocumentContext().getLatestDocument();
        if (document) {
            currentProject = await getCurrentBallerinaProject(document.toString());
        }
    }

    return currentProject;
}

async function handleNewValues(packageName: string, newValues: ConfigProperty[], configFile: string, updatedContent: string, uri: Uri, ignoreFile: string, ballerinaExtInstance: BallerinaExtension): Promise<void> {
    let btnTitle = 'Add to config';
    let message = 'There are missing mandatory configurables that are required to run the program.';
    if (!existsSync(configFile)) {
        btnTitle = 'Create Config.toml';
        message = 'There are mandatory configurables that are required to run the program.';
    }

    const openConfigButton = { title: btnTitle, isCloseAffordance: true };
    const ignoreButton = { title: 'Run Anyway' };

    const result = await window.showInformationMessage(message, openConfigButton, ignoreButton);
    const docLink = "https://ballerina.io/learn/configure-ballerina-programs/provide-values-to-configurable-variables/#provide-via-toml-syntax";
    if (result === openConfigButton) {
        if (!existsSync(configFile)) {
            openSync(configFile, 'w');
            updatedContent = `# Configuration file for "${packageName}"\n# How to use see:\n# ${docLink}\n\n\n` + updatedContent;
            if (existsSync(ignoreFile)) {
                const ignoreUri = Uri.file(ignoreFile);
                let ignoreContent: string = readFileSync(ignoreUri.fsPath, 'utf8');
                if (!ignoreContent.includes(CONFIG_FILE)) {
                    ignoreContent += `\n${CONFIG_FILE}\n`;
                    writeFile(ignoreUri.fsPath, ignoreContent, function (error) {
                        if (error) {
                            return window.showInformationMessage('Unable to update the .gitIgnore file: ' + error);
                        }
                        window.showInformationMessage('Successfully updated the .gitIgnore file.');
                    });
                }
            }
        }

        newValues.sort((a, b) => {
            if (a.required === false && b.required === true) {
                return -1; // a should come before b
            } else if (a.required === true && b.required === false) {
                return 1; // a should come after b
            } else {
                return 0; // the order of a and b remains unchanged
            }
        });
        updateConfigToml(newValues, updatedContent, uri.fsPath);

        await workspace.openTextDocument(uri).then(async document => {
            window.showTextDocument(document, { preview: false });
        });
    } else if (result === ignoreButton) {
        executeRunCommand(ballerinaExtInstance);
    }
}

function executeRunCommand(ballerinaExtInstance: BallerinaExtension): void {
    if (ballerinaExtInstance.enabledRunFast()) {
        commands.executeCommand(PALETTE_COMMANDS.RUN_FAST);
    } else {
        commands.executeCommand(PALETTE_COMMANDS.RUN_CMD);
    }
}


function updateConfigToml(newValues: ConfigProperty[], updatedContent, configPath) {
    newValues.forEach(obj => {
        if (obj.required) {
            let comment = { value: `# ${typeOfComment} ${obj.type && obj.type.toUpperCase() || "STRING"}` };
            let newConfigValue = getConfigValue(obj.name, obj.property, comment);
            updatedContent += newConfigValue + comment.value + '\n\n';
        } else {
            let comment = { value: `# "${obj.name}" is an optional value\n\n` };
            updatedContent += comment.value;
        }
    });

    writeFile(configPath, updatedContent, function (error) {
        if (error) {
            return window.showInformationMessage("Unable to update the configurable values: " + error);
        }
        window.showInformationMessage("Successfully updated the configurable values.");
    });
}

function getConfigValue(name: string, obj: Property, comment: { value: string }): string {
    let newConfigValue = '';
    switch (obj.type) {
        case ConfigTypes.BOOLEAN:
            newConfigValue = `${name} = false\t`;
            break;
        case ConfigTypes.INTEGER:
            newConfigValue = `${name} = 0\t`;
            break;
        case ConfigTypes.NUMBER:
            newConfigValue = `${name} = 0.0\t`;
            break;
        case ConfigTypes.STRING:
            newConfigValue = `${name} = ""\t`;
            break;
        case ConfigTypes.ARRAY:
            newConfigValue = getArrayConfigValue(comment, name, obj);
            break;
        case ConfigTypes.OBJECT:
            newConfigValue = getObjectConfigValue(comment, name, obj);
            break;
        default:
            if (Constants.ANY_OF in obj) {
                const anyType: Property = obj.anyOf[0];
                if (anyType.type === ConfigTypes.INTEGER || anyType.type === ConfigTypes.NUMBER) {
                    comment.value = `# ${typeOfComment} ${ConfigTypes.NUMBER.toUpperCase()}`;
                    newConfigValue = `${name} = 0\t`;
                } else if (anyType.type === ConfigTypes.STRING) {
                    newConfigValue = `${name} = ""\t`;
                } else if (anyType.type === ConfigTypes.OBJECT && anyType.name.includes(Constants.HTTP)) {
                    comment.value = `# ${typeOfComment} ${ConfigTypes.OBJECT.toUpperCase()}\n`;
                    comment.value += `# For more information refer https://lib.ballerina.io/ballerina/http/\n`;
                    newConfigValue = `[${name}]\t`;
                } else {
                    comment.value = `# ${typeOfComment} ${ConfigTypes.OBJECT.toUpperCase()}`;
                    newConfigValue = `[${name}]\t`;
                }
            } else {
                newConfigValue = `${name} = ""\t`;
            }
            break;
    }
    return newConfigValue;
}

function getArrayConfigValue(comment: { value: string }, name: string, item: Property): string {
    let newConfigValue = '';
    switch (item.type) {
        case ConfigTypes.BOOLEAN:
            comment.value = ``;
            newConfigValue = `${name} = []\t# ${typeOfComment} ${ConfigTypes.BOOLEAN.toUpperCase()} array\n# Example: ${name} = [false, false]\n`;
            break;
        case ConfigTypes.INTEGER:
            comment.value = ``;
            newConfigValue = `${name} = []\t# ${typeOfComment} ${ConfigTypes.INTEGER.toUpperCase()} array\n# Example: ${name} = [0, 0]\n`;
            break;
        case ConfigTypes.NUMBER:
            comment.value = ``;
            newConfigValue = `${name} = []\t# ${typeOfComment} ${ConfigTypes.NUMBER.toUpperCase()} array\n# Example: ${name} = [0.0, 0.0]\n`;
            break;
        case ConfigTypes.STRING:
            comment.value = ``;
            newConfigValue = `${name} = []\t# ${typeOfComment} ${ConfigTypes.STRING.toUpperCase()} array\n# Example: ${name} = ["red", "green"]\n`;
            break;
        case ConfigTypes.ARRAY:
            comment.value = `# ${typeOfComment} ${ConfigTypes.ARRAY.toUpperCase()} of array\n`;
            newConfigValue = getArrayConfigValue(comment, name, item.items);
            break;
        case ConfigTypes.OBJECT:
            comment.value = ``;
            if (item.additionalProperties && item.additionalProperties.type === ConfigTypes.STRING) {
                newConfigValue = `[[${name}]]\t# ${typeOfComment} ${ConfigTypes.OBJECT.toUpperCase()} array\n# Example:\n# [[${name}]]\n# name = "John"\n# city = "Paris"\n# [[${name}]]\n# name = "Jack"\n# city = "Colombo"\n`;
            } else {
                newConfigValue = getObjectConfigValue(comment, `[${name}]`, item);
            }
            break;
        default:
            newConfigValue = `${name} = ""\t`;
            break;
    }
    return newConfigValue;
}

function getObjectConfigValue(comment: { value: string }, name: string, property: Property, parentObject?: string): string {
    let newConfigValue = `[${name}]\t# ${typeOfComment} ${ConfigTypes.OBJECT.toUpperCase()}\n`;
    comment.value = ``;
    if (parentObject) {
        newConfigValue = ``;
    }

    if (property && property.required?.length > 0) {
        property.required.forEach(val => {
            const obj: Property = property.properties[val];
            let propertyValue = '';
            // TODO: Following code block gives errors when parsing the toml file due to the dotted object notations. Find a better parser for toml
            // if (parentObject) {
            //     val = `${parentObject}.${val}`;
            // }
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
                    propertyValue = getArrayConfigValue(comment, name, obj);
                    break;
                case ConfigTypes.OBJECT:
                    propertyValue = getObjectConfigValue(comment, name, obj, val);
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
