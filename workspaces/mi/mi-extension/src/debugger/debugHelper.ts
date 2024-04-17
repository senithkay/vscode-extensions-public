
/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as vscode from 'vscode';
import * as childprocess from 'child_process';
import { COMMANDS, PORTS_TO_CHECK, SELECTED_SERVER_PATH } from '../constants';
import { extension } from '../MIExtensionContext';
import { getCopyTask, getBuildTask, getRunTask } from './tasks';
import * as fs from 'fs';

export async function isPortInUse(port: number): Promise<boolean> {
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

export async function checkPorts(): Promise<boolean> {
    for (const port of PORTS_TO_CHECK) {
        const inUse = await isPortInUse(port);
        if (inUse) {
            return true;
        }
    }
    return false;
}

export async function executeCopyTask(task: vscode.Task) {
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

export async function executeBuildTask(task: vscode.Task, serverPath: string) {
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
                        await executeCopyTask(copyTask);
                    }
                }
                resolve();
            } else {
                vscode.window.showErrorMessage(`Task '${task.name}' failed.`);
            }
        });
    });
}

export async function executeTasks(serverPath: string): Promise<void> {
    const buildTask = getBuildTask();
    await executeBuildTask(buildTask, serverPath);

    const portsInUse = await checkPorts();

    if (!portsInUse) {
        const runTask = getRunTask(serverPath);

        await vscode.tasks.executeTask(runTask);
    } else {
        vscode.window.showInformationMessage('Server is already running');
    }
}

export async function getServerPath(): Promise<string | undefined> {
    const currentPath: string | undefined = extension.context.globalState.get(SELECTED_SERVER_PATH);
    if (!currentPath) {
        await vscode.commands.executeCommand(COMMANDS.CHANGE_SERVER_PATH);
        const updatedPath: string | undefined = extension.context.globalState.get(SELECTED_SERVER_PATH);
        return updatedPath as string;
    }
    return currentPath as string;
}
