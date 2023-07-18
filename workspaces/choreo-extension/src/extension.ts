/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 * 
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */

import * as vscode from 'vscode';
import { window, extensions, ProgressLocation, workspace, ConfigurationChangeEvent, commands } from 'vscode';

import { activateAuth } from './auth';
import { ChoreoExtensionApi } from './ChoreoExtensionApi';

import { ext } from './extensionVariables';
import { GitExtension } from './git';
import { activateStatusBarItem } from './status-bar';
import { activateURIHandlers } from './uri-handlers';

import { activateWizards } from './wizards/activate';

import { getLogger, initLogger } from "./logger/logger";
import { choreoSignInCmdId } from './constants';
import { activateTelemetry } from './telemetry/telemetry';
import { sendProjectTelemetryEvent, sendTelemetryEvent } from './telemetry/utils';
import { OPEN_WORKSPACE_PROJECT_OVERVIEW_PAGE_CANCEL_EVENT, OPEN_WORKSPACE_PROJECT_OVERVIEW_PAGE_FAILURE_EVENT, OPEN_WORKSPACE_PROJECT_OVERVIEW_PAGE_START_EVENT, OPEN_WORKSPACE_PROJECT_OVERVIEW_PAGE_SUCCESS_EVENT } from '@wso2-enterprise/choreo-core';
import { activateActivityBarWebViews } from './views/webviews/ActivityBar/activate';
import { activateCmds } from './cmds';
import { TokenStorage } from './auth/TokenStorage';
import { activateClients } from './auth/auth';

export function activateBallerinaExtension() {
	const ext = extensions.getExtension("wso2.ballerina");
	if (ext && !ext.isActive) {
		ext.activate();
	}
}

export async function activate(context: vscode.ExtensionContext) {
	activateTelemetry(context);
	await initLogger(context);
  	getLogger().debug("Activating Choreo Extension");
	ext.tokenStorage = new TokenStorage(context);
	ext.isPluginStartup = true;
	ext.context = context;
	ext.api = new ChoreoExtensionApi();
	activateClients();
	setupEvents();
	activateWizards();
	activateAuth();
	activateCmds(context);
	activateActivityBarWebViews(context);
	activateURIHandlers();
	activateStatusBarItem();
	setupGithubAuthStatusCheck();
	registerPreInitHandlers();
	ext.isPluginStartup = false;
	openChoreoActivity();
	getLogger().debug("Choreo Extension activated");
	return ext.api;
}

function setupGithubAuthStatusCheck() {
	ext.api.onStatusChanged(() => {
		ext.clients.githubAppClient.checkAuthStatus();
	});
}

let isChoreoProjectBeingOpened: boolean = false;

// This function is called when the extension is activated.
// it will check if the opened project is a Choreo project.
// if so, it will check if the project is being opened for the first time
// using a vscode global state variable which is set when the project is opened.
// if the project is being opened for the first time, it will activate the Choreo Project view in the sidebar.
async function openChoreoActivity() {
	const isChoreoProject = ext.api.isChoreoProject();
	if (isChoreoProject) {
		// check if the project is being opened for the first time
		const openedProjects: string[] = ext.context.globalState.get("openedProjects") || [];
		const choreoProjectId = ext.api.getChoreoProjectId();
		if (choreoProjectId && !openedProjects.includes(choreoProjectId)) {
			// activate the Choreo Project view in the sidebar
			vscode.commands.executeCommand("choreo.activity.project.focus");
			// open architecture view
			commands.executeCommand("ballerina.view.architectureView");
			// add the project id to the opened projects list
			openedProjects.push(choreoProjectId);
			await ext.context.globalState.update("openedProjects", openedProjects);
		}
	}
}

export async function showChoreoProjectOverview() {
	getLogger().debug("Show Choreo Project Overview if a Choreo project is opened.");
	const isChoreoProject = await ext.api.isChoreoProject();
	if (isChoreoProject) {
		if (isChoreoProjectBeingOpened) {
			getLogger().debug("Choreo project is already being opened. Ignoring Choreo Project Overview.");
			return;
		}	
		sendProjectTelemetryEvent(OPEN_WORKSPACE_PROJECT_OVERVIEW_PAGE_START_EVENT);
		isChoreoProjectBeingOpened = true;
		getLogger().debug("Choreo project is opened. Showing Choreo Project Overview.");
		await window.withProgress({
            title: `Opening Choreo Project Workspace.`,
            location: ProgressLocation.Notification,
            cancellable: true
        }, async (_progress, cancellationToken) => {
            let cancelled: boolean = false;

            cancellationToken.onCancellationRequested(async () => {
				sendProjectTelemetryEvent(OPEN_WORKSPACE_PROJECT_OVERVIEW_PAGE_CANCEL_EVENT);
				getLogger().debug("Choreo Project Overview loading cancelled.");
                cancelled = true;
            });
			// execute choreo project overview cmd
			try {
				getLogger().debug("Loading Choreo Project Metadata.	");
				// first sign in to Choreo
				const isLoggedIn = await ext.api.waitForLogin();
				if (!isLoggedIn) {
					//TODO: Prompt to sign in as the opened Choreo project is not accessible
					getLogger().debug("Choreo Project Overview loading cancelled as the user is not logged in.");
					window.showInformationMessage("Current workspace is a Choreo project. Please sign in to Choreo to view the project overview.", "Sign In").then((selection) => {
						if (selection === "Sign In") {
							vscode.commands.executeCommand(choreoSignInCmdId);
						}
					});
					return;
				}
				// TODO: Check if the Choreo project is accessible by the logged in user using the access token
				// for current organization, prompt and change the organization if needed
				if (cancelled) {
					return;
				}
				const project = await ext.api.getChoreoProject();
				if (cancelled) {
					return;
				}
				getLogger().debug("Choreo Project Metadata loaded. Opening Choreo Project Overview.");
				sendProjectTelemetryEvent(OPEN_WORKSPACE_PROJECT_OVERVIEW_PAGE_SUCCESS_EVENT);
				if (project) {
					vscode.commands.executeCommand("wso2.choreo.project.overview", project);
				}
			} catch (error: any) {
				sendProjectTelemetryEvent(OPEN_WORKSPACE_PROJECT_OVERVIEW_PAGE_FAILURE_EVENT, { cause: error?.message });
				getLogger().error("Error while loading Choreo project overview. " + error.message + (error?.cause ? "\nCause: " + error.cause.message : ""));
				window.showErrorMessage("Error while loading Choreo project overview. " + error.message);
			}
		});
		isChoreoProjectBeingOpened = false;	
	}
}


export function getGitExtensionAPI() {
	getLogger().debug("Getting Git Extension API");
	const gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git')!.exports;
	return gitExtension.getAPI(1);
}

function setupEvents() {
	const subscription: vscode.Disposable = ext.api.onStatusChanged(async (newStatus) => {
		vscode.commands.executeCommand("setContext", "choreoLoginStatus", newStatus);
	});
	ext.context.subscriptions.push(subscription);
}

function registerPreInitHandlers(): any {
	const CONFIG_CHANGED: string = "Choreo extension configuration changed. Please restart vscode for changes to take effect.";
	// We need to restart VSCode if we change plugin configurations.
	workspace.onDidChangeConfiguration((params: ConfigurationChangeEvent) => {
		if (params.affectsConfiguration("Advanced.ChoreoEnvironment")) {
			showMsgAndRestart(CONFIG_CHANGED);
		}
	});
}

function showMsgAndRestart(msg: string): void {
	const action = 'Restart Now';
	window.showInformationMessage(msg, action).then((selection) => {
		if (action === selection) {
			commands.executeCommand('workbench.action.reloadWindow');
		}
	});
}


export function deactivate() { }
