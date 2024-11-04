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
    FileAppendRequest,
    HandleCertificateFileRequest,
    HandleCertificateConfigurableRequest
} from "./types";
import { GettingStartedData, SampleDownloadRequest } from "./types";
export interface MIVisualizerAPI {
    getWorkspaces: () => Promise<WorkspacesResponse>;
    getProjectStructure: (params: ProjectStructureRequest) => Promise<ProjectStructureResponse>;
    getCurrentThemeKind: () => Promise<ColorThemeKind>;
    openView: (params: OpenViewRequest) => void;
    reloadWindow: () => Promise<void>;
    goBack: () => void;
    fetchSamplesFromGithub: () => Promise<GettingStartedData>;
    downloadSelectedSampleFromGithub: (params: SampleDownloadRequest) => void;
    handleCertificateFile: (params: HandleCertificateFileRequest) => Promise<void>;
    handleCertificateConfigurable: (params: HandleCertificateConfigurableRequest) => Promise<void>;
    appendContentToFile: (params: FileAppendRequest) => Promise<boolean>;
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
    getAvailableRuntimeServices:() => Promise<RuntimeServicesResponse>;
    sendSwaggerProxyRequest: (params: SwaggerProxyRequest) => Promise<SwaggerProxyResponse>;
    openExternal: (params: OpenExternalRequest) => Promise<OpenExternalResponse>;
}
