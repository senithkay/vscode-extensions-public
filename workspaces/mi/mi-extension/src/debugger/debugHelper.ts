
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
import { COMMANDS } from '../constants';
import { extension } from '../MIExtensionContext';
import { getCopyTask, getBuildTask, getRunTask } from './tasks';
import * as fs from 'fs';
import * as path from 'path';
import { COMMAND_PORT, READINESS_ENDPOINT, SELECTED_SERVER_PATH } from './constants';
import { reject } from 'lodash';
import axios from 'axios';
import * as net from 'net';

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
                            setTimeout(checkPort, 1000);
                        }
                    });
                } else {
                    const command = `lsof -i :${port}`;
                    childprocess.exec(command, (error, stdout, stderr) => {
                        if (!error && stdout.trim() !== '') {
                            resolve(true);
                        } else {
                            console.log('retrying');
                            setTimeout(checkPort, 1000);
                        }
                    });
                }
            }
        };

        checkPort();
    });
}

function checkServerLiveness(): Promise<boolean> {
    return new Promise((resolve) => {
        const socket = new net.Socket();

        socket.on('connect', () => {
            socket.destroy(); // Close the connection
            resolve(true); // Port is up
        });

        socket.on('error', () => {
            socket.destroy();
            resolve(false); // Port is not up
        });

        socket.connect(8290, 'localhost'); // Attempt to connect to the 8290 server port
    });
}

export function checkServerReadiness(): Promise<void> {
    const startTime = Date.now();
    const maxTimeout = 10000;
    const retryInterval = 2000;

    return new Promise((resolve, reject) => {
        const checkReadiness = () => {
            axios.get(READINESS_ENDPOINT)
                .then((response: { status: number; data: any; }) => {
                    if (response.status === 200) {
                        if (response.data.status === 'ready') {
                            console.log('Server is ready with CApp deployed');
                            resolve();
                        } else {
                            reject(response.data.status);
                        }

                    } else {
                        const elapsedTime = Date.now() - startTime;
                        if (elapsedTime < maxTimeout) {
                            console.log(`CApp not yet deployed. Retrying in ${retryInterval / 1000} seconds...`);
                            setTimeout(checkReadiness, retryInterval);
                        } else {
                            reject('CApp has encountered deployment issues. Please refer to the terminal for error logs.');
                        }
                    }
                })
                .catch((error) => {
                    const elapsedTime = Date.now() - startTime;
                    if (elapsedTime < maxTimeout) {
                        console.log(`Error checking readiness: ${error.message}. Retrying in ${retryInterval / 1000} seconds...`);
                        setTimeout(checkReadiness, retryInterval);
                    } else {
                        reject(`CApp has encountered deployment issues. Please refer to the terminal for error logs.`);
                    }
                });
        };
        checkReadiness();
    });
}

export async function executeCopyTask(task: vscode.Task) {
    return new Promise<void>(async resolve => {
        await vscode.tasks.executeTask(task);
        let disposable = vscode.tasks.onDidEndTaskProcess(async e => {
            if (e.exitCode === 0) {
                disposable.dispose();
                resolve();
            } else {
                reject(`Task '${task.name}' failed.`);
            }
        });
    });
}

export async function executeBuildTask(task: vscode.Task, serverPath: string, shouldCopyTarget: boolean = true) {
    return new Promise<void>(async (resolve, reject) => {
        deleteCapp(serverPath).then(async () => {
            await vscode.tasks.executeTask(task);
            if (shouldCopyTarget) {
                let disposable = vscode.tasks.onDidEndTaskProcess(async e => {
                    if (e.exitCode === 0) {
                        disposable.dispose();
                        // Check if the target directory exists in the workspace
                        const workspaceFolders = vscode.workspace.workspaceFolders;
                        if (workspaceFolders && workspaceFolders.length > 0) {
                            const targetDirectory = vscode.Uri.joinPath(workspaceFolders[0].uri, "target");
                            if (fs.existsSync(targetDirectory.fsPath)) {
                                const copyTask = getCopyTask(serverPath, targetDirectory);
                                executeCopyTask(copyTask).then(() => {
                                    resolve();
                                }).catch((error) => {
                                    reject(error);
                                });
                            }
                        }
                    } else {
                        reject(`Task '${task.name}' failed.`);
                    }
                });
            }
        }).catch((error) => {
            console.error(`Error deleting capp files: ${error}`);
            reject(error);
        });
    });
}

export async function executeTasks(serverPath: string, isDebug: boolean): Promise<void> {
    const buildTask = getBuildTask();
    const maxTimeout = 10000;
    return new Promise<void>(async (resolve, reject) => {
        executeBuildTask(buildTask, serverPath).then(async () => {
            console.log('Build task executed successfully');
            const isServerRunning = await checkServerLiveness();
            if (!isServerRunning) {
                const runTask = getRunTask(serverPath, isDebug);
                runTask.presentationOptions = {
                    panel: vscode.TaskPanelKind.Shared
                };
                await vscode.tasks.executeTask(runTask);
                if (isDebug) {
                    // check if server command port is active
                    isPortActivelyListening(COMMAND_PORT, maxTimeout).then((isListening) => {
                        if (isListening) {
                            console.log('Server command port is actively listening');
                            resolve();
                            // Proceed with connecting to the port
                        } else {
                            console.log('Port is not actively listening or timeout reached');
                            reject(`Server command port isn't actively listening. Stop any running MI servers and restart the debugger.`);
                        }
                    });
                }
            } else {
                // Server could be running in the background without debug mode, but we need to rerun to support this mode
                if (isDebug) {
                    isPortActivelyListening(COMMAND_PORT, maxTimeout).then((isListening) => {
                        if (isListening) {
                            console.log('Server command port is actively listening');
                            resolve();
                            // Proceed with connecting to the port
                        } else {
                            console.log('Server is running, but command port not acitve');
                            reject(`Server command port isn't actively listening. Stop any running MI servers and restart the debugger.`);
                        }
                    });
                } else {
                    vscode.window.showInformationMessage('Server is already running');
                    resolve();
                }
            }
        }).catch((error) => {
            reject(error);
            console.error(`Error executing tasks: ${error}`);
        });
    });
}

export async function getServerPath(): Promise<string | undefined> {
    const currentPath: string | undefined = extension.context.globalState.get(SELECTED_SERVER_PATH);
    if (!currentPath) {
        await vscode.commands.executeCommand(COMMANDS.CHANGE_SERVER_PATH);
        const updatedPath: string | undefined = extension.context.globalState.get(SELECTED_SERVER_PATH);
        if (updatedPath) {
            return path.normalize(updatedPath);
        }
        return updatedPath;
    }
    return path.normalize(currentPath);
}

export async function deleteCapp(serverPath: string): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
        const targetPath = path.join(serverPath, 'repository', 'deployment', 'server', 'carbonapps');

        try {
            const files = await fs.promises.readdir(targetPath);

            for (const file of files) {
                if (file.endsWith('.car')) {
                    const filePath = path.join(targetPath, file);
                    await fs.promises.unlink(filePath);
                }
            }
            resolve();
        } catch (err) {
            console.error(`Error deleting files: ${err}`);
            reject(err);
        }
    });
}
