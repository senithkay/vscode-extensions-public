/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { HistoryEntry } from "../../history";
import { AIVisualizerLocation, EVENT_TYPE, POPUP_EVENT_TYPE, PopupVisualizerLocation, VisualizerLocation } from "../../state-machine-types";

export interface WorkspacesResponse {
    workspaces: WorkspaceFolder[];
}

export interface WorkspaceFolder {
    index: number;
    name: string;
    fsPath: string;
}

export interface Range {
    start: {
        line: number;
        column: number;
    };
    end: {
        line: number;
        column: number;
    };
}

export interface ProjectStructureRequest {
    documentUri?: string;
}

export interface ProjectStructureResponse {
    directoryMap: {
        src: {
            main: {
                test: ProjectDirectoryMap,
                wso2mi: {
                    artifacts: {
                        apis: ProjectStructureArtifactResponse[],
                        dataServices: ProjectStructureArtifactResponse[],
                        dataSources: ProjectStructureArtifactResponse[],
                        endpoints: ProjectStructureArtifactResponse[],
                        inboundEndpoints: ProjectStructureArtifactResponse[],
                        localEntries: ProjectStructureArtifactResponse[],
                        messageProcessors: ProjectStructureArtifactResponse[],
                        messageStores: ProjectStructureArtifactResponse[],
                        proxyServices: ProjectStructureArtifactResponse[],
                        sequences: ProjectStructureArtifactResponse[],
                        tasks: ProjectStructureArtifactResponse[],
                        templates: ProjectStructureArtifactResponse[],
                    },
                    resources: {
                        connectors: ProjectStructureArtifactResponse[],
                        metadata: ProjectStructureArtifactResponse[],
                        registry: ProjectStructureArtifactResponse[],
                    },
                }
            }
        }
    };
}

export interface ProjectStructureArtifactResponse {
    name: string;
    path: string;
    type: string;
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
    subType?: string,
    name: string,
    path: string,
    isRegistryResource?: boolean
}

export interface RegistryStructureEntry {
    type: string,
    name: string,
    path: string,
}

export interface ResourceStructureEntry {
    uriTemplate: string,
    urlMapping: string,
    method: string
}

export interface RegistryResourcesFolder {
    name: string,
    path: string,
    files: RegistryResourceFile[];
    folders: RegistryResourcesFolder[];
}

export interface RegistryResourceFile {
    name: string,
    path: string
}

export interface GettingStartedSample {
    category: number;
    priority: number;
    title: string;
    description: string;
    zipFileName: string;
    isAvailable?: boolean;
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

export interface HandleCertificateFileRequest {
    certificateFilePath: string;
    currentCertificateFileName: string;
    currentConfigurableName: string;
    storedProjectCertificateDirPath: string;
    configPropertiesFilePath: string;
    envFilePath: string
    certificateUsages: object;
}

export interface HandleCertificateConfigurableRequest {
    configurableName: string;
    currentConfigurableName: string;
    currentCertificateFileName: string;
    storedProjectCertificateDirPath: string;
    configPropertiesFilePath: string;
    envFilePath: string
}

export interface FileAppendRequest {
    filePath: string;
    content: string;
}

export interface OpenViewRequest {
    type: EVENT_TYPE | POPUP_EVENT_TYPE;
    location: VisualizerLocation | AIVisualizerLocation | PopupVisualizerLocation;
    isPopup?: boolean;
}

export interface HistoryEntryResponse {
    history: HistoryEntry[];
}

export interface ToggleDisplayOverviewRequest {
    displayOverview: boolean;
}

export interface GoToSourceRequest {
    filePath: string;
    position?: Range;
}

export interface LogRequest {
    message: string;
}

type ContextType = "workspace" | "global";

export interface UpdateContextRequest {
    key: string;
    value: unknown;
    contextType?: ContextType;
}

export interface RetrieveContextRequest {
    key: string;
    contextType?: ContextType;
}

export interface RetrieveContextResponse {
    value: unknown;
}

type NotificationType = "info" | "warning" | "error";

export interface NotificationRequest {
    message: string;
    options?: string[];
    type?: NotificationType;
}

export interface RuntimeServiceDetails {
    count: number;
    list: unknown;
}

export interface Request {
    url: string;
    headers: string;
    method: string;
    body?: string;
}

export interface Response {
    status: number;
    statusText: string;
    data?: string;
    text?: string;
    body?: string;
    obj?: string;
    headers?: Record<string, string>;
  }

export interface SwaggerProxyRequest {
    command: string;
    request: Request;
}

export interface SwaggerProxyResponse {
    isResponse: boolean;
    response?: Response;
}

export interface RuntimeServicesResponse {
    api: RuntimeServiceDetails | undefined;
    proxy: RuntimeServiceDetails | undefined;
    dataServices: RuntimeServiceDetails | undefined;
}

export interface NotificationResponse {
    selection: string | undefined;
}

export interface OpenExternalRequest {
    uri: string;
}

export interface OpenExternalResponse {
    success: boolean;
}
