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
    AIVisualizerLocation,
    ColorThemeKind,
    GettingStartedCategory,
    GettingStartedData,
    GettingStartedSample,
    GoToSourceRequest,
    HistoryEntry,
    HistoryEntryResponse,
    LogRequest,
    MIVisualizerAPI,
    OpenViewRequest,
    ProjectStructureRequest,
    ProjectStructureResponse,
    RetrieveContextRequest,
    RetrieveContextResponse,
    SampleDownloadRequest,
    UpdateContextRequest,
    VisualizerLocation,
    WorkspaceFolder,
    WorkspacesResponse,
    ToggleDisplayOverviewRequest,
    POPUP_EVENT_TYPE,
    PopupVisualizerLocation,
    EVENT_TYPE,
    MACHINE_VIEW,
} from "@wso2-enterprise/mi-core";
import fetch from 'node-fetch';
import { workspace, window, commands } from "vscode";
import { history } from "../../history";
import { StateMachine, navigate, openView } from "../../stateMachine";
import { goToSource, handleOpenFile } from "../../util/fileOperations";
import { openAIWebview } from "../../ai-panel/aiMachine";
import { extension } from "../../MIExtensionContext";
import { openPopupView } from "../../stateMachinePopup";
import { log, outputChannel } from "../../util/logger";

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
            const isFormView = view && view.includes("Form");
            const isCloseEvent = params.type === POPUP_EVENT_TYPE.CLOSE_VIEW;
            if (isFormView || isCloseEvent) {
                openPopupView(params.type as POPUP_EVENT_TYPE, params.location as PopupVisualizerLocation);
            }
            if (view && view === MACHINE_VIEW.Overview) {
                openPopupView(POPUP_EVENT_TYPE.CLOSE_VIEW, params.location as PopupVisualizerLocation);
            }
        } else {
            openView(params.type as EVENT_TYPE, params.location as VisualizerLocation);
        }
    }

    goBack(): void {
        const entry = history.pop();
        navigate(entry);
    }

    async fetchSamplesFromGithub(): Promise<GettingStartedData> {
        return new Promise(async (resolve) => {
            const url = 'https://raw.githubusercontent.com/wso2/integration-studio/main/SamplesForVSCode/info.json';
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
        const url = 'https://github.com/wso2/integration-studio/raw/main/SamplesForVSCode/samples/';
        handleOpenFile(params.zipFileName, url);
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
}
