
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
import { getBuildTask, getRunTask } from './tasks';
import * as fs from 'fs';
import * as path from 'path';
import { INCORRECT_SERVER_PATH_MSG, SELECTED_SERVER_PATH } from './constants';
import { reject } from 'lodash';
import axios from 'axios';
import * as net from 'net';
import { MACHINE_VIEW } from '@wso2-enterprise/mi-core';
import { StateMachine } from '../stateMachine';
import { ERROR_LOG, INFO_LOG, logDebug } from '../util/logger';
import * as toml from 'toml';
import { DebuggerConfig } from './config';
import { glob } from 'glob';

export async function isPortActivelyListening(port: number, timeout: number): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
        const startTime = Date.now();

        const checkPort = () => {
            if (Date.now() - startTime >= timeout) {
                resolve(false); // Timeout reached
            } else {
                if (process.platform === 'win32') {
                    const command = `netstat -an | findstr "LISTENING" | findstr ":${port}"`;
                    childprocess.exec(command, (error, stdout, stderr) => {
                        if (!error && stdout.trim() !== '') {
                            resolve(true);
                        } else {
                            setTimeout(checkPort, 1000);
                        }
                    });
                } else {
                    const command = `lsof -i :${port}`;
                    childprocess.exec(command, (error, stdout, stderr) => {
                        if (!error && stdout.trim() !== '') {
                            resolve(true);
                        } else {
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
        socket.connect(DebuggerConfig.getServerPort(), DebuggerConfig.getHost());
    });
}

export function checkServerReadiness(): Promise<void> {
    const startTime = Date.now();
    const maxTimeout = 10000;
    const retryInterval = 2000;

    return new Promise((resolve, reject) => {
        const checkReadiness = () => {
            const readinessEndpoint = `http://${DebuggerConfig.getHost()}:${DebuggerConfig.getServerReadinessPort()}/healthz`;
            axios.get(readinessEndpoint)
                .then((response: { status: number; data: any; }) => {
                    if (response.status === 200) {
                        if (response.data.status === 'ready') {
                            logDebug('Server is ready with CApp deployed', INFO_LOG);
                            resolve();
                        } else {
                            reject(response.data.status);
                        }

                    } else {
                        const elapsedTime = Date.now() - startTime;
                        if (elapsedTime < maxTimeout) {
                            setTimeout(checkReadiness, retryInterval);
                        } else {
                            reject('CApp has encountered deployment issues. Please refer to the terminal for error logs.');
                        }
                    }
                })
                .catch((error) => {
                    const elapsedTime = Date.now() - startTime;
                    if (elapsedTime < maxTimeout) {
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
            if (e.execution.task.name === 'copy') {
                disposable.dispose();
                if (e.exitCode === 0) {
                    resolve();
                } else {
                    reject(`Task '${task.name}' failed.`);
                }
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
                    if (e.execution.task.name === 'build') {
                        disposable.dispose();
                        if (e.exitCode === 0) {
                            // Check if the target directory exists in the workspace
                            const workspaceFolders = vscode.workspace.workspaceFolders;
                            if (workspaceFolders && workspaceFolders.length > 0) {
                                const targetDirectory = vscode.Uri.joinPath(workspaceFolders[0].uri, "target");
                                if (fs.existsSync(targetDirectory.fsPath)) {
                                    try {
                                        const sourceFiles = await getCarFiles(targetDirectory);
                                        if (sourceFiles.length === 0) {
                                            const errorMessage = "No .car files were found in the target directory. Built without copying to the server's carbonapps directory.";
                                            logDebug(errorMessage, ERROR_LOG);
                                            reject(errorMessage);
                                        } else {
                                            const targetPath = path.join(serverPath, 'repository', 'deployment', 'server', 'carbonapps');
                                            sourceFiles.forEach(sourceFile => {
                                                const destinationFile = path.join(targetPath, path.basename(sourceFile.fsPath));
                                                fs.copyFileSync(sourceFile.fsPath, destinationFile);
                                            });
                                            logDebug('Build and copy tasks executed successfully', INFO_LOG);
                                            resolve();
                                        }
                                    } catch (err) {
                                        reject(err);
                                    }
                                }
                            }
                        } else {
                            reject(`Task '${task.name}' failed.`);
                        }
                    }
                });
            }
        }).catch((error) => {
            logDebug(`Error deleting CApp files: ${error}`, ERROR_LOG);
            reject(error);
        });
    });
}

async function getCarFiles(targetDirectory) {
    const carFiles = await vscode.workspace.findFiles(
        new vscode.RelativePattern(targetDirectory.fsPath, '*.car')
    );
    return carFiles;
}

export async function executeTasks(serverPath: string, isDebug: boolean): Promise<void> {
    const buildTask = getBuildTask();
    const maxTimeout = 10000;
    return new Promise<void>(async (resolve, reject) => {
        executeBuildTask(buildTask, serverPath).then(async () => {
            const isServerRunning = await checkServerLiveness();
            if (!isServerRunning) {
                const runTask = await getRunTask(serverPath, isDebug);
                if (runTask) {
                    runTask.presentationOptions = {
                        panel: vscode.TaskPanelKind.Shared
                    };
                    await vscode.tasks.executeTask(runTask);
                    if (isDebug) {
                        // check if server command port is active
                        isPortActivelyListening(DebuggerConfig.getCommandPort(), maxTimeout).then((isListening) => {
                            if (isListening) {
                                resolve();
                                // Proceed with connecting to the port
                            } else {
                                logDebug(`The ${DebuggerConfig.getCommandPort()} port is not actively listening or the timeout has been reached.`, ERROR_LOG);
                                reject(`Server command port isn't actively listening. Stop any running MI servers and restart the debugger.`);
                            }
                        });
                    } else {
                        resolve();
                    }
                } else {
                    reject('Error creating run task');
                }
            } else {
                // Server could be running in the background without debug mode, but we need to rerun to support this mode
                if (isDebug) {
                    isPortActivelyListening(DebuggerConfig.getCommandPort(), maxTimeout).then((isListening) => {
                        if (isListening) {
                            resolve();
                            // Proceed with connecting to the port
                        } else {
                            logDebug('Server is running, but the debugger command port not acitve', ERROR_LOG);
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
            logDebug(`Error executing BuildTask: ${error}`, ERROR_LOG);
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
            if (!fs.existsSync(targetPath)) {
                reject(INCORRECT_SERVER_PATH_MSG);
            } else {
                const files = await fs.promises.readdir(targetPath);

                for (const file of files) {
                    if (file.endsWith('.car')) {
                        const filePath = path.join(targetPath, file);
                        await fs.promises.unlink(filePath);
                    }
                }
                resolve();
            }
        } catch (err) {
            logDebug(`Error deleting Capp: ${err}`, ERROR_LOG);
            reject(err);
        }
    });
}

// Check and return if the current visible view is one of the diagram view which can hit a breakpoint event
export function isADiagramView() {
    const stateContext = StateMachine.context();
    const diagramViews = [MACHINE_VIEW.ResourceView, MACHINE_VIEW.ProxyView, MACHINE_VIEW.SequenceView, MACHINE_VIEW.SequenceTemplateView];
    return diagramViews.indexOf(stateContext.view!) !== -1;
}

// This functionality is a workaround to enable debugging in Windows platform.
// The micro-integrator.bat is not supported to read java variables appended by the user in the MI 4.2.0 version.
// As a workaround, MI team requested that we create a temporary batch file with the required java variables and run the server.
let tempWindowsDebug;
export function createTempDebugBatchFile(batchFilePath: string, binPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const destFilePath = path.join(binPath, 'micro-integrator-debug.bat');
        fs.copyFileSync(batchFilePath, destFilePath);
        tempWindowsDebug = destFilePath;

        fs.readFile(destFilePath, 'utf8', (err, data) => {
            if (err) {
                logDebug(`Error reading the micro-integrator-debug.bat file: ${err}`, ERROR_LOG);
                reject(`Error while reading the micro-integrator-debug.bat file: ${err}`);
                return;
            }

            const updatedContent = data.replace('CMD_LINE_ARGS=', 'CMD_LINE_ARGS=-Desb.debug=true ');

            fs.writeFile(destFilePath, updatedContent, 'utf8', (err) => {
                if (err) {
                    logDebug(`Error writing the micro-integrator-debug.bat file: ${err}`, ERROR_LOG);
                    reject(`Error while updating the micro-integrator-debug.bat file: ${err}`);
                    return;
                }
                resolve(destFilePath);
            });
        });
    });
}

export function removeTempDebugBatchFile() {
    if (tempWindowsDebug) {
        fs.unlinkSync(tempWindowsDebug);
        tempWindowsDebug = undefined;
    }
}

export async function readPortOffset(serverConfigPath: string): Promise<number | undefined> {
    try {
        const configPath = path.join(serverConfigPath, 'conf', 'deployment.toml');
        const content = await fs.promises.readFile(configPath, 'utf-8');
        const config = toml.parse(content);
        const offset = config?.server?.offset;
        return offset;
    } catch (error) {
        logDebug(`Failed to read or parse deployment.toml: ${error}`, ERROR_LOG);
        return undefined;
    }
}
