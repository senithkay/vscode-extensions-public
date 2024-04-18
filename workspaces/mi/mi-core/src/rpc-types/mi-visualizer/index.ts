/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { HistoryEntry } from "../../history";
import { ColorThemeKind } from "../../state-machine-types";
import { ProjectStructureRequest, ProjectStructureResponse, WorkspacesResponse, OpenViewRequest, HistoryEntryResponse, ToggleDisplayOverviewRequest, GetAllRegistryPathsResponse, GetAllRegistryPathsRequest } from "./types";
import { GettingStartedData, SampleDownloadRequest } from "./types";
export interface MIVisualizerAPI {
    getWorkspaces: () => Promise<WorkspacesResponse>;
    getProjectStructure: (params: ProjectStructureRequest) => Promise<ProjectStructureResponse>;
    getCurrentThemeKind: () => Promise<ColorThemeKind>;
    openView: (params: OpenViewRequest) => void;
    goBack: () => void;
    fetchSamplesFromGithub: () => Promise<GettingStartedData>;
    downloadSelectedSampleFromGithub: (params: SampleDownloadRequest) => void;
    getHistory: () => Promise<HistoryEntryResponse>;
    addToHistory: (params: HistoryEntry) => void;
    goHome: () => void;
    goSelected: (params: number) => void;
    toggleDisplayOverview: (params: ToggleDisplayOverviewRequest) => void;
    getAllRegistryPaths: (params: GetAllRegistryPathsRequest) => Promise<GetAllRegistryPathsResponse>;
}
