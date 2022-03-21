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

import { workspace, ExtensionContext, commands } from 'vscode';
import { BallerinaExtension } from '../core';
import { BallerinaNotebookSerializer } from "./notebookSerializer";
import { BallerinaNotebookController } from "./notebookController";
import { registerLanguageProviders } from './languageProvider';

export function activate(ballerinaExtInstance: BallerinaExtension) {
    const context = <ExtensionContext>ballerinaExtInstance.context;

    context.subscriptions.push(
        workspace.registerNotebookSerializer('ballerina-notebook', new BallerinaNotebookSerializer())
    );
    context.subscriptions.push(new BallerinaNotebookController(ballerinaExtInstance));
    context.subscriptions.push(registerLanguageProviders(ballerinaExtInstance));
    context.subscriptions.push(
        commands.registerCommand('ballerina.notebook.openOutlineView', () => {
            commands.executeCommand('outline.focus');
        })
    );
}
