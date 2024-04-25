
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
import * as path from 'path';

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

export async function isPortActivelyListening(port: number, timeout: number): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
        const startTime = Date.now();

        const checkPort = () => {
            if (Date.now() - startTime >= timeout) {
                resolve(false); // Timeout reached
            } else {
                if (process.platform === 'win32') {
                    const command = `netstat -an | find "LISTENING" | find ":${port}"`;
                    childprocess.exec(command, (error, stdout, stderr) => {
                        if (!error && stdout.trim() !== '') {
                            resolve(true);
                        } else {
                            console.log('retrying');
                            setTimeout(checkPort, 1000); // Check again after 1 second
                        }
                    });
                } else {
                    const command = `lsof -i :${port}`;
                    childprocess.exec(command, (error, stdout, stderr) => {
                        if (!error && stdout.trim() !== '') {
                            resolve(true);
                        } else {
                            console.log('retrying');
                            setTimeout(checkPort, 1000); // Check again after 1 second
                        }
                    });
                }
            }
        };

        checkPort(); // Start checking the port
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
    await deleteCapp(serverPath);
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

export async function executeTasks(serverPath: string, isDebug: boolean): Promise<void> {
    const buildTask = getBuildTask();
    await executeBuildTask(buildTask, serverPath);

    const portsInUse = await checkPorts();

    if (!portsInUse) {
        return new Promise<void>(async (resolve) => {
            const runTask = getRunTask(serverPath, isDebug);
            runTask.presentationOptions = {
                panel: vscode.TaskPanelKind.Shared
            };
            await vscode.tasks.executeTask(runTask);
            console.log('Running the server');

            // promise is resolved once the port is actively listening only

            const commandPort = 9005;
            const maxTimeout = 10000;
            isPortActivelyListening(commandPort, maxTimeout).then((isListening) => {
                if (isListening) {
                    console.log('Port is actively listening');
                    resolve();
                    // Proceed with connecting to the port
                } else {
                    console.log('Port is not actively listening or timeout reached');
                    resolve();
                    // TODO: Handle the case where the port is not actively listening or timeout reached
                }
            });

        });
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

export async function deleteCapp(serverPath: string): Promise<void> {
    const targetPath = serverPath + '/repository/deployment/server/carbonapps';
    if (process.platform === 'win32') {
        targetPath.replace(/\//g, '\\');
    }

    try {
        const files = await fs.promises.readdir(targetPath);

        for (const file of files) {
            if (file.endsWith('.car')) {
                const filePath = path.join(targetPath, file);
                await fs.promises.unlink(filePath);
            }
        }
    } catch (err) {
        console.error(`Error deleting files: ${err}`);
    }
}
