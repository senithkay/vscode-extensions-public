/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { window, Uri, commands, workspace } from "vscode";
import { existsSync, openSync, readFileSync, writeFile } from "fs";
import { BAL_TOML, CONFIG_FILE, PALETTE_COMMANDS } from "../project";
import { BallerinaExtension, ballerinaExtInstance, ExtendedLangClient } from "../../core";
import { getCurrentBallerinaProject } from "../../utils/project-utils";
import { generateExistingValues, parseTomlToConfig, typeOfComment } from "./utils";
import { ConfigProperty, ConfigTypes, Constants, Property } from "./model";
import { BallerinaProject, PackageConfigSchema, ProjectDiagnosticsResponse } from "@wso2-enterprise/ballerina-core";

const DEBUG_RUN_COMMAND_ID = 'workbench.action.debug.run';

export async function configGenerator(ballerinaExtInstance: BallerinaExtension, filePath: string, isCommand?: boolean,isBi?: boolean): Promise<void> {
    let configFile: string = filePath;
    let packageName: string = 'packageName';

    if (!filePath || !filePath.toString().endsWith(CONFIG_FILE)) {
        const currentProject: BallerinaProject | undefined = isBi ? await getCurrentBIProject(configFile)
        : await getCurrentBallerinaProjectFromContext(ballerinaExtInstance);

        if (!currentProject) {
            return;
        }

        ballerinaExtInstance.getDocumentContext().setCurrentProject(currentProject);

        if (!isCommand && currentProject.kind === 'SINGLE_FILE_PROJECT') {
            // TODO: How to pass config values to single files
            executeRunCommand(ballerinaExtInstance, configFile, isBi);
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

            const data = response as PackageConfigSchema;
            if (data.configSchema === undefined || data.configSchema === null) {
                window.showErrorMessage('Unable to generate the configurables: Error while retrieving the configurable schema.');
                return Promise.reject();
            }

            const configSchema = data.configSchema;
            if (!isCommand && Object.keys(configSchema.properties).length === 0) {
                executeRunCommand(ballerinaExtInstance, configFile, isBi);
                return;
            }

            const props: object = configSchema.properties;
            let orgName;
            for (const key of Object.keys(props)) {
                if (props[key].properties[packageName]) {
                    orgName = props[key].properties;
                    break;
                }
            }

            if (!isCommand && !orgName) {
                executeRunCommand(ballerinaExtInstance, configFile, isBi);
                return;
            }

            const configs: Property = orgName[packageName];

            if (!isCommand && configs.required?.length === 0) {
                executeRunCommand(ballerinaExtInstance, configFile, isBi);
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

                if (Object.keys(obj).length > 0 || tomlContent.length > 0) {
                    findPropertyValues(configs, newValues, obj, tomlContent);
                    updatedContent = tomlContent + '\n';
                } else {
                    findPropertyValues(configs, newValues);
                }
            } else {
                findPropertyValues(configs, newValues);
            }
            const haveRequired = newValues.filter(value => value.required);
            if (newValues.length > 0 && haveRequired.length > 0) {
                await handleNewValues(packageName, newValues, configFile, updatedContent, uri, ignoreFile, ballerinaExtInstance, isCommand);
            } else {
                if (!isCommand) {
                    executeRunCommand(ballerinaExtInstance, configFile, isBi);
                }
            }
        } catch (error) {
            console.error('Error while generating config:', error);
        }
    }
}

export function findPropertyValues(configs: Property, newValues: ConfigProperty[], obj?: any, tomlContent?: string, skipAnyOf?: boolean): void {
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
                const anyOfValue = skipAnyOf && Constants.ANY_OF in property;
                if ((anyOfValue && valueExists) || !valueExists) {
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

export async function getCurrentBallerinaProjectFromContext(ballerinaExtInstance: BallerinaExtension): Promise<BallerinaProject | undefined> {
    let currentProject: BallerinaProject = {};

    if (window.activeTextEditor) {
        currentProject = await getCurrentBallerinaProject();
    } else {
        const document = ballerinaExtInstance.getDocumentContext().getLatestDocument();
        if (document) {
            currentProject = await getCurrentBallerinaProject(document.fsPath);
        }
    }
    return currentProject;
}

export async function getCurrentBIProject(projectPath: string): Promise<BallerinaProject | undefined> {
    let currentProject: BallerinaProject = {};
    currentProject = await getCurrentBallerinaProject(projectPath);
    return currentProject;
}

export async function handleNewValues(packageName: string, newValues: ConfigProperty[], configFile: string, updatedContent: string, uri: Uri, ignoreFile: string, ballerinaExtInstance: BallerinaExtension, isCommand: boolean): Promise<void> {
    let result;
    let btnTitle = 'Add to config';
    let message = 'There are missing mandatory configurables that are required to run the program.';
    if (!existsSync(configFile)) {
        btnTitle = 'Create Config.toml';
        message = 'There are mandatory configurables that are required to run the program.';
    }
    const openConfigButton = { title: btnTitle, isCloseAffordance: true };
    const ignoreButton = { title: 'Run Anyway' };
    if (!isCommand) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        result = await window.showInformationMessage(message, { detail: "", modal: true }, openConfigButton, ignoreButton);
    }

    const docLink = "https://ballerina.io/learn/provide-values-to-configurable-variables/#provide-via-toml-syntax";
    if (isCommand || result === openConfigButton) {
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
                            return window.showErrorMessage('Unable to update the .gitIgnore file: ' + error);
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
    } else if (!isCommand && result === ignoreButton) {
        executeRunCommand(ballerinaExtInstance, configFile);
    }
}

async function executeRunCommand(ballerinaExtInstance: BallerinaExtension, filePath: string, isBi?: boolean) {
    if (ballerinaExtInstance.enabledRunFast() || isBi) {
        const projectHasErrors = await hasProjectContainsErrors(ballerinaExtInstance.langClient, filePath);
        if (projectHasErrors) {
            window.showErrorMessage("Project contains errors. Please fix them and try again.");
        } else {
            commands.executeCommand(DEBUG_RUN_COMMAND_ID);
        }
    } else {
        commands.executeCommand(PALETTE_COMMANDS.RUN_CMD);
    }
}

async function hasProjectContainsErrors(langClient: ExtendedLangClient, path: string) : Promise<boolean> {
    const res = await langClient.getProjectDiagnostics({
        projectRootIdentifier: {
            uri: "file://" + ballerinaExtInstance.getDocumentContext().getCurrentProject().path
        }
    }) as ProjectDiagnosticsResponse;
    if (res.errorDiagnosticMap && Object.keys(res.errorDiagnosticMap).length > 0) {
        return true;
    }
    return false;
}

function updateConfigToml(newValues: ConfigProperty[], updatedContent, configPath) {
    newValues.forEach(obj => {
        if (obj.required) {
            let comment = { value: `# ${typeOfComment} ${obj.type && obj.type.toUpperCase() || "STRING"}` };
            let newConfigValue = getConfigValue(obj.name, obj.property, comment);
            updatedContent += newConfigValue + comment.value + '\n\n';
        } else {
            let comment = { value: `# ${typeOfComment} ${obj.type && obj.type.toUpperCase() || "STRING"}` };
            const optional = `# "${obj.name}" is an optional value\n`;
            let newConfigValue = getConfigValue(obj.name, obj.property, comment);
            updatedContent += `${optional}# ${newConfigValue}${comment.value}\n\n`;
        }
    });

    writeFile(configPath, updatedContent, function (error) {
        if (error) {
            return window.showErrorMessage("Unable to update the configurable values: " + error);
        }
        window.showInformationMessage("Successfully updated the configurable values.");
    });
}

export function getConfigValue(name: string, obj: Property, comment: { value: string }): string {
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
                    const moreInfo = `# For more information refer https://lib.ballerina.io/ballerina/http/\n`;
                    newConfigValue = `${moreInfo}[${name}]\t`;
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
