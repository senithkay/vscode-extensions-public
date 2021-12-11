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
import { debug } from './../utils';
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
    rule.second = 2;
    schedule.scheduleJob(rule, function () {
        debug(`Updated the git status at ${new Date()}`)
        statusBarItem.updateGitStatus();
    });

    const commitAndPush = commands.registerCommand(PALETTE_COMMANDS.CHOREO_SYNC_CHANGES, () => {
        ballerinaExtInstance.getCodeServerContext().statusBarItem?.updateGitStatus();
        showChoreoPushMessage(ballerinaExtInstance, true);
    });

    ballerinaExtInstance.context!.subscriptions.push(commitAndPush);
}

export function showChoreoPushMessage(ballerinaExtInstance: BallerinaExtension, isCommand: boolean = false) {
    if (!ballerinaExtInstance.getCodeServerContext().codeServerEnv ||
        !ballerinaExtInstance.getCodeServerContext().infoMessageStatus.sourceControlMessage ||
        (!isCommand && !ballerinaExtInstance.getCodeServerContext().infoMessageStatus.messageFirstEdit)) {
        return;
    }
    if (isCommand) {
        sourceControllerDetails(ballerinaExtInstance);
        return;
    }

    const moreInfo = "More Information";
    const sync = "Sync changes with Choreo";
    window.showInformationMessage('Sync project changes using the VS Code Source Control activity and try out on ' +
        'Choreo.', moreInfo, sync).then(selection => {
            if (selection == moreInfo) {
                sourceControllerDetails(ballerinaExtInstance);
                return;
            }
            if (selection == sync) {
                commands.executeCommand(PALETTE_COMMANDS.FOCUS_SOURCE_CONTROL);
            }
        });
    ballerinaExtInstance.getCodeServerContext().infoMessageStatus.messageFirstEdit = false;
}

export function sourceControllerDetails(ballerinaExtInstance: BallerinaExtension) {
    const stop = "Don't show again!";
    const sync = "Sync my changes with Choreo";
    window.showInformationMessage('Make sure you commit and push project changes using the VS Code Source Control ' +
        'activity to try out on the Choreo environment.', {
        modal: true, detail: '\nFirst, go to the Source Control on the VS Code Activity bar. \nEnter a commit ' +
            'message and `Commit` all changes. \nThen, `Push` all changes using the `More Actions...` button on ' +
            'the source control activity.'
    }, sync, stop).then((selection) => {
        if (sync === selection) {
            commands.executeCommand(PALETTE_COMMANDS.FOCUS_SOURCE_CONTROL);
        }
        if (stop === selection) {
            ballerinaExtInstance.getCodeServerContext().infoMessageStatus.sourceControlMessage = false;
        }
    });
}
