/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
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
        esbConfigs: ProjectDirectoryMap;
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

export interface ProjectStructureEntry {
    resources: ResourceStructureEntry[],
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
