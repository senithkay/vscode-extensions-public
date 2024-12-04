/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 * 
 * THIS FILE INCLUDES AUTO GENERATED CODE
 */
import {
    ColorThemeKind,
    EVENT_TYPE,
    GettingStartedCategory,
    GettingStartedData,
    GettingStartedSample,
    GoToSourceRequest,
    HistoryEntry,
    HistoryEntryResponse,
    LogRequest,
    MACHINE_VIEW,
    MIVisualizerAPI,
    NotificationRequest,
    NotificationResponse,
    OpenExternalRequest,
    OpenExternalResponse,
    OpenViewRequest,
    POPUP_EVENT_TYPE,
    PopupVisualizerLocation,
    ProjectOverviewResponse,
    ProjectStructureRequest,
    ProjectStructureResponse,
    ReadmeContentResponse,
    RetrieveContextRequest,
    RetrieveContextResponse,
    RuntimeServicesResponse,
    SampleDownloadRequest,
    HandleCertificateFileRequest,
    HandleCertificateConfigurableRequest,
    FileAppendRequest,
    SwaggerProxyRequest,
    SwaggerProxyResponse,
    ToggleDisplayOverviewRequest,
    UpdateContextRequest,
    VisualizerLocation,
    WorkspaceFolder,
    WorkspacesResponse
} from "@wso2-enterprise/mi-core";
import * as https from "https";
import Mustache from "mustache";
import fetch from 'node-fetch';
import * as vscode from 'vscode';
import { Uri, ViewColumn, commands, env, window, workspace } from "vscode";
import { extension } from "../../MIExtensionContext";
import { DebuggerConfig } from "../../debugger/config";
import { history } from "../../history";
import { StateMachine, navigate, openView } from "../../stateMachine";
import { goToSource, handleOpenFile, appendContent, getFileName, copyFile } from "../../util/fileOperations";
import { openAIWebview } from "../../ai-panel/aiMachine";
import { openPopupView } from "../../stateMachinePopup";
import { SwaggerServer } from "../../swagger/server";
import { log, outputChannel } from "../../util/logger";
import { escapeXml } from '../../util/templates';
import path from "path";

const fs = require('fs');
import { downloadJava, downloadMI, ensureJavaSetup, ensureMISetup, getMIVersionFromPom, getSupportedMIVersions } from '../../util/onboardingUtils';
import { COMMANDS } from '../../constants';

Mustache.escape = escapeXml;
export class MiVisualizerRpcManager implements MIVisualizerAPI {
    async getWorkspaces(): Promise<WorkspacesResponse> {
        return new Promise(async (resolve) => {
            const workspaces = workspace.workspaceFolders;
            const response: WorkspaceFolder[] = (workspaces ?? []).map(space => ({
                index: space.index,
                fsPath: space.uri.fsPath,
                name: space.name
            }));
            resolve({ workspaces: response });
        });
    }

    async getProjectStructure(params: ProjectStructureRequest): Promise<ProjectStructureResponse> {
        return new Promise(async (resolve) => {
            const langClient = StateMachine.context().langClient!;
            const rootPath = workspace.workspaceFolders && workspace.workspaceFolders.length > 0 ?
                workspace.workspaceFolders[0].uri.fsPath
                : undefined;

            if (rootPath === undefined) {
                throw new Error("Error identifying workspace root");
            }
            const projectUrl = params.documentUri ? params.documentUri : rootPath;
            const res = await langClient.getProjectStructure(projectUrl);
            resolve(res);
        });
    }

    openView(params: OpenViewRequest): void {
        if (params.isPopup) {
            const view = params.location.view;

            if (view && view === MACHINE_VIEW.Overview) {
                openPopupView(POPUP_EVENT_TYPE.CLOSE_VIEW, params.location as PopupVisualizerLocation);
            } else {
                openPopupView(params.type as POPUP_EVENT_TYPE, params.location as PopupVisualizerLocation);
            }
        } else {
            openView(params.type as EVENT_TYPE, params.location as VisualizerLocation);
        }
    }

    goBack(): void {
        if (!StateMachine.context().view?.includes("Form")) {
            const entry = history.pop();
            navigate(entry);
        } else {
            navigate();
        }
    }

    async fetchSamplesFromGithub(): Promise<GettingStartedData> {
        return new Promise(async (resolve) => {
            const url = 'https://mi-connectors.wso2.com/samples/info.json';
            try {
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                const samples = JSON.parse(JSON.stringify(data)).Samples;
                const categories = JSON.parse(JSON.stringify(data)).categories;

                let categoriesList: GettingStartedCategory[] = [];
                for (let i = 0; i < categories.length; i++) {
                    const cat: GettingStartedCategory = {
                        id: categories[i][0],
                        title: categories[i][1],
                        icon: categories[i][2]
                    };
                    categoriesList.push(cat);
                }
                let sampleList: GettingStartedSample[] = [];
                for (let i = 0; i < samples.length; i++) {
                    const sample: GettingStartedSample = {
                        category: samples[i][0],
                        priority: samples[i][1],
                        title: samples[i][2],
                        description: samples[i][3],
                        zipFileName: samples[i][4],
                        isAvailable: samples[i][5]
                    };
                    sampleList.push(sample);
                }
                const gettingStartedData: GettingStartedData = {
                    categories: categoriesList,
                    samples: sampleList
                };
                resolve(gettingStartedData);

            } catch (error) {
                console.error('Error:', error);
            }
        });
    }

    downloadSelectedSampleFromGithub(params: SampleDownloadRequest): void {
        const url = 'https://mi-connectors.wso2.com/samples/samples/';
        handleOpenFile(params.zipFileName, url);
    }

    async handleCertificateConfigurable(params: HandleCertificateConfigurableRequest): Promise<void> {
        const projectUri = vscode.workspace.workspaceFolders![0].uri.fsPath;
        const configPropertiesFilePath = [projectUri, 'src', 'main', 'wso2mi', 'resources', 'conf', 'config.properties'].join(path.sep);
        const envFilePath = [projectUri, '.env'].join(path.sep);
        await appendContent(configPropertiesFilePath, `${params.configurableName}:cert\n`);
        await appendContent(envFilePath, `${params.configurableName}\n`);
    }

    async handleCertificateFile(params: HandleCertificateFileRequest): Promise<void> {
        const certificateDirPath = [params.projectUri, 'src', 'main', 'wso2mi', 'resources', 'certificates'].join(path.sep);
        const fileName = getFileName(params.certificateFilePath);
        await copyFile(params.certificateFilePath, certificateDirPath + path.sep + fileName + '.crt');
    }

    async appendContentToFile(params: FileAppendRequest): Promise<boolean> {
        return appendContent(params.filePath, params.content);
    }

    async getHistory(): Promise<HistoryEntryResponse> {
        return new Promise(async (resolve) => {
            const res = history.get();
            resolve({ history: res });
        });
    }

    goHome(): void {
        history.clear();
        navigate();
    }

    goSelected(index: number): void {
        history.select(index);
        navigate();
    }

    addToHistory(entry: HistoryEntry): void {
        history.push(entry);
        navigate();
    }

    async getCurrentThemeKind(): Promise<ColorThemeKind> {
        return new Promise((resolve) => {
            const currentThemeKind = window.activeColorTheme.kind;
            resolve(currentThemeKind);
        });
    }

    async toggleDisplayOverview(params: ToggleDisplayOverviewRequest): Promise<void> {
        return new Promise(async (resolve) => {
            await extension.context.workspaceState.update('displayOverview', params.displayOverview);
            resolve();
        });
    }

    goToSource(params: GoToSourceRequest): void {
        goToSource(params.filePath, params.position);
    }

    reloadWindow(): Promise<void> {
        return new Promise(async (resolve) => {
            await commands.executeCommand('workbench.action.reloadWindow');
            resolve();
        });
    }

    focusOutput(): void {
        // Focus on the output channel
        outputChannel.show();
    }

    log(params: LogRequest): void {
        // Logs the message to the output channel
        log(params.message);
    }

    async updateContext(params: UpdateContextRequest): Promise<void> {
        return new Promise(async (resolve) => {
            const { key, value, contextType = "global" } = params;
            if (contextType === "workspace") {
                await extension.context.workspaceState.update(key, value);
            } else {
                await extension.context.globalState.update(key, value);
            }
            resolve();
        });
    }

    async retrieveContext(params: RetrieveContextRequest): Promise<RetrieveContextResponse> {
        return new Promise((resolve) => {
            const { key, contextType = "global" } = params;
            const value = contextType === "workspace" ?
                extension.context.workspaceState.get(key) :
                extension.context.globalState.get(key);
            resolve({ value });
        });
    }

    async showNotification(params: NotificationRequest): Promise<NotificationResponse> {
        return new Promise(async (resolve) => {
            const { message, options, type = "info" } = params;
            let selection: string | undefined;
            if (type === "info") {
                selection = await window.showInformationMessage(message, ...options ?? []);
            } else if (type === "warning") {
                selection = await window.showWarningMessage(message, ...options ?? []);
            } else {
                selection = await window.showErrorMessage(message, ...options ?? []);
            }

            resolve({ selection });
        });
    }

    async getAvailableRuntimeServices(): Promise<RuntimeServicesResponse> {
        return new Promise(async (resolve) => {
            const username = DebuggerConfig.getManagementUserName();
            const password = DebuggerConfig.getManagementPassword();

            const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64');
            const authHeader = `Basic ${token}`;
            // Create an HTTPS agent that ignores SSL certificate verification
            // MI has ignored the verification for management api, check on this
            const agent = new https.Agent({ rejectUnauthorized: false });

            const runtimeServicesResponse: RuntimeServicesResponse = {
                api: undefined,
                proxy: undefined,
                dataServices: undefined
            };

            const managementPort = DebuggerConfig.getManagementPort();
            const host = DebuggerConfig.getHost();

            const response = await fetch(`https://${host}:${managementPort}/management/login`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${token}`,
                },
                agent: agent // Pass the custom agent
            });

            if (response.ok) {
                const responseBody = await response.json();
                const authToken = responseBody.AccessToken;

                const apiResponse = await fetch(`https://${host}:${managementPort}/management/apis`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    agent: agent // Pass the custom agent
                });

                if (apiResponse.ok) {
                    const apiResponseData = await apiResponse.json();
                    runtimeServicesResponse.api = apiResponseData;
                }


                // get the proxy details
                const proxyResponse = await fetch(`https://${host}:${managementPort}/management/proxy-services`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    agent: agent // Pass the custom agent
                });

                if (proxyResponse.ok) {
                    const proxyResponseData = await proxyResponse.json();
                    runtimeServicesResponse.proxy = proxyResponseData;
                }

                // get the data services details
                const dataServicesResponse = await fetch(`https://${host}:${managementPort}/management/data-services`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    agent: agent // Pass the custom agent
                });

                if (dataServicesResponse.ok) {
                    const dataServicesResponseData = await dataServicesResponse.json();
                    runtimeServicesResponse.dataServices = dataServicesResponseData;
                }

                resolve(runtimeServicesResponse);
            } else {
                log(`Error while login to MI management api: ${response.statusText}`);
                vscode.window.showErrorMessage(`Error while login into the MI Management API: ${response.statusText}`);
            }
        });
    }

    async sendSwaggerProxyRequest(params: SwaggerProxyRequest): Promise<SwaggerProxyResponse> {
        return new Promise(async (resolve) => {
            if (params.command !== 'swaggerRequest') {
                resolve({ isResponse: false });
            } else {
                const swaggerServer: SwaggerServer = new SwaggerServer();
                await swaggerServer.sendRequest(params.request as any, false).then((response) => {
                    if (typeof response === 'boolean') {
                        resolve({ isResponse: true, response: undefined });
                    } else {
                        const responseData: SwaggerProxyResponse = {
                            isResponse: true,
                            response: response
                        };
                        resolve(responseData);
                    }
                });
            }
        });
    }

    async openExternal(params: OpenExternalRequest): Promise<OpenExternalResponse> {
        return new Promise(async (resolve, reject) => {
            const { uri } = params;
            const isSuccess = await env.openExternal(Uri.parse(uri));
            resolve({ success: isSuccess });
        });
    }
    async downloadJava(miVersion: string): Promise<string> {
        const javaPath = await downloadJava(miVersion);
        return javaPath;
    }
    async downloadMI(miVersion: string): Promise<string> {
        const miPath = await downloadMI(miVersion);
        return miPath;
    }
    async getSupportedMIVersions(): Promise<string[]> {
        return getSupportedMIVersions();
    }

    async isJavaHomeSet(): Promise<boolean> {
        try {
            const miVersion = await getMIVersionFromPom();
            return await ensureJavaSetup(miVersion);
        } catch (error) {
            return false;
        }
    }
    async isMISet(): Promise<boolean> {
        try {
            const miVersion = await getMIVersionFromPom();
            const projectUri = vscode.workspace.workspaceFolders![0].uri.fsPath;
            return ensureMISetup(projectUri, miVersion);
        } catch (error) {
            return false;
        }
    }

    async getMIVersionFromPom(): Promise<string> {
        return getMIVersionFromPom();
    }
    async setJavaHomeForMIVersion(miVersion: string): Promise<boolean> {
        return await vscode.commands.executeCommand(COMMANDS.CHANGE_JAVA_HOME);
    }
    async setMIHomeForMIVersion(miVersion: string): Promise<boolean> {
        return await vscode.commands.executeCommand(COMMANDS.CHANGE_SERVER_PATH);
    }
    async getProjectOverview(params: ProjectStructureRequest): Promise<ProjectOverviewResponse> {
        return new Promise(async (resolve) => {
            const langClient = StateMachine.context().langClient!;
            const res = await langClient.getOverviewModel();
            resolve(res);
        });
    }

    openReadme(): void {
        const workspaceFolders = workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            window.showErrorMessage("No workspace folder is open.");
            return;
        }

        const projectRoot = workspaceFolders[0].uri.fsPath;
        const readmePath = path.join(projectRoot, "README.md");

        if (!fs.existsSync(readmePath)) {
            // Create README.md if it doesn't exist
            fs.writeFileSync(readmePath, "# Project Overview\n\nAdd your project description here.");
        }

        // Open README.md in the editor
        workspace.openTextDocument(readmePath).then((doc) => {
            window.showTextDocument(doc, ViewColumn.Beside);
        });
    }

    async getReadmeContent(): Promise<ReadmeContentResponse> {
        return new Promise((resolve) => {
            const workspaceFolders = workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                resolve({ content: "" });
                return;
            }

            const projectRoot = workspaceFolders[0].uri.fsPath;
            const readmePath = path.join(projectRoot, "README.md");

            if (!fs.existsSync(readmePath)) {
                resolve({ content: "" });
                return;
            }

            fs.readFile(readmePath, "utf8", (err, data) => {
                if (err) {
                    console.error("Error reading README.md:", err);
                    resolve({ content: "" });
                } else {
                    resolve({ content: data });
                }
            });
        });
    }
}
