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
import { BAL_TOML, BAL_CONFIG_FILE, PALETTE_COMMANDS, clearTerminal } from "../project";
import { BallerinaExtension, ballerinaExtInstance, ExtendedLangClient } from "../../core";
import { getCurrentBallerinaProject } from "../../utils/project-utils";
import { parseTomlToConfig, typeOfComment } from "./utils";
import { ConfigProperty, ConfigTypes, Constants, Property } from "./model";
import { BallerinaProject, PackageConfigSchema, ProjectDiagnosticsResponse, SyntaxTree } from "@wso2-enterprise/ballerina-core";
import { TextDocumentEdit } from "vscode-languageserver-types";
import { modifyFileContent } from "../../utils/modification";
import { fileURLToPath } from "url";
import { startDebugging } from "../editor-support/codelens-provider";

const UNUSED_IMPORT_ERR_CODE = "BCE2002";

export async function prepareAndGenerateConfig(ballerinaExtInstance: BallerinaExtension, filePath: string, isCommand?: boolean, isBi?: boolean, executeRun: boolean = true, includeOptional: boolean = false): Promise<void> {
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
        context,
        newValues,
        context.configFilePath,
        updatedContent,
        uri,
        ignoreFile,
        ballerinaExtInstance,
        isCommand,
        isBi,
        includeOptional
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
        orgName: currentProject.orgName!,
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

        // Process all configuration sections including imported modules
        const allProps = context.configSchema.configSchema.properties;
        const newValues: ConfigProperty[] = [];
        let updatedContent = '';
        let existingConfigs = {};

        // Check existing configs
        if (existsSync(context.configFilePath)) {
            const tomlContent: string = readFileSync(Uri.file(context.configFilePath).fsPath, 'utf8');
            existingConfigs = parseTomlToConfig(tomlContent);
            context.existingConfigs = existingConfigs;
            updatedContent = tomlContent + '\n';
        }

        let requiredConfigsFound = false;

        // Process each root organization (ballerina, ballerinax, etc.)
        for (const orgKey of Object.keys(allProps)) {
            const orgProps = allProps[orgKey].properties;

            // Process each package within the organization
            for (const pkgKey of Object.keys(orgProps)) {
                const pkgConfig = orgProps[pkgKey];

                // Skip if there are no required properties
                if (!pkgConfig.required || pkgConfig.required.length === 0) {
                    continue;
                }

                // Get existing configs for this path if available
                const existingModuleConfigs = getExistingConfigsForPath(existingConfigs, orgKey, pkgKey);

                // Find missing required configs
                const moduleNewValues: ConfigProperty[] = [];
                findPropertyValues(pkgConfig, moduleNewValues, existingModuleConfigs, updatedContent || '');

                // Add to our collection with organization prefix
                if (moduleNewValues.length > 0) {
                    moduleNewValues.forEach(value => {
                        value.orgKey = orgKey;
                        value.pkgKey = pkgKey;
                    });
                    newValues.push(...moduleNewValues);

                    // Check if we have any required configs
                    if (moduleNewValues.some(v => v.required)) {
                        requiredConfigsFound = true;
                    }
                }
            }
        }

        return {
            needsConfig: newValues.length > 0 && requiredConfigsFound,
            context,
            newValues,
            updatedContent
        };

    } catch (error) {
        console.error('Error while checking config generation requirement:', error);
        return { needsConfig: false };
    }
}

// Helper function to navigate nested toml structure and get existing configs
function getExistingConfigsForPath(existingConfigs: any, orgKey: string, pkgKey: string): any {
    if (!existingConfigs) return {};

    // Try first as a dotted key like "wso2.testbi"
    const dottedKey = `${orgKey}.${pkgKey}`;
    if (existingConfigs[dottedKey]) {
        return existingConfigs[dottedKey];
    }

    // Try as nested objects
    if (existingConfigs[orgKey] && existingConfigs[orgKey][pkgKey]) {
        return existingConfigs[orgKey][pkgKey];
    }

    return {};
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

export async function handleNewValues(context: ConfigGenerationContext, newValues: ConfigProperty[], configFile: string, updatedContent: string, uri: Uri, ignoreFile: string, ballerinaExtInstance: BallerinaExtension, isCommand: boolean, isBi: boolean, includeOptional: boolean): Promise<void> {
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
            updatedContent = `
# Configuration file for "${context.packageName}"
# 
# This file contains configuration values for configurable variables in your Ballerina code.
# Both package-specific and imported module configurations are included below.
# 
# Learn more about configurable variables:
# ${docLink}
#
# Note: This file is automatically added to .gitignore to protect sensitive information. ${updatedContent}

`;
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

        const groupedValues = groupConfigsByModule(newValues);
        updateConfigTomlByModule(context, groupedValues, updatedContent, uri.fsPath, includeOptional);

        await workspace.openTextDocument(uri).then(async document => {
            window.showTextDocument(document, { preview: false });
        });
    } else if (!isCommand && result === ignoreButton) {
        executeRunCommand(ballerinaExtInstance, configFile, isBi);
    }
}

// Function to group config properties by module
function groupConfigsByModule(configProperties: ConfigProperty[]): Map<string, Map<string, ConfigProperty[]>> {
    const result = new Map<string, Map<string, ConfigProperty[]>>();

    for (const prop of configProperties) {
        const orgKey = prop.orgKey || '';
        const pkgKey = prop.pkgKey || '';

        if (!result.has(orgKey)) {
            result.set(orgKey, new Map<string, ConfigProperty[]>());
        }

        const orgMap = result.get(orgKey)!;
        if (!orgMap.has(pkgKey)) {
            orgMap.set(pkgKey, []);
        }

        orgMap.get(pkgKey)!.push(prop);
    }

    return result;
}


function updateConfigTomlByModule(context: ConfigGenerationContext, groupedValues: Map<string, Map<string, ConfigProperty[]>>, updatedContent: string, configPath: string, includeOptional: boolean): void {
    const orgs = Array.from(groupedValues.keys());
    for (const orgKey of orgs) {
        const orgMap = groupedValues.get(orgKey)!;
        const sortedPackages = Array.from(orgMap.keys()).sort();

        for (const pkgKey of sortedPackages) {
            const configProps = orgMap.get(pkgKey)!;

            if (configProps.length === 0) {
                continue;
            }

            // Add section header if not in content already
            const sectionHeader = `[${orgKey}.${pkgKey}]`;
            const isDefaultModule = orgKey === context.orgName && pkgKey === context.packageName;
            if (!updatedContent.includes(sectionHeader) && !isDefaultModule) {
                updatedContent += `${sectionHeader}\n`;
            }

            // Process required configs
            const requiredProps = configProps.filter(prop => prop.required);
            const optionalProps = configProps.filter(prop => !prop.required);

            // Add required properties
            for (const prop of requiredProps) {
                let comment = { value: `# ${typeOfComment} ${prop.type && prop.type.toUpperCase() || "STRING"}` };
                let configValue = getConfigValue(prop.name, prop.property, comment);
                updatedContent += configValue + comment.value + '\n\n';
            }

            // Add optional properties as comments
            if (includeOptional) {
                for (const prop of optionalProps) {
                    let comment = { value: `# ${typeOfComment} ${prop.type && prop.type.toUpperCase() || "STRING"}` };
                    const optional = `# "${prop.name}" is an optional value\n`;
                    let configValue = getConfigValue(prop.name, prop.property, comment);
                    updatedContent += `${optional}# ${configValue}${comment.value}\n\n`;
                }
            }

            if (pkgKey !== sortedPackages[sortedPackages.length - 1]) {
                updatedContent += '\n';
            }
        }

        if (orgKey !== orgs[orgs.length - 1]) {
            updatedContent += '\n';
        }
    }

    writeFile(configPath, updatedContent, function (error) {
        if (error) {
            return window.showErrorMessage("Unable to update the configurable values: " + error);
        }
        window.showInformationMessage("Successfully updated the configurable values.");
    });
}

async function executeRunCommand(ballerinaExtInstance: BallerinaExtension, filePath: string, isBi?: boolean) {
    if (ballerinaExtInstance.enabledRunFast() || isBi) {
        const projectHasErrors = await cleanAndValidateProject(ballerinaExtInstance.langClient, filePath);
        if (projectHasErrors) {
            window.showErrorMessage("Project contains errors. Please fix them and try again.");
        } else {
            clearTerminal();
            await startDebugging(Uri.file(filePath), false, true, true);
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
            if (!diagnostic) {
                continue;
            }
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
            if (!action?.edit?.documentChanges?.length) {
                continue;
            }
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
            // Use inline object format for nested objects
            newConfigValue = getInlineObjectConfigValue(name, obj);
            comment.value = `# ${typeOfComment} ${ConfigTypes.OBJECT.toUpperCase()}`;
            break;
        default:
            if (Constants.ANY_OF in obj) {
                const anyType: Property = obj.anyOf[0];
                if (anyType.type === ConfigTypes.INTEGER || anyType.type === ConfigTypes.NUMBER) {
                    comment.value = `# ${typeOfComment} ${ConfigTypes.NUMBER.toUpperCase()}`;
                    newConfigValue = `${name} = 0\t`;
                } else if (anyType.type === ConfigTypes.STRING) {
                    newConfigValue = `${name} = ""\t`;
                } else if (anyType.type === ConfigTypes.OBJECT) {
                    // For other objects, use inline format
                    newConfigValue = getInlineObjectConfigValue(name, anyType);
                    comment.value = `# ${typeOfComment} ${ConfigTypes.OBJECT.toUpperCase()}`;
                } else {
                    newConfigValue = `${name} = ""\t`;
                }
            } else {
                newConfigValue = `${name} = ""\t`;
            }
            break;
    }
    return newConfigValue;
}

/**
 * Generate an inline TOML object format for nested objects
 */
function getInlineObjectConfigValue(name: string, property: Property): string {
    if (!property || !property.properties) {
        return `${name} = {}\t`;
    }

    let configValue = `${name} = { `;
    const parts: string[] = [];

    // Add required properties if any
    if (property.required && property.required.length > 0) {
        for (const requiredKey of property.required) {
            if (property.properties[requiredKey]) {
                const propValue = getDefaultValueForType(property.properties[requiredKey]);
                parts.push(`${requiredKey} = ${propValue}`);
            }
        }
    } else {
        const propertyKeys = Object.keys(property.properties);
        const keysToInclude = propertyKeys.slice(0, Math.min(3, propertyKeys.length));

        for (const key of keysToInclude) {
            const propValue = getDefaultValueForType(property.properties[key]);
            parts.push(`${key} = ${propValue}`);
        }
    }

    configValue += parts.join(", ");
    configValue += " }\t";
    return configValue;
}

/**
 * Get default value string for different property types
 */
function getDefaultValueForType(property: Property): string {
    if (!property || !property.type) {
        return '""';
    }

    switch (property.type) {
        case ConfigTypes.INTEGER:
            return "0";
        case ConfigTypes.NUMBER:
            return "0.0";
        case ConfigTypes.BOOLEAN:
            return "false";
        case ConfigTypes.OBJECT:
            return "{}";
        case ConfigTypes.ARRAY:
            return "[]";
        case ConfigTypes.STRING:
        default:
            return '""';
    }
}

function getArrayConfigValue(comment: { value: string }, name: string, item: Property): string {
    let newConfigValue = '';
    switch (item.items?.type) {
        case ConfigTypes.BOOLEAN:
            comment.value = ``;
            newConfigValue = `${name} = []\t# ${typeOfComment} ${ConfigTypes.BOOLEAN.toUpperCase()} array\n`;
            break;
        case ConfigTypes.INTEGER:
            comment.value = ``;
            newConfigValue = `${name} = []\t# ${typeOfComment} ${ConfigTypes.INTEGER.toUpperCase()} array\n`;
            break;
        case ConfigTypes.NUMBER:
            comment.value = ``;
            newConfigValue = `${name} = []\t# ${typeOfComment} ${ConfigTypes.NUMBER.toUpperCase()} array\n`;
            break;
        case ConfigTypes.STRING:
            comment.value = ``;
            newConfigValue = `${name} = []\t# ${typeOfComment} ${ConfigTypes.STRING.toUpperCase()} array\n`;
            break;
        case ConfigTypes.OBJECT:
            comment.value = ``;
            if (item.items.additionalProperties && item.items.additionalProperties.type === ConfigTypes.STRING) {
                // For arrays of map-like objects
                newConfigValue = `${name} = []\t# ${typeOfComment} ${ConfigTypes.OBJECT.toUpperCase()} array\n`;
            } else if (item.items.properties) {
                // For arrays of structured objects
                newConfigValue = `${name} = []\t# ${typeOfComment} ${ConfigTypes.OBJECT.toUpperCase()} array\n`;
            } else {
                newConfigValue = `${name} = []\t# ${typeOfComment} ${ConfigTypes.OBJECT.toUpperCase()} array\n`;
            }
            break;
        case ConfigTypes.ARRAY:
            comment.value = `# ${typeOfComment} ${ConfigTypes.ARRAY.toUpperCase()} of array\n`;
            newConfigValue = `${name} = []\t# ${typeOfComment} Nested array\n`;
            break;
        default:
            newConfigValue = `${name} = []\t# ${typeOfComment} Array\n`;
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
    orgName: string;
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
