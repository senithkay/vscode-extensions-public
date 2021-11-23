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
import { getCommonWebViewOptions } from '../utils';
import { render } from './renderer';
import { writeFile } from "fs";
import { PALETTE_COMMANDS } from "../project";

let configEditorPanel: WebviewPanel | undefined;

enum ConfigType {
    NUMBER = 'integer',
    STRING = 'string',
    BOOLEAN = 'boolean',
    UNSUPPORTED = 'unsupported'
}

export type ConfigProperty = {
    name: string,
    type: ConfigType,
    value?: string
}

function parseConfigToToml(configInputs: any): string {
    let configJson = JSON.parse(configInputs);
    let configToml: string = "";
    // Iterate the values per module
    configJson.forEach(object => {
        let moduleName: string = '';

        // Iterate per category (moduleName and properties)
        Object.entries(object).forEach(([key, value]) => {
            if (key === 'moduleName') {
                if (value !== 'default') {
                    moduleName = value as string;
                }
            } else if (key === 'properties') {
                // Iterate per configuration property
                (value as any).forEach(property => {
                    let configProperty: ConfigProperty = getConfigProperty(property);
                    if (configProperty.type === ConfigType.STRING) {
                        configProperty.value = "\"" + configProperty.value + "\"";
                    }
                    let propertyTemplate = `${configProperty.name} = ${configProperty.value}` + "\n";
                    if (moduleName) {
                        configToml = configToml + `[${moduleName}]`+ "\n" + `${propertyTemplate}`;
                    } else {
                        configToml = configToml + propertyTemplate;
                    }
                });
            }
        });
      });
    return configToml;
}

function getConfigProperty(property: any): ConfigProperty {
    let name: string = '';
    let type: ConfigType = ConfigType.UNSUPPORTED;
    let inputValue: string = '';

    Object.entries(property).forEach(([peropertyName, peropertyValue]) => {
        switch (peropertyName) {
            case 'name': {
                name = peropertyValue as any;
                break;
            }
            case 'type': {
                if (peropertyValue === 'string') {
                    type = ConfigType.STRING;
                } else if (peropertyValue === 'number') {
                    type = ConfigType.NUMBER;
                } else if (peropertyValue === 'boolean') {
                    type = ConfigType.BOOLEAN;
                }
                break;
            }
            case 'value': {
                inputValue = peropertyValue as any;
                break;
            }
        }
    });
    let configProperty: ConfigProperty = {
        name: name,
        type: type,
        value: inputValue
    };

    return configProperty;
}

export function showConfigEditor(configSchema: any, currentFileUri: Uri): void {
    if (configEditorPanel) {
        configEditorPanel.dispose();
    }

    // Create and show a new webview
    configEditorPanel = window.createWebviewPanel(
        'ballerinaConfigEditor',
        `Configurable Editor`,
        { viewColumn: ViewColumn.Beside, preserveFocus: true },
        getCommonWebViewOptions()
    );

    // Retrieve user inputs
    configEditorPanel.webview.onDidReceiveMessage(async message => {
        if (message.command === 'handleConfigInputs') {
            handleConfigInputs(message.text);
            if (message.submitType === 'SaveRun') {
                await commands.executeCommand(PALETTE_COMMANDS.RUN);
            }
        }
        configEditorPanel?.dispose();
    });

    function handleConfigInputs(configInputs: any) {
        writeFile(currentFileUri.fsPath, parseConfigToToml(configInputs), function (error) {
            if (error) {
                return window.showInformationMessage("Unable to update the Config.toml file: " + error);
            }
            window.showInformationMessage("Successfully updated the Config.toml file.");
        });
    }

    // const html = render({
    //     "$schema": "http://json-schema.org/draft-07/schema#",
    //     "type": "object",
    //     "properties": {
    //         "dilhashanazeer": {
    //             "type": "object",
    //             "properties": {
    //                 "simpleconfigs": {
    //                     "type": "object",
    //                     "properties": {
    //                         "token": {
    //                             "type": "string",
    //                             "description": "description"
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // });
    const html = render(configSchema);
    console.log("configSchema: " + configSchema);

    if (configEditorPanel && html) {
        configEditorPanel.webview.html = html;
    }

    configEditorPanel.onDidDispose(() => {
        configEditorPanel = undefined;
    });
}
