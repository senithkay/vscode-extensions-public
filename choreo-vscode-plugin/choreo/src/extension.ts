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
import * as vscode from 'vscode';
import { window } from 'vscode';
import { activateAuth } from './auth';
import { choreoProjectsTreeId } from './constants';
import { ext } from './extensionVariables';
import { ProjectsTreeProvider } from './views/projects-tree-provider';

export function activate(context: vscode.ExtensionContext) {

	activateAuth();
	
	ext.projectsTreeView = createProjectTreeView();
	ext.isPluginStartup = false;
}


function createProjectTreeView() {
	const choreoResourcesProvider = new ProjectsTreeProvider();
    return window.createTreeView(choreoProjectsTreeId, {
        treeDataProvider: choreoResourcesProvider, showCollapseAll: true
    });
}


export function deactivate() {}
