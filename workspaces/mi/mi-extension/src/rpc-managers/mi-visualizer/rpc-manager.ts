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
    GettingStartedData,
    MIVisualizerAPI,
    ProjectStructureRequest,
    ProjectStructureResponse,
    SampleDownloadRequest,
    OpenViewRequest,
    WorkspaceFolder,
    WorkspacesResponse,
    GettingStartedSample,
    GettingStartedCategory
} from "@wso2-enterprise/mi-core";
import fetch from 'node-fetch';
import { workspace } from "vscode";
import { StateMachine, openView } from "../../stateMachine";
import { getPreviousView } from "../../util";
import { handleOpenFile } from "../../util/fileOperations";

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
        openView(params.type, params.location);
    }

    goBack(): void {
        // Get current view
        const currentView = StateMachine.context().view;
        const currentDoc = StateMachine.context().documentUri;
        const view = getPreviousView(currentView!);
        view.length > 0 && openView("OPEN_VIEW", { view: view[0], documentUri: currentDoc });
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
                        zipFileName: samples[i][4]
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
}
