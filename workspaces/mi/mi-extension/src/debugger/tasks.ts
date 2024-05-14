/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as path from 'path';
import * as vscode from 'vscode';
import * as fs from 'fs';
import { createTempDebugBatchFile } from './debugHelper';

export function getBuildTask(): vscode.Task {
    const commandToExecute = "mvn clean install";

    const buildTask = new vscode.Task(
        { type: 'mi-build' },
        vscode.TaskScope.Workspace,
        'build',
        'mi',
        new vscode.ShellExecution(commandToExecute)
    );

    return buildTask;
}

export function getCopyTask(serverPath: string, targetDirectory: vscode.Uri): vscode.Task | undefined {
    const targetPath = path.join(serverPath, 'repository', 'deployment', 'server', 'carbonapps');
    const currentPath = path.join(targetDirectory.fsPath, '*.car');
    let commandToExecute: string;

    if (!fs.existsSync(targetPath)) {
        return undefined;
    }

    if (process.platform === 'win32') {
        commandToExecute = `copy ${currentPath} ${targetPath}`;
    } else {
        commandToExecute = `cp -f ${currentPath} ${targetPath}`;
    }

    const copyTask = new vscode.Task(
        { type: 'mi-copy' },
        vscode.TaskScope.Workspace,
        'copy',
        'mi',
        new vscode.ShellExecution(commandToExecute)
    );

    return copyTask;
}

export async function getRunTask(serverPath: string, isDebug: boolean): Promise<vscode.Task | undefined> {
    let command;
    let binFile;

    if (process.platform === 'win32') {
        binFile = 'micro-integrator.bat';
    } else {
        binFile = 'micro-integrator.sh';
    }

    const binPath = path.join(serverPath, 'bin', binFile);

    if (isDebug) {
        // HACK to get the server to run as the debugger since MI 4.2.0 version's .bat file is not supported to run java variables
        if(process.platform === 'win32'){
                const binDirectoryPath = path.join(serverPath, 'bin');
                try {
                    const copiedBatchFile = await createTempDebugBatchFile(binPath, binDirectoryPath);
                    command = copiedBatchFile;
                } catch (error) {
                    vscode.window.showErrorMessage(`Error while creating temporary debug batch file: ${error}`);
                    return undefined;
                }
        } else {
            command = `${binPath} -Desb.debug=true`;
        }
    } else {
        command = binPath;
    }
    const runTask = new vscode.Task(
        { type: 'mi-run' },
        vscode.TaskScope.Workspace,
        'run',
        'mi',
        new vscode.ShellExecution(command),
    );
    return runTask;
}

export function getStopTask(serverPath: string): vscode.Task | undefined {
    const binPath = path.join(serverPath, 'bin', 'micro-integrator.sh');
    const command = `${binPath} stop`;

    if (!fs.existsSync(binPath)) {
        return undefined;
    }

    const stopTask = new vscode.Task(
        { type: 'mi-stop' },
        vscode.TaskScope.Workspace,
        'stop',
        'mi',
        new vscode.ShellExecution(command)
    );
    return stopTask;
}
