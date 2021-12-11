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

import { ViewColumn, window, WebviewPanel, Uri, commands } from "vscode";
import { getCommonWebViewOptions, WebViewMethod, WebViewRPCHandler } from '../utils';
import { render } from './renderer';
import { readFileSync, writeFile } from "fs";
import { PALETTE_COMMANDS } from "../project";
import { BallerinaExtension, ExtendedLangClient } from "../core";
import { generateExistingValues, parseConfigToToml, parseTomlToConfig } from "./utils";

let configEditorPanel: WebviewPanel | undefined;
let langClient: ExtendedLangClient;

export function showConfigEditor(ballerinaExtInstance: BallerinaExtension,
                                 configSchema: any, currentFileUri: Uri): void {
    if (configEditorPanel) {
        configEditorPanel.dispose();
    }

    if (Object.keys(configSchema.properties).length === 0) {
        commands.executeCommand(PALETTE_COMMANDS.RUN);
        return;
    }

    langClient = <ExtendedLangClient>ballerinaExtInstance.langClient;
    let projectOrg: string = "orgName"; // TODO: set the correct project organization name
    let packageName: string = "packageName"; // TODO: set the correct package name

    // Create and show a new webview
    configEditorPanel = window.createWebviewPanel(
        'ballerinaConfigEditor',
        `Configurable Editor`,
        { viewColumn: ViewColumn.Beside, preserveFocus: true },
        getCommonWebViewOptions()
    );

    function handleConfigInputs(configInputs: any) {
        writeFile(currentFileUri.fsPath, parseConfigToToml(configInputs), function (error) {
            if (error) {
                return window.showInformationMessage("Unable to update the Config.toml file: " + error);
            }
            window.showInformationMessage("Successfully updated the Config.toml file.");
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
                commands.executeCommand(PALETTE_COMMANDS.RUN);
                configEditorPanel?.dispose();
            }
        }
    ];

    WebViewRPCHandler.create(configEditorPanel, langClient, remoteMethods);

    const tomlContent: string = readFileSync(currentFileUri.fsPath, 'utf8');
    const existingConfigs: object = generateExistingValues(parseTomlToConfig(tomlContent), projectOrg, packageName);
    const html = render(configSchema, existingConfigs);

    if (configEditorPanel && html) {
        configEditorPanel.webview.html = html;
    }

    configEditorPanel.onDidDispose(() => {
        configEditorPanel = undefined;
    });
}
