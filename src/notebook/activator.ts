/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import { workspace, ExtensionContext, commands, Disposable, window } from 'vscode';
import { BallerinaExtension, ExtendedLangClient } from '../core';
import { BallerinaNotebookSerializer } from "./notebookSerializer";
import { BallerinaNotebookController } from "./notebookController";
import { registerLanguageProviders } from './languageProvider';
import { VariableViewProvider } from './variableView';

export function activate(ballerinaExtInstance: BallerinaExtension) {
    const context = <ExtensionContext>ballerinaExtInstance.context;
    const notebookController = new BallerinaNotebookController(ballerinaExtInstance);

    context.subscriptions.push(
        workspace.registerNotebookSerializer('ballerina-notebook', new BallerinaNotebookSerializer())
    );
    context.subscriptions.push(notebookController);
    context.subscriptions.push(registerLanguageProviders(ballerinaExtInstance));
    context.subscriptions.push(registerFocusToOutline());
    context.subscriptions.push(registerVariableView(ballerinaExtInstance));
    context.subscriptions.push(registerRestartNotebook(ballerinaExtInstance, notebookController));
	context.subscriptions.push(
		window.registerWebviewViewProvider(VariableViewProvider.viewType, new VariableViewProvider(ballerinaExtInstance))
    );
}

function registerFocusToOutline(): Disposable {
    return commands.registerCommand('ballerina.notebook.openOutlineView', () => {
        commands.executeCommand('outline.focus');
    });
}

function registerVariableView(ballerinaExtInstance: BallerinaExtension): Disposable {
    return commands.registerCommand('ballerina.notebook.openVariableView', () => {
        ballerinaExtInstance.setNotebookVariableViewEnabled(true);
        commands.executeCommand('ballerinaViewVariables.focus');
    });
}

function registerRestartNotebook(ballerinaExtInstance: BallerinaExtension, 
    notebookController: BallerinaNotebookController): Disposable {
    return commands.registerCommand('ballerina.notebook.restartnotebook', async () => {
		const langClient = <ExtendedLangClient>ballerinaExtInstance.langClient;
        if (!langClient) {
            return;
        }
        await langClient.restartNotebook();
        notebookController.restartExecutionOrder();
        await commands.executeCommand('notebook.clearAllCellsOutputs');
    });
}
