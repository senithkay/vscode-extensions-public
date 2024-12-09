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
import {
    ProjectStructureRequest,
    ProjectStructureResponse,
    WorkspacesResponse,
    OpenViewRequest,
    HistoryEntryResponse,
    ToggleDisplayOverviewRequest,
    GoToSourceRequest,
    LogRequest,
    UpdateContextRequest,
    RetrieveContextRequest,
    RetrieveContextResponse,
    NotificationRequest,
    NotificationResponse,
    RuntimeServicesResponse,
    SwaggerProxyRequest,
    SwaggerProxyResponse,
    OpenExternalRequest,
    OpenExternalResponse,
    ProjectOverviewResponse,
    ReadmeContentResponse,
    AddConfigurableRequest
    ProjectDetailsResponse,
    UpdateDependenciesRequest,
    UpdatePomValuesRequest,
    UpdateConfigValuesRequest,
} from "./types";
import { GettingStartedData, SampleDownloadRequest } from "./types";

export interface MIVisualizerAPI {
    getWorkspaces: () => Promise<WorkspacesResponse>;
    getProjectStructure: (params: ProjectStructureRequest) => Promise<ProjectStructureResponse>;
    getProjectOverview: (params: ProjectStructureRequest) => Promise<ProjectOverviewResponse>;
    getCurrentThemeKind: () => Promise<ColorThemeKind>;
    openView: (params: OpenViewRequest) => void;
    reloadWindow: () => Promise<void>;
    goBack: () => void;
    fetchSamplesFromGithub: () => Promise<GettingStartedData>;
    downloadSelectedSampleFromGithub: (params: SampleDownloadRequest) => void;
    addConfigurable: (params: AddConfigurableRequest) => Promise<void>;
    getHistory: () => Promise<HistoryEntryResponse>;
    addToHistory: (params: HistoryEntry) => void;
    goHome: () => void;
    goSelected: (params: number) => void;
    toggleDisplayOverview: (params: ToggleDisplayOverviewRequest) => void;
    goToSource: (params: GoToSourceRequest) => void;
    focusOutput: () => void;
    log: (params: LogRequest) => void;
    updateContext: (params: UpdateContextRequest) => Promise<void>;
    retrieveContext: (params: RetrieveContextRequest) => Promise<RetrieveContextResponse>;
    showNotification: (params: NotificationRequest) => Promise<NotificationResponse>;
    getAvailableRuntimeServices: () => Promise<RuntimeServicesResponse>;
    sendSwaggerProxyRequest: (params: SwaggerProxyRequest) => Promise<SwaggerProxyResponse>;
    openExternal: (params: OpenExternalRequest) => Promise<OpenExternalResponse>;
    getReadmeContent: () => Promise<ReadmeContentResponse>;
    openReadme: () => void;
    downloadJava: (params: string) => Promise<string>;
    downloadMI: (params: string) => Promise<string>;
    getSupportedMIVersions: () => Promise<string[]>;
    getMIVersionFromPom: () => Promise<string>;
    setJavaHomeForMIVersion: (params: string) => Promise<boolean>;
    setMIHomeForMIVersion: (params: string) => Promise<boolean>;
    isJavaHomeSet: () => Promise<boolean>;
    isMISet: () => Promise<boolean>;
    getProjectDetails: () => Promise<ProjectDetailsResponse>;
    updateDependencies: (params: UpdateDependenciesRequest) => Promise<boolean>;
    updatePomValues: (params: UpdatePomValuesRequest) => Promise<boolean>;
    updateConfigFileValues: (params: UpdateConfigValuesRequest) => Promise<boolean>;
    importOpenAPISpec: () => Promise<void>;
}
