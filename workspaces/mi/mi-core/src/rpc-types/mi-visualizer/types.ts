/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { HistoryEntry } from "../../history";
import { EVENT_TYPE, VisualizerLocation } from "../../state-machine-types";

export interface WorkspacesResponse {
    workspaces: WorkspaceFolder[];
}

export interface WorkspaceFolder {
    index: number;
    name: string;
    fsPath: string;
}

export interface ProjectStructureRequest {
    documentUri?: string;
}

export interface ProjectStructureResponse {
    directoryMap: {
        esbConfigs: EsbDirectoryMap[];
        dataServiceConfigs: ProjectStructureEntry[],
        dataSourceConfigs: ProjectStructureEntry[],
        mediatorProjects: ProjectStructureEntry[],
        registryResources: ProjectStructureEntry[],
        javaLibraryProjects: ProjectStructureEntry[],
        compositeExporters: ProjectStructureEntry[],
        connectorExporters: ProjectStructureEntry[],
        dockerExporters: ProjectStructureEntry[],
        kubernetesExporters: ProjectStructureEntry[]
    };
}

export interface ProjectDirectoryMap {
    [key: string]: ProjectStructureEntry[];
}

export interface EsbDirectoryMap {
    esbConfigs: ProjectDirectoryMap,
    name: string,
    path: string,
    type: string
}

export interface ProjectStructureEntry {
    resources?: ResourceStructureEntry[],
    sequences?: ProjectStructureEntry[],
    endpoints?: ProjectStructureEntry[],
    type: string,
    name: string,
    path: string

}

export interface ResourceStructureEntry {
    uriTemplate: string,
    method: string
}
export interface GettingStartedSample {
    category: number;
    priority: number;
    title: string;
    description: string;
    zipFileName: string;
}

export interface GettingStartedCategory {
    id: number;
    title: string;
    icon: string;
}
export interface GettingStartedData {
    categories: GettingStartedCategory[];
    samples: GettingStartedSample[];
}
export interface SampleDownloadRequest {
    zipFileName: string;
}

export interface OpenViewRequest {
    type: EVENT_TYPE;
    location: VisualizerLocation;
}

export interface HistoryEntryResponse {
    history: HistoryEntry[];
}
