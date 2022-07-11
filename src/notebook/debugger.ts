/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import { debug, DebugConfiguration, NotebookCell, Uri, window, workspace, WorkspaceFolder } from "vscode";
import fileUriToPath from "file-uri-to-path";
import { mkdtempSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { BallerinaExtension, LANGUAGE } from "../core";
import { DEBUG_CONFIG, DEBUG_REQUEST } from "../debugger";

let tmpDirectory: string;

export class NotebookDebuggerController {
    private pathToCell: Map<string, NotebookCell> = new Map();

    constructor(private extensionInstance: BallerinaExtension) {}

    async startDebugging() : Promise<boolean> {
        let activeTextEditorUri = window.activeTextEditor!.document.uri;
        if (activeTextEditorUri.scheme === 'vscode-notebook-cell') {
            const uri = `${getTempDir()}/notebook_cell_${activeTextEditorUri.fragment}.bal`;
            activeTextEditorUri = Uri.parse(uri);
        } else {
            return Promise.reject();
        }
        const workspaceFolder: WorkspaceFolder | undefined = workspace.getWorkspaceFolder(activeTextEditorUri);
        const debugConfig: DebugConfiguration = await this.constructDebugConfig(activeTextEditorUri);
        return debug.startDebugging(workspaceFolder, debugConfig);
    }

    async constructDebugConfig(uri: Uri): Promise<DebugConfiguration> {
        let programArgs = [];
        let commandOptions = [];
        let env = {};
        const debugConfigs: DebugConfiguration[] = workspace.getConfiguration(DEBUG_REQUEST.LAUNCH).configurations;
        if (debugConfigs.length > 0) {
            let debugConfig: DebugConfiguration | undefined;
            for (let i = 0; i < debugConfigs.length; i++) {
                if ((debugConfigs[i].name == DEBUG_CONFIG.SOURCE_DEBUG_NAME)) {
                    debugConfig = debugConfigs[i];
                    break;
                }
            }
            if (debugConfig) {
                if (debugConfig.programArgs) {
                    programArgs = debugConfig.programArgs;
                }
                if (debugConfig.commandOptions) {
                    commandOptions = debugConfig.commandOptions;
                }
                if (debugConfig.env) {
                    env = debugConfig.env;
                }
            }
        }
        const debugConfig: DebugConfiguration = {
            type: LANGUAGE.BALLERINA,
            name: "Ballerina Notebook Debug",
            request: DEBUG_REQUEST.LAUNCH,
            script: fileUriToPath(uri.toString()),
            networkLogs: false,
            debugServer: '10001',
            debuggeePort: '5010',
            'ballerina.home': this.extensionInstance.getBallerinaHome(),
            'ballerina.command': this.extensionInstance.getBallerinaCmd(),
            debugTests: false,
            tests: [],
            configEnv: undefined,
            capabilities: { supportsReadOnlyEditors: true }
        };
        return debugConfig;
    }

    dumpCell(cell: NotebookCell): string | undefined {
        try {
            const cellPath = `${getTempDir()}/notebook_cell_${cell.document.uri.fragment}.bal`;
            this.pathToCell.set(cellPath, cell);

            let data = cell.document.getText();
            data += `\n//@ sourceURL=${cellPath}`;
            writeFileSync(cellPath, data);

            return cellPath;
        } catch (e) {
        }
        return undefined;
    }
}

export function getTempDir(): string {
    if (!tmpDirectory) {
        tmpDirectory = mkdtempSync(join(tmpdir(), 'ballerina-notebook-'));
    }
    return tmpDirectory;
}
