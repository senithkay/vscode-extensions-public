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
import { window, extensions, ProgressLocation, workspace, ConfigurationChangeEvent, commands } from "vscode";
import * as fs from "fs";
import * as path from "path";

import { activateAuth } from "./auth";
import { ChoreoExtensionApi } from "./ChoreoExtensionApi";

import { ext } from "./extensionVariables";
import { GitExtension } from "./git";
import { activateStatusBarItem } from "./status-bar";
import { activateURIHandlers } from "./uri-handlers";

import { activateWizards } from "./wizards/activate";

import { getLogger, initLogger } from "./logger/logger";
import { choreoSignInCmdId } from "./constants";
import { activateTelemetry } from "./telemetry/telemetry";
import { sendProjectTelemetryEvent, sendTelemetryEvent } from "./telemetry/utils";
import {
    OPEN_WORKSPACE_PROJECT_OVERVIEW_PAGE_CANCEL_EVENT,
    OPEN_WORKSPACE_PROJECT_OVERVIEW_PAGE_FAILURE_EVENT,
    OPEN_WORKSPACE_PROJECT_OVERVIEW_PAGE_START_EVENT,
    OPEN_WORKSPACE_PROJECT_OVERVIEW_PAGE_SUCCESS_EVENT,
} from "@wso2-enterprise/choreo-core";
import { activateActivityBarWebViews } from "./views/webviews/ActivityBar/activate";
import { activateCmds } from "./cmds";
import { TokenStorage } from "./auth/TokenStorage";
import { activateClients } from "./auth/auth";
import { filePathChecker } from "./utils";

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
    setupGithubAuthStatusCheck();
    registerPreInitHandlers();
    ext.isPluginStartup = false;
    openChoreoActivity();
    getLogger().debug("Choreo Extension activated");
    await registerYamlLangugeServer(context);
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
            // open architecture view
            commands.executeCommand("ballerina.view.architectureView");
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

async function registerYamlLangugeServer(context: vscode.ExtensionContext): Promise<void> {
    const yamlExtension = vscode.extensions.getExtension("redhat.vscode-yaml");
    if (!yamlExtension) {
        vscode.window.showErrorMessage(
            'The "YAML Language Support by Red Hat" extension is required for the Choreo Component Configuration to work properly. Please install it and reload the window.'
        );
        return;
    }
    const yamlExtensionAPI = await yamlExtension.activate();
    const SCHEMA = "choreo";

    // Read the schema file content
    const schemaFilePath = path.join(context.extensionPath, "schema", "component-schema.json");

    const schemaContent = fs.readFileSync(schemaFilePath, "utf8");
    const schemaContentJSON = JSON.parse(schemaContent);
    const schemaJSON = JSON.stringify(schemaContentJSON);

    function onRequestSchemaURI(resource: string): string | undefined {
        if (filePathChecker(resource, /config\/.+\.yaml$/)) {
            return `${SCHEMA}://schema/component-config`;
        }
        return undefined;
    }

    function onRequestSchemaContent(schemaUri: string): string | undefined {
        const parsedUri = vscode.Uri.parse(schemaUri);
        if (parsedUri.scheme !== SCHEMA) {
            return undefined;
        }
        if (!parsedUri.path || !parsedUri.path.startsWith("/")) {
            return undefined;
        }

        return schemaJSON;
    }

    // Register the schema provider
    yamlExtensionAPI.registerContributor(SCHEMA, onRequestSchemaURI, onRequestSchemaContent);

    // const extensionRoot = context.extensionUri.fsPath;
    // const templatesFolderPath = vscode.Uri.file(path.join(extensionRoot, "templates/config"));

    // const templateFiles = fs.readdirSync(templatesFolderPath.fsPath);

    // // Process the template files
    // const templates: string[] = [];
    // templateFiles.forEach((file) => {
    //     templates.push(file);
    // });

    // context.subscriptions.push(
    //     vscode.commands.registerCommand("extension.chooseTemplate", async () => {
    //         // Show a quick pick menu to let the user choose a template
    //         const selectedTemplate = await vscode.window.showQuickPick(templates);
    //         if (selectedTemplate) {
    //             const activeEditor = vscode.window.activeTextEditor;
    //             if (activeEditor && filePathChecker(activeEditor.document.fileName, /config\/.+\.yaml$/)) {
    //                 // Insert the selected template into the currently open 'YAML' file
    //                 activeEditor.edit((editBuilder) => {
    //                     const templatePath = vscode.Uri.file(path.join(templatesFolderPath.fsPath, selectedTemplate));
    //                     const templateContent = fs.readFileSync(templatePath.fsPath, "utf-8");
    //                     editBuilder.insert(activeEditor.selection.start, templateContent);
    //                 });
    //             } else {
    //                 vscode.window.showErrorMessage('Please open an "YAML" file.');
    //             }
    //         }
    //     })
    // );

    // // Show the "choose a template" message when the user creates a new "YAML" file
    // context.subscriptions.push(
    //     vscode.workspace.onDidCreateFiles((e) => {
    //         e.files.forEach((file) => {
    //             if (filePathChecker(file.fsPath, /config\/.+\.yaml$/)) {
    //                 vscode.window.showInformationMessage("Choose a template", "Select Template").then((choice) => {
    //                     if (choice === "Select Template") {
    //                         vscode.commands.executeCommand("extension.chooseTemplate");
    //                     }
    //                 });
    //             }
    //         });
    //     })
    // );
}

export function deactivate() {}
