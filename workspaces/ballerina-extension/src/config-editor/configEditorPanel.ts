/**
 * Copyright (c) 2021, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

import { ViewColumn, window, WebviewPanel, Uri, commands } from "vscode";
import { getCommonWebViewOptions, WebViewMethod, WebViewRPCHandler } from '../utils';
import { render } from './renderer';
import { existsSync, mkdirSync, openSync, readFileSync, writeFile } from "fs";
import { INTERNAL_DEBUG_COMMAND } from "../editor-support/codelens-provider";
import { BAL_TOML, CONFIG_FILE, PALETTE_COMMANDS } from "../project";
import { BallerinaExtension, BallerinaProject, ExtendedLangClient, PackageConfigSchemaResponse } from "../core";
import { generateExistingValues, parseConfigToToml, parseTomlToConfig } from "./utils";
import { getCurrentBallerinaProject } from "../utils/project-utils";
import path from "path";
import os from "os";
import { Commands } from "./model";

let configEditorPanel: WebviewPanel | undefined;
let langClient: ExtendedLangClient;

export async function openConfigEditor(ballerinaExtInstance: BallerinaExtension, filePath: string, 
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
        const directory = path.join(os.tmpdir(), "ballerina-project", packageName);
        if (!existsSync(directory)) {
            mkdirSync(directory, { recursive: true });
        }
        console.debug("Project temp directory: " + directory);

        configFile = `${directory}/${CONFIG_FILE}`;
        if (!existsSync(configFile)) {
            openSync(configFile, 'w');
        }
    }

    await ballerinaExtInstance.langClient?.getBallerinaProjectConfigSchema({
        documentIdentifier: {
            uri: Uri.file(filePath).toString()
        }
    }).then(response => {
        const data = response as PackageConfigSchemaResponse;
        if (data.configSchema === undefined || data.configSchema === null) {
            window.showErrorMessage('Unable to render the configurable editor: Error while '
                + 'retrieving the configurable schema.');
            return Promise.reject();
        }
        showConfigEditor(ballerinaExtInstance, data.configSchema, Uri.parse(configFile), packageName, isDebug);
    });
}

async function showConfigEditor(ballerinaExtInstance: BallerinaExtension, configSchema: any,
                                currentFileUri: Uri, packageName: string, isDebug: boolean) {
    if (configEditorPanel) {
        configEditorPanel.dispose();
    }

    if (Object.keys(configSchema.properties).length === 0) {
        isDebug ? commands.executeCommand(INTERNAL_DEBUG_COMMAND) : commands.executeCommand(PALETTE_COMMANDS.RUN_CMD);
        return;
    }

    ballerinaExtInstance.setBallerinaConfigPath(currentFileUri.fsPath);
    langClient = <ExtendedLangClient>ballerinaExtInstance.langClient;
    let projectOrg: string = "orgName"; // TODO: set the correct project organization name

    // Create and show a new webview
    configEditorPanel = window.createWebviewPanel(
        'ballerinaConfigEditor',
        `Configurable Editor`,
        { viewColumn: ViewColumn.Beside, preserveFocus: true },
        getCommonWebViewOptions()
    );

    function handleConfigInputs(configInputs: any) {
        writeFile(currentFileUri.fsPath, parseConfigToToml(configInputs, packageName), function (error) {
            if (error) {
                return window.showInformationMessage("Unable to update the configurable values: " + error);
            }
            window.showInformationMessage("Successfully updated the configurable values.");
        });
    }

    const remoteMethods: WebViewMethod[] = [
        {
            methodName: "onClickDefaultButton",
            handler: () => {
                configEditorPanel?.dispose();
            }
        },
        {
            methodName: "onClickPrimaryButton",
            handler: (args: any[]) => {
                handleConfigInputs(args[0]);
                const env = { BAL_CONFIG_FILES: currentFileUri.fsPath };
                isDebug ? commands.executeCommand(INTERNAL_DEBUG_COMMAND, env)
                        : commands.executeCommand(PALETTE_COMMANDS.RUN_CMD);
                configEditorPanel?.dispose();
            }
        }
    ];

    WebViewRPCHandler.create(configEditorPanel, langClient, remoteMethods);

    const tomlContent: string = readFileSync(currentFileUri.fsPath, 'utf8');
    const existingConfigs: object = generateExistingValues(parseTomlToConfig(tomlContent), projectOrg, packageName);

    if (configEditorPanel) {
        const html = render(configSchema, existingConfigs, isDebug ? Commands.DEBUG : Commands.RUN, configEditorPanel.webview);
        if (html) {
            configEditorPanel.webview.html = html;
        }
    }

    configEditorPanel.onDidDispose(() => {
        configEditorPanel = undefined;
    });
}
