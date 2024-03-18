/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { LoggingDebugSession } from 'vscode-debugadapter';
import { DebugProtocol } from 'vscode-debugprotocol';
import * as vscode from 'vscode';
import { extension } from '../MIExtensionContext';
import { COMMANDS, PORTS_TO_CHECK, SELECTED_SERVER_PATH } from '../constants';
import * as childprocess from 'child_process';
import * as fs from 'fs';
import { getBuildTask, getCopyTask, getRunTask } from './tasks';

export class MiDebugAdapter extends LoggingDebugSession {

    private async isPortInUse(port: number): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            if (process.platform === 'win32') {
                const command = `netstat -an | find "LISTENING" | find ":${port}"`;
                childprocess.exec(command, (error, stdout, stderr) => {
                    if (error) {
                        resolve(false);
                    } else {
                        resolve(stdout.trim() !== '');
                    }
                });
            } else {
                const command = `lsof -i :${port}`;
                childprocess.exec(command, (error, stdout, stderr) => {
                    if (error) {
                        resolve(false);
                    } else {
                        resolve(stdout.trim() !== '');
                    }
                });
            }
        });
    }

    private async checkPorts(): Promise<boolean> {
        for (const port of PORTS_TO_CHECK) {
            const inUse = await this.isPortInUse(port);
            if (inUse) {
                return true;
            }
        }
        return false;
    }

    private async executeCopyTask(task: vscode.Task) {
        await vscode.tasks.executeTask(task);

        return new Promise<void>(resolve => {
            let disposable = vscode.tasks.onDidEndTaskProcess(async e => {
                if (e.exitCode === 0) {
                    disposable.dispose();
                    resolve();
                } else {
                    vscode.window.showErrorMessage(`Task '${task.name}' failed.`);
                }
            });
        });
    }

    private async executeBuildTask(task: vscode.Task, serverPath: string) {
        await vscode.tasks.executeTask(task);

        return new Promise<void>(resolve => {
            let disposable = vscode.tasks.onDidEndTaskProcess(async e => {
                if (e.exitCode === 0) {
                    disposable.dispose();
                    // Check if the target directory exists in the workspace
                    const workspaceFolders = vscode.workspace.workspaceFolders;
                    if (workspaceFolders && workspaceFolders.length > 0) {
                        const targetDirectory = vscode.Uri.joinPath(workspaceFolders[0].uri, "target");
                        if (fs.existsSync(targetDirectory.fsPath)) {
                            const copyTask = getCopyTask(serverPath, targetDirectory);
                            await this.executeCopyTask(copyTask);
                        }
                    }
                    resolve();
                } else {
                    vscode.window.showErrorMessage(`Task '${task.name}' failed.`);
                }

            });
        });
    }

    private async executeTasks(serverPath: string): Promise<void> {
        const buildTask = getBuildTask();

        await this.executeBuildTask(buildTask, serverPath);

        const portsInUse = await this.checkPorts();

        if (!portsInUse) {
            const runTask = getRunTask(serverPath);

            await vscode.tasks.executeTask(runTask);
        } else {
            vscode.window.showInformationMessage('Server is already running');
        }
    }

    private async updateServerPathAndGet(): Promise<string | undefined> {
        const currentPath: string | undefined = extension.context.globalState.get(SELECTED_SERVER_PATH);
        if (!currentPath) {
            await vscode.commands.executeCommand(COMMANDS.CHANGE_SERVER_PATH);
            const updatedPath: string | undefined = extension.context.globalState.get(SELECTED_SERVER_PATH);
            return updatedPath as string;
        }
        return currentPath as string;

    }

    protected launchRequest(response: DebugProtocol.LaunchResponse, args?: DebugProtocol.LaunchRequestArguments, request?: DebugProtocol.Request): void {
        this.updateServerPathAndGet().then((serverPath) => {
            if (!serverPath) {
                response.success = false;
                this.sendResponse(response);
            } else {
                this.executeTasks(serverPath)
                    .then(() => {
                        this.sendResponse(response);
                    })
                    .catch(error => {
                        vscode.window.showErrorMessage(`Error while launching run and debug`);
                    });
            }
        });
    }

    protected disconnectRequest(response: DebugProtocol.DisconnectResponse, args: DebugProtocol.DisconnectArguments, request?: DebugProtocol.Request): void {
        const taskExecution = vscode.tasks.taskExecutions.find(execution => execution.task.name === 'run');
        if (taskExecution) {
            taskExecution.terminate();
            response.success = true;
        } else {
            response.success = false;
        }
        this.sendResponse(response);
    }

    protected async attachRequest(response: DebugProtocol.AttachResponse, args: DebugProtocol.LaunchRequestArguments) {
        return this.launchRequest(response, args);
    }
}
