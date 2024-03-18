/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as vscode from 'vscode';

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

export function getCopyTask(serverPath: string, targetDirectory: vscode.Uri): vscode.Task {
    const targetPath = serverPath + '/repository/deployment/server/carbonapps';
    const currentPath = targetDirectory.fsPath + "/*.car";
    const commandToExecute = "cp -f " + currentPath + " " + targetPath;
    const copyTask = new vscode.Task(
        { type: 'mi-copy' },
        vscode.TaskScope.Workspace,
        'copy',
        'mi',
        new vscode.ShellExecution(commandToExecute)
    );

    return copyTask;
}

export function getRunTask(serverPath: string): vscode.Task {
    const command = serverPath + '/bin/micro-integrator.sh';
    const runTask = new vscode.Task(
        { type: 'mi-run' },
        vscode.TaskScope.Workspace,
        'run',
        'mi',
        new vscode.ShellExecution(command)
    );
    return runTask;
}
