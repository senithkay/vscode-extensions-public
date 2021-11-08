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
import { debug } from '../utils';
import { PALETTE_COMMANDS } from '../project';

class gitStatusBarItem {
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
            } else if (status.files.length > 0) {
                this.statusBarItem.text = `$(check) Commit Changes`;
                this.statusBarItem.backgroundColor = new ThemeColor('statusBarItem.errorBackground');
                this.statusBarItem.command = {
                    command: PALETTE_COMMANDS.CHOREO_COMMIT,
                    arguments: [this],
                    title: 'Commit All Changes'
                };
                this.statusBarItem.show();
            } else if (status.ahead > 0) {
                this.statusBarItem.text = `$(cloud-upload) Push Changes to Choreo`;
                this.statusBarItem.backgroundColor = new ThemeColor('statusBarItem.errorBackground');
                this.statusBarItem.command = {
                    command: `git.push`,
                    arguments: [this],
                    title: 'Push Changes'
                };
                this.statusBarItem.show();
            } else {
                this.statusBarItem.text = `$(compare-changes) Even with Choreo upsteam`;
                this.statusBarItem.backgroundColor = new ThemeColor('statusBarItem.activeBackground');
                this.statusBarItem.show();
            }
        });
    }

    async commitAll(message: string) {
        this.createSimpleGit();
        if (!this.git) {
            return;
        }
        const status = await this.git.status();
        this.git.add(status.files.map(f => { return f.path }));
        this.git.commit(message, (error, result) => {
            if (error) {
                debug(error.message);
                return;
            } else {
                var message = `Committed to branch ${result.branch} (${result.commit})\n${result.summary.changes} change(s),`
                    + `\n${result.summary.insertions} addition(s), \n${result.summary.deletions} deletion(s)`;
                debug(message);
            }
        })
    }

    push() {
        this.createSimpleGit();
        if (!this.git) {
            return;
        }
        this.git.push(message => {
            if (message) {
                debug(message.message);
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
    const statusBarItem = new gitStatusBarItem();
    workspace.onDidChangeTextDocument(_event => {
        statusBarItem.updateGitStatus();
    });
    workspace.onDidOpenTextDocument(_event => {
        statusBarItem.updateGitStatus();
    });

    const commitAll = commands.registerCommand(PALETTE_COMMANDS.CHOREO_COMMIT, (barItem: gitStatusBarItem) => {
        commands.executeCommand(PALETTE_COMMANDS.SAVE_ALL);
        window.showInputBox({
            placeHolder: "Enter the commit message"
        }).then((message) => {
            if (message === undefined) {
                return;
            } else {
                barItem.commitAll(message);
            }
        });
    });

    const push = commands.registerCommand(PALETTE_COMMANDS.CHOREO_PUSH, (barItem: gitStatusBarItem) => {
        barItem.push();
    })

    const commitAndPush = commands.registerCommand(PALETTE_COMMANDS.CHOREO_COMMIT_AND_PUSH, async () => {
        const barItem = new gitStatusBarItem();
        await commands.executeCommand(PALETTE_COMMANDS.CHOREO_COMMIT, barItem);
        await commands.executeCommand(PALETTE_COMMANDS.CHOREO_PUSH, barItem);
    });

    ballerinaExtInstance.context!.subscriptions.push(commitAll);
    ballerinaExtInstance.context!.subscriptions.push(push);
    ballerinaExtInstance.context!.subscriptions.push(commitAndPush);
}
