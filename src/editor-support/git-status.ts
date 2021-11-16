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
import simpleGit, { SimpleGit, SimpleGitOptions } from 'simple-git';
import { BallerinaExtension } from '../core';
import { commands, StatusBarAlignment, StatusBarItem, ThemeColor, window, workspace } from 'vscode';
import { PALETTE_COMMANDS } from '../project';
const schedule = require('node-schedule');

export class gitStatusBarItem {
    private statusBarItem: StatusBarItem;
    private baseDir: string = "";
    private git: SimpleGit | undefined;

    constructor() {
        this.statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 100);
    }

    updateGitStatus() {
        this.createSimpleGit();
        if (!this.git) {
            return;
        }

        this.git.status((error, status) => {
            if (error) {
                this.statusBarItem.hide();
            } else if (status.files.length > 0 || status.ahead > 0) {
                this.statusBarItem.text = `$(cloud-upload) Sync with Choreo upsteam`;
                this.statusBarItem.backgroundColor = new ThemeColor('statusBarItem.errorBackground');
                this.statusBarItem.command = {
                    command: PALETTE_COMMANDS.CHOREO_SYNC_CHANGES,
                    title: 'Focus Source Control'
                };
                this.statusBarItem.show();
            } else {
                this.statusBarItem.text = `$(compare-changes) In sync with Choreo upsteam`;
                this.statusBarItem.backgroundColor = new ThemeColor('statusBarItem.activeBackground');
                this.statusBarItem.show();
            }
        });
    }

    createSimpleGit() {
        if (!workspace.workspaceFolders || workspace.workspaceFolders.length == 0) {
            return;
        }

        if (!this.git || this.baseDir != workspace.workspaceFolders[0].uri.fsPath) {
            const options: Partial<SimpleGitOptions> = {
                baseDir: workspace.workspaceFolders[0].uri.fsPath,
                binary: 'git',
                maxConcurrentProcesses: 1,
            };
            this.baseDir = workspace.workspaceFolders[0].uri.fsPath;
            this.git = simpleGit(options);
        }
    }
}

export function activate(ballerinaExtInstance: BallerinaExtension) {
    if (!ballerinaExtInstance.getCodeServerContext().codeServerEnv) {
        return;
    }

    // Update status bar
    const statusBarItem = new gitStatusBarItem();
    ballerinaExtInstance.getCodeServerContext().statusBarItem = statusBarItem;
    workspace.onDidChangeTextDocument(_event => {
        statusBarItem.updateGitStatus();
    });
    workspace.onDidOpenTextDocument(_event => {
        statusBarItem.updateGitStatus();
    });
    const rule = new schedule.RecurrenceRule();
    rule.second = 5;
    schedule.scheduleJob(rule, function () {
        statusBarItem.updateGitStatus();
    });

    const commitAndPush = commands.registerCommand(PALETTE_COMMANDS.CHOREO_SYNC_CHANGES, () => {
        commands.executeCommand(PALETTE_COMMANDS.FOCUS_SOURCE_CONTROL);
        if (!ballerinaExtInstance.getCodeServerContext().infoMessageStatus.sourceControlMessage) {
            return;
        }
        const stopPopup = "Don't show again!";
        window.showInformationMessage('Make sure you commit and push project changes using the VS Code ' +
            'Source Control activity. Refer to [documentation](https://wso2.com/choreo/docs/) ' +
            'for more information.', stopPopup).then((selection) => {
                if (stopPopup === selection) {
                    ballerinaExtInstance.getCodeServerContext().infoMessageStatus.sourceControlMessage = false;
            }
        });
    });

    ballerinaExtInstance.context!.subscriptions.push(commitAndPush);
}

export function showChoreoPushMessage(ballerinaExtInstance: BallerinaExtension) {
    if (!ballerinaExtInstance.getCodeServerContext().codeServerEnv ||
        !ballerinaExtInstance.getCodeServerContext().infoMessageStatus.syncChoreoMessage) {
        return;
    }
    ballerinaExtInstance.getCodeServerContext().infoMessageStatus.syncChoreoMessage = false;
    const sync = "Sync Changes with Choreo";
    window.showInformationMessage('Sync your project changes with Choreo and try out on its development ' +
        'environment. Do you want to sync your changes? ', sync).then((selection) => {
            if (sync === selection) {
                commands.executeCommand(PALETTE_COMMANDS.FOCUS_SOURCE_CONTROL);
            }
        });
}
