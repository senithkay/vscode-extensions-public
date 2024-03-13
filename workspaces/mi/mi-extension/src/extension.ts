/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as vscode from 'vscode';
import { StateMachine } from './stateMachine';
import { extension } from './MIExtensionContext';
import { activateProjectExplorer } from './project-explorer/activate';
import { activateAiPrompt } from './ai-prompt/activate';
import { activate as activateHistory } from './history';
import { activateVisualizer } from './visualizer/activate';
import { activateActivityPanel } from './activity-panel/activate';
import * as fs from 'fs';
import * as path from 'path';
import { activateDebugger } from './debugger/activate';


function generateTasksJsonContent(): string {
    const copyLocationValue = '${input:copyLocation}/repository/deployment/server/carbonapps';
	const serverExecutionLocation = '${input:copyLocation}/bin/micro-integrator.sh';

    return `
	{
        "version": "2.0.0",
        "tasks": [
            {
                "label": "build-project",
                "type": "shell",
                "command": "mvn clean install && cp -f target/*.car ${copyLocationValue}",
                "group": {
                    "kind": "build",
                    "isDefault": true
                },
                "problemMatcher": [],
                "presentation": {
                    "echo": true,
                    "reveal": "always",
                    "focus": false,
                    "panel": "shared"
                },
                
            },
			{
                "label": "start-micro-integrator",
                "type": "shell",
                "command": "${serverExecutionLocation}",
                "group": {
                    "kind": "build",
                    "isDefault": true
                },
                "problemMatcher": [],
                "presentation": {
                    "echo": true,
                    "reveal": "always",
                    "focus": false,
                    "panel": "shared"
                },
                "dependsOn": "build-project",
                "dependsOrder": "sequence"

            }
        ],
        "inputs": [
            {
                "id": "copyLocation",
                "type": "promptString",
                "description": "Enter the location of the micro-integrator server",
            }
        ]
    }`;
}



export function generateTasksJsonIfNotExists(): Promise<boolean> {
    return new Promise((resolve, reject) => {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (workspaceFolder) {
        const vscodeDirPath = path.join(workspaceFolder.uri.fsPath, '.vscode');
        const tasksJsonPath = vscode.Uri.file(path.join(vscodeDirPath, 'tasks.json'));

        if (!fs.existsSync(vscodeDirPath)) {
            fs.mkdirSync(vscodeDirPath);
        }

        fs.access(tasksJsonPath.fsPath, fs.constants.F_OK, (err) => {
            if (err) {
                const tasksJsonContent = generateTasksJsonContent();
                fs.writeFile(tasksJsonPath.fsPath, tasksJsonContent, (err) => {
                    if (err) {
                        vscode.window.showErrorMessage('Failed to generate tasks.json: ' + err.message);
                        resolve(false);
                    } else {
                        vscode.window.showInformationMessage('tasks.json generated successfully.');
                        resolve(true);
                    }
                });
            }
        });
    }
    });
}


export async function activate(context: vscode.ExtensionContext) {

	extension.context = context;
	activateHistory();

	generateTasksJsonIfNotExists();
	activateDebugger(context);

	// activateActivityPanel(context);
	activateProjectExplorer(context);
	// activateAiPrompt(context);
	activateVisualizer(context);
	StateMachine.initialize();
}
