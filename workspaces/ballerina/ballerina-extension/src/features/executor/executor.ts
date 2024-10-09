/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { window, Uri, commands } from "vscode";
import { existsSync, readFileSync } from "fs";
import { StateMachine } from "../..//stateMachine";
import { ballerinaExtInstance } from "../../core";
import { BallerinaProject, PackageConfigSchema, BI_COMMANDS } from "@wso2-enterprise/ballerina-core";
import { getCurrentBallerinaProject } from "../../utils/project-utils";
import { BAL_TOML, CONFIG_FILE, PALETTE_COMMANDS } from "../project";
import { ConfigProperty, Property } from "./../config-generator/model";
import { findPropertyValues, handleNewValues } from "./../config-generator/configGenerator";
import { generateExistingValues, parseTomlToConfig } from "./../config-generator/utils";

const outputChannel = window.createOutputChannel("Ballerina Integrator Executor");

export async function startRunningBiProject() {
    generateConfigToml();
    run();
}

export async function stopRunningBiProject() {
    ballerinaExtInstance.langClient.executeCommand({ command: "STOP", arguments: [{ key: "path", value: StateMachine.context().projectUri }] })
        .then((didStop) => {
        if (didStop) {
            StateMachine.context().biRunning = false;
            commands.executeCommand('setContext', 'biRunning', false);
        }
    });
}

async function run() {
    // sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_PROJECT_RUN_FAST, CMP_PROJECT_RUN); TODO: Fix telemetry
    const langClient = ballerinaExtInstance.langClient;
    langClient.onNotification('$/logTrace', (params: any) => {
        if (params.verbose === "stopped") { 
            // even if a single channel (stderr,stdout) stopped, we stop the debug session
            StateMachine.context().biRunning = false;
            commands.executeCommand('setContext', 'biRunning', false);
        } else {
            outputChannel.append(params.message);
        }
    });
    runFast(StateMachine.context().projectUri).then((didRan) => {
        if (didRan) {
            outputChannel.show();
            commands.executeCommand('setContext', 'biRunning', true);
            commands.executeCommand(BI_COMMANDS.BI_OPEN_RUNTIME_VIEW);
        } else {
            window.showErrorMessage("Project running failed!");
            StateMachine.context().biRunning = false;
            commands.executeCommand('setContext', 'biRunning', false);
        }
    });
}

async function runFast(root: string) {
    if (window.activeTextEditor && window.activeTextEditor.document.isDirty) {
        await commands.executeCommand(PALETTE_COMMANDS.SAVE_ALL);
    }
    return await ballerinaExtInstance.langClient.executeCommand({ command: "RUN", arguments: [{ key: "path", value: root }] });
}

async function generateConfigToml(): Promise<void> {
    
    let configFile: string = StateMachine.context().projectUri;
    const currentProject: BallerinaProject | undefined = await getCurrentBIProject(configFile);
    if (!currentProject) {
        return;
    }

    ballerinaExtInstance.getDocumentContext().setCurrentProject(currentProject);
    if (currentProject.kind === 'SINGLE_FILE_PROJECT') {
        // TODO: How to pass config values to single files
        return;
    }

    const balTomlPath: string = `${currentProject.path}/${BAL_TOML}`;
    const packageName: string = currentProject.packageName!;

    try {
        const response = await ballerinaExtInstance.langClient?.getBallerinaProjectConfigSchema({
            documentIdentifier: {
                uri: Uri.file(balTomlPath).toString()
            }
        });

        const data = response as PackageConfigSchema;
        if (data.configSchema === undefined || data.configSchema === null) {
            window.showErrorMessage('Unable to generate the configurables: Error while retrieving the configurable schema.');
            return Promise.reject();
        }

        const configSchema = data.configSchema;
        if (Object.keys(configSchema.properties).length === 0) {
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

        if (!orgName) {
            return;
        }

        const configs: Property = orgName[packageName];

        if (configs.required?.length === 0) {
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
            await handleNewValues(packageName, newValues, configFile, updatedContent, uri, ignoreFile, ballerinaExtInstance, true);
        }
    } catch (error) {
        console.error('Error while generating config:', error);
    }
}

async function getCurrentBIProject(projectPath: string): Promise<BallerinaProject | undefined> {
    let currentProject: BallerinaProject = {};
    currentProject = await getCurrentBallerinaProject(projectPath);
    return currentProject;
}
