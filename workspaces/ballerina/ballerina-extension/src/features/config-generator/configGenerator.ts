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
import { BAL_TOML, BAL_CONFIG_FILE, PALETTE_COMMANDS } from "../project";
import { BallerinaExtension, ballerinaExtInstance, ExtendedLangClient } from "../../core";
import { getCurrentBallerinaProject } from "../../utils/project-utils";
import { generateExistingValues, parseTomlToConfig, typeOfComment } from "./utils";
import { ConfigProperty, ConfigTypes, Constants, Property } from "./model";
import { BallerinaProject, PackageConfigSchema, ProjectDiagnosticsResponse, SyntaxTree } from "@wso2-enterprise/ballerina-core";
import { TextDocumentEdit } from "vscode-languageserver-types";
import { modifyFileContent } from "../../utils/modification";
import { fileURLToPath } from "url";

const DEBUG_RUN_COMMAND_ID = 'workbench.action.debug.run';
const UNUSED_IMPORT_ERR_CODE = "BCE2002";

export async function prepareAndGenerateConfig(ballerinaExtInstance: BallerinaExtension, filePath: string, isCommand?: boolean, isBi?: boolean, executeRun: boolean = true): Promise<void> {
    const configRequirement: ConfigRequirementResult = await checkConfigGenerationRequired(ballerinaExtInstance, filePath, isBi);

    if (!configRequirement.needsConfig) {
        if (!isCommand && executeRun) {
            executeRunCommand(ballerinaExtInstance, filePath, isBi);
        }
        return;
    }

    const { context, newValues, updatedContent } = configRequirement;
    if (!context || !newValues) {
        return;
    }

    const uri = Uri.file(context.configFilePath);
    const ignoreFile = `${context.projectPath}/.gitignore`;

    await handleNewValues(
        context.packageName,
        newValues,
        context.configFilePath,
        updatedContent,
        uri,
        ignoreFile,
        ballerinaExtInstance,
        isCommand,
        isBi
    );
}

export async function checkConfigGenerationRequired(ballerinaExtInstance: BallerinaExtension, filePath: string, isBi?: boolean): Promise<ConfigRequirementResult> {
    // Return early if config file is provided
    if (filePath && filePath.toString().endsWith(BAL_CONFIG_FILE)) {
        return { needsConfig: false };
    }

    // Get current project
    const currentProject: BallerinaProject | undefined = isBi
        ? await getCurrentBIProject(filePath)
        : await getCurrentBallerinaProjectFromContext(ballerinaExtInstance);

    if (!currentProject) {
        return { needsConfig: false };
    }

    ballerinaExtInstance.getDocumentContext().setCurrentProject(currentProject);

    // TODO: How to pass config values to single files
    if (currentProject.kind === 'SINGLE_FILE_PROJECT') {
        return { needsConfig: false };
    }

    const context: ConfigGenerationContext = {
        packageName: currentProject.packageName!,
        projectPath: currentProject.path,
        configFilePath: `${currentProject.path}/${BAL_CONFIG_FILE}`
    };

    // Get config schema
    try {
        const response = await ballerinaExtInstance.langClient?.getBallerinaProjectConfigSchema({
            documentIdentifier: {
                uri: Uri.file(`${currentProject.path}/${BAL_TOML}`).toString()
            }
        });

        if (response && 'configSchema' in response) {
            context.configSchema = response as PackageConfigSchema;
        } else {
            return { needsConfig: false };
        }

        if (!context.configSchema?.configSchema || Object.keys(context.configSchema.configSchema.properties).length === 0) {
            return { needsConfig: false };
        }

        // Find organization name and package configs
        const props: object = context.configSchema.configSchema.properties;
        let orgName: string;
        for (const key of Object.keys(props)) {
            if (props[key].properties[context.packageName]) {
                orgName = props[key].properties;
                break;
            }
        }

        if (!orgName) {
            return { needsConfig: false };
        }

        const configs: Property = orgName[context.packageName];

        if (configs.required?.length === 0) {
            return { needsConfig: false };
        }

        // Check existing configs
        const newValues: ConfigProperty[] = [];
        let updatedContent = '';

        if (existsSync(context.configFilePath)) {
            const tomlContent: string = readFileSync(Uri.file(context.configFilePath).fsPath, 'utf8');
            const existingConfigs: object = generateExistingValues(
                parseTomlToConfig(tomlContent),
                orgName,
                context.packageName
            );
            context.existingConfigs = existingConfigs;

            const obj = existingConfigs['[object Object]'][context.packageName];

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

        return {
            needsConfig: newValues.length > 0 && haveRequired.length > 0,
            context,
            newValues,
            updatedContent
        };

    } catch (error) {
        console.error('Error while checking config generation requirement:', error);
        return { needsConfig: false };
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

export async function handleNewValues(packageName: string, newValues: ConfigProperty[], configFile: string, updatedContent: string, uri: Uri, ignoreFile: string, ballerinaExtInstance: BallerinaExtension, isCommand: boolean, isBi: boolean): Promise<void> {
    let result;
    let btnTitle: string;
    let message: string;

    if (!existsSync(configFile)) {
        message = 'Missing Config.toml file';
        btnTitle = 'Create Config.toml';
    } else {
        message = 'Missing required configurations in Config.toml file';
        btnTitle = 'Update Config.toml';
    }

    const openConfigButton = { title: btnTitle };
    const ignoreButton = { title: 'Run Anyway' };
    const details = "It is recommended to create/update the Config.toml with all mandatory configuration values before running the program.";

    if (!isCommand) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        result = await window.showInformationMessage(message, { detail: details, modal: true }, openConfigButton, ignoreButton);
    }

    const docLink = "https://ballerina.io/learn/provide-values-to-configurable-variables/#provide-via-toml-syntax";
    if (isCommand || result === openConfigButton) {
        if (!existsSync(configFile)) {
            openSync(configFile, 'w');
            updatedContent = `# Configuration file for "${packageName}"\n# How to use see:\n# ${docLink}\n\n\n` + updatedContent;
            if (existsSync(ignoreFile)) {
                const ignoreUri = Uri.file(ignoreFile);
                let ignoreContent: string = readFileSync(ignoreUri.fsPath, 'utf8');
                if (!ignoreContent.includes(BAL_CONFIG_FILE)) {
                    ignoreContent += `\n${BAL_CONFIG_FILE}\n`;
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
        executeRunCommand(ballerinaExtInstance, configFile, isBi);
    }
}

async function executeRunCommand(ballerinaExtInstance: BallerinaExtension, filePath: string, isBi?: boolean) {
    if (ballerinaExtInstance.enabledRunFast() || isBi) {
        const projectHasErrors = await cleanAndValidateProject(ballerinaExtInstance.langClient, filePath);
        if (projectHasErrors) {
            window.showErrorMessage("Project contains errors. Please fix them and try again.");
        } else {
            commands.executeCommand(DEBUG_RUN_COMMAND_ID);
        }
    } else {
        commands.executeCommand(PALETTE_COMMANDS.RUN_CMD);
    }
}

export async function cleanAndValidateProject(langClient: ExtendedLangClient, path: string): Promise<boolean> {
    try {
        // Get initial project diagnostics
        const projectPath = ballerinaExtInstance?.getDocumentContext()?.getCurrentProject()?.path || path;
        let response: ProjectDiagnosticsResponse = await langClient.getProjectDiagnostics({
            projectRootIdentifier: {
                uri: Uri.file(projectPath).toString()
            }
        });

        if (!response.errorDiagnosticMap || Object.keys(response.errorDiagnosticMap).length === 0) {
            return false;
        }

        // Process each file with diagnostics
        for (const [filePath, diagnostics] of Object.entries(response.errorDiagnosticMap)) {
            // Filter the unused import diagnostics
            const diagnostic = diagnostics.find(d => d.code === UNUSED_IMPORT_ERR_CODE);
            if (!diagnostic) continue;
            const codeActions = await langClient.codeAction({
                textDocument: { uri: filePath },
                range: {
                    start: diagnostic.range.start,
                    end: diagnostic.range.end
                },
                context: { diagnostics: [diagnostic] }
            });

            // Find and apply the appropriate code action
            const action = codeActions.find(action => action.title === "Remove all unused imports");
            if (!action?.edit?.documentChanges?.length) continue;
            const docEdit = action.edit.documentChanges[0] as TextDocumentEdit;

            // Apply modifications to syntax tree
            const syntaxTree = await langClient.stModify({
                documentIdentifier: { uri: docEdit.textDocument.uri },
                astModifications: docEdit.edits.map(edit => ({
                    startLine: edit.range.start.line,
                    startColumn: edit.range.start.character,
                    endLine: edit.range.end.line,
                    endColumn: edit.range.end.character,
                    type: "INSERT",
                    isImport: true,
                    config: { STATEMENT: edit.newText }
                }))
            });

            // Update file content
            const { source } = syntaxTree as SyntaxTree;
            const absolutePath = fileURLToPath(filePath);
            await modifyFileContent({ filePath: absolutePath, content: source });
        }

        // Check if errors still exist after fixes
        const updatedResponse: ProjectDiagnosticsResponse = await langClient.getProjectDiagnostics({
            projectRootIdentifier: {
                uri: Uri.file(projectPath).toString()
            }
        });

        return updatedResponse.errorDiagnosticMap && updatedResponse.errorDiagnosticMap.size > 0;
    } catch (error) {
        return true;
    }
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

export interface ConfigGenerationContext {
    packageName: string;
    projectPath: string;
    configFilePath: string;
    configSchema?: PackageConfigSchema;
    existingConfigs?: object;
}

export interface ConfigRequirementResult {
    needsConfig: boolean;
    context?: ConfigGenerationContext;
    newValues?: ConfigProperty[];
    updatedContent?: string;
}
