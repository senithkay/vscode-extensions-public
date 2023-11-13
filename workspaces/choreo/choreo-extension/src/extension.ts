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

import * as vscode from "vscode";
import { window, extensions, ProgressLocation, workspace, ConfigurationChangeEvent, commands, Uri } from "vscode";
import * as path from "path";
import * as fs from "fs";

import { activateAuth } from "./auth";
import { ChoreoExtensionApi } from "./ChoreoExtensionApi";

import { ext } from "./extensionVariables";
import { GitExtension } from "./git";
import { activateStatusBarItem } from "./status-bar";
import { activateURIHandlers } from "./uri-handlers";

import { activateWizards } from "./wizards/activate";

import { getLogger, initLogger } from "./logger/logger";
import { choreoSignInCmdId, COMPONENT_YAML_SCHEMA, COMPONENT_YAML_SCHEMA_DIR } from "./constants";
import { activateTelemetry } from "./telemetry/telemetry";
import { sendProjectTelemetryEvent, sendTelemetryEvent } from "./telemetry/utils";
import {
    ComponentYamlContent,
    ComponentYamlSchema,
    OPEN_WORKSPACE_PROJECT_OVERVIEW_PAGE_CANCEL_EVENT,
    OPEN_WORKSPACE_PROJECT_OVERVIEW_PAGE_FAILURE_EVENT,
    OPEN_WORKSPACE_PROJECT_OVERVIEW_PAGE_START_EVENT,
    OPEN_WORKSPACE_PROJECT_OVERVIEW_PAGE_SUCCESS_EVENT,
    Project,
} from "@wso2-enterprise/choreo-core";
import { activateActivityBarWebViews } from "./views/webviews/ActivityBar/activate";
import { activateCmds } from "./cmds";
import { TokenStorage } from "./auth/TokenStorage";
import { activateClients } from "./auth/auth";
import { enrichComponentSchema, regexFilePathChecker } from "./utils";
import { activateCellDiagram } from './cell-diagram/activate';
import { Cache } from "./cache";

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
    ext.isPluginStartup = true;
    ext.context = context;
    ext.api = new ChoreoExtensionApi();
    setupEvents();
    activateWizards();
    activateAuth(context);
    activateClients();
    activateCmds(context);
    activateActivityBarWebViews(context);
    activateURIHandlers();
    activateStatusBarItem();
	activateCellDiagram(context);
    setupGithubAuthStatusCheck();
    registerPreInitHandlers();
    ext.isPluginStartup = false;
    openChoreoActivity();
    getLogger().debug("Choreo Extension activated");
    await registerYamlLangugeServer();
    return ext.api;
}

function setupGithubAuthStatusCheck() {
    ext.api.onStatusChanged(() => {
        ext.clients.githubAppClient.checkAuthStatus();
    });
}

// This function is called when the extension is activated.
// it will check if the opened project is a Choreo project.
// if so, it will check if the project is being opened for the first time
// using a vscode global state variable which is set when the project is opened.
// if the project is being opened for the first time, it will activate the Choreo Project view in the sidebar.
// Also open choreo activity if OPEN_CHOREO_ACTIVITY value is set
async function openChoreoActivity() {
    const shouldOpenChoreoActivity = await ext.api.shouldOpenChoreoActivity();
    if (shouldOpenChoreoActivity) {
        vscode.commands.executeCommand("choreo.activity.project.focus");
        await ext.api.resetOpenChoreoActivity();
    }

	const isChoreoProject = ext.api.isChoreoProject();
	if (isChoreoProject) {
		// check if the project is being opened for the first time
		const openedProjects: string[] = ext.context.globalState.get("openedProjects") || [];
		const choreoProjectId = ext.api.getChoreoProjectId();
		if (choreoProjectId && !openedProjects.includes(choreoProjectId)) {
			// activate the Choreo Project view in the sidebar
			vscode.commands.executeCommand("choreo.activity.project.focus");
			// add the project id to the opened projects list
			openedProjects.push(choreoProjectId);
			await ext.context.globalState.update("openedProjects", openedProjects);
		}
	}
}

export function getGitExtensionAPI() {
    getLogger().debug("Getting Git Extension API");
    const gitExtension = vscode.extensions.getExtension<GitExtension>("vscode.git")!.exports;
    return gitExtension.getAPI(1);
}

function setupEvents() {
    const subscription: vscode.Disposable = ext.api.onStatusChanged(async (newStatus) => {
        vscode.commands.executeCommand("setContext", "choreoLoginStatus", newStatus);
    });
    ext.context.subscriptions.push(subscription);
}

function registerPreInitHandlers(): any {
    const CONFIG_CHANGED: string =
        "Choreo extension configuration changed. Please restart vscode for changes to take effect.";
    // We need to restart VSCode if we change plugin configurations.
    workspace.onDidChangeConfiguration((params: ConfigurationChangeEvent) => {
        if (params.affectsConfiguration("Advanced.ChoreoEnvironment")) {
            showMsgAndRestart(CONFIG_CHANGED);
        }
    });
}

function showMsgAndRestart(msg: string): void {
    const action = "Restart Now";
    window.showInformationMessage(msg, action).then((selection) => {
        if (action === selection) {
            commands.executeCommand("workbench.action.reloadWindow");
        }
    });
}

async function getComponentYamlMetadata():
    Promise<{ project: Project; component: string, isLocalComponent: boolean } | undefined> 
{
    const openedComponent = await ext.api.getOpenedComponentName();
    const project = await ext.api.getChoreoProject();
    if (!openedComponent || !project) {
        return undefined;
    }
    const isLocalComponent = await ext.api.isLocalComponent(openedComponent);
    if (isLocalComponent === undefined) {
        return undefined;
    }
    return { project, component: openedComponent, isLocalComponent };
}

async function registerYamlLangugeServer(): Promise<void> {
    try {
        const yamlExtension = extensions.getExtension("redhat.vscode-yaml");
        if (!yamlExtension) {
            window.showErrorMessage(
                'Please install "YAML Language Support by Red Hat" extension to proceed'
            );
            return;
        }
        const yamlExtensionAPI = await yamlExtension.activate();
        const SCHEMA = COMPONENT_YAML_SCHEMA;

        // cache
        const componentYamlCache = new Cache<ComponentYamlContent[], [number, string, string]>({
            getDataFunc: (orgId: number, projectHandler: string, componentName: string) => 
            ext.clients.projectClient.getComponentConfig(orgId, projectHandler, componentName)
        });

        // Read the schema file content
        const schemaFilePath = path.join(ext.context.extensionPath, COMPONENT_YAML_SCHEMA_DIR);
        
        const schemaContent = fs.readFileSync(schemaFilePath, "utf8");
        const schemaContentJSON = JSON.parse(schemaContent) as ComponentYamlSchema;

        function onRequestSchemaURI(resource: string): string | undefined {
            if (regexFilePathChecker(resource, /\.choreo\/component.*\.yaml$/)) {
                return `${SCHEMA}://schema/component-yaml`;
            }
            return undefined;
        }

        function onRequestSchemaContent(schemaUri: string): Promise<string> | undefined {
            const parsedUri = Uri.parse(schemaUri);
            if (parsedUri.scheme !== SCHEMA) {
                return undefined;
            }
            if (!parsedUri.path || !parsedUri.path.startsWith("/")) {
                return undefined;
            }

            return new Promise(async (resolve, reject) => {
                const componentMetadata = await getComponentYamlMetadata();
                if (!componentMetadata) {
                    resolve(JSON.stringify(schemaContentJSON));
                } else {
                    try {
                        const componentConfigKey = `${componentMetadata.project.orgId}-${componentMetadata.project.handler}-${componentMetadata.component}`;
                        let componentConfigs: ComponentYamlContent[] | undefined;
                        if (!componentMetadata.isLocalComponent) {
                            componentConfigs = await componentYamlCache.get(componentConfigKey, parseInt(componentMetadata.project.orgId), componentMetadata.project.handler, componentMetadata.component);
                        }
                        const enrichedSchema = enrichComponentSchema(
                            schemaContentJSON,
                            componentMetadata.component,
                            componentMetadata.project.name,
                            componentConfigs
                        );
                        resolve(JSON.stringify(enrichedSchema));
                    } catch(err) {
                        reject(window.showErrorMessage("Could not register schema"));
                    }
                } 
            });
        }

        // Register the schema provider
        yamlExtensionAPI.registerContributor(SCHEMA, onRequestSchemaURI, onRequestSchemaContent);
    } catch {
        window.showErrorMessage("Could not register YAML Language Server");
        return;
    }
}

export function deactivate() {}
