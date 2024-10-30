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
    GettingStartedData,
    GoToSourceRequest,
    HistoryEntry,
    HistoryEntryResponse,
    LogRequest,
    MIVisualizerAPI,
    NotificationRequest,
    NotificationResponse,
    OpenExternalRequest,
    OpenExternalResponse,
    OpenViewRequest,
    ProjectStructureRequest,
    ProjectStructureResponse,
    RetrieveContextRequest,
    RetrieveContextResponse,
    RuntimeServicesResponse,
    SampleDownloadRequest,
    FileAppendRequest,
    SwaggerProxyRequest,
    SwaggerProxyResponse,
    UpdateContextRequest,
    WorkspacesResponse,
    addToHistory,
    toggleDisplayOverview,
    ToggleDisplayOverviewRequest,
    downloadSelectedSampleFromGithub,
    fetchSamplesFromGithub,
    getCurrentThemeKind,
    appendContentToFile,
    getHistory,
    getProjectStructure,
    getWorkspaces,
    goBack,
    goHome,
    goSelected,
    log,
    openExternal,
    openView,
    reloadWindow,
    focusOutput,
    goToSource,
    retrieveContext,
    sendSwaggerProxyRequest,
    showNotification,
    updateContext,
    getAvailableRuntimeServices
} from "@wso2-enterprise/mi-core";
import { HOST_EXTENSION } from "vscode-messenger-common";
import { Messenger } from "vscode-messenger-webview";

export class MiVisualizerRpcClient implements MIVisualizerAPI {
    private _messenger: Messenger;

    constructor(messenger: Messenger) {
        this._messenger = messenger;
    }

    getWorkspaces(): Promise<WorkspacesResponse> {
        return this._messenger.sendRequest(getWorkspaces, HOST_EXTENSION);
    }

    getProjectStructure(params: ProjectStructureRequest): Promise<ProjectStructureResponse> {
        return this._messenger.sendRequest(getProjectStructure, HOST_EXTENSION, params);
    }

    getCurrentThemeKind(): Promise<ColorThemeKind> {
        return this._messenger.sendRequest(getCurrentThemeKind, HOST_EXTENSION);
    }

    openView(params: OpenViewRequest): void {
        return this._messenger.sendNotification(openView, HOST_EXTENSION, params);
    }

    reloadWindow(): Promise<void> {
        return this._messenger.sendRequest(reloadWindow, HOST_EXTENSION);
    }

    goBack(): void {
        return this._messenger.sendNotification(goBack, HOST_EXTENSION);
    }

    fetchSamplesFromGithub(): Promise<GettingStartedData> {
        return this._messenger.sendRequest(fetchSamplesFromGithub, HOST_EXTENSION);
    }

    downloadSelectedSampleFromGithub(params: SampleDownloadRequest): void {
        return this._messenger.sendNotification(downloadSelectedSampleFromGithub, HOST_EXTENSION, params);
    }

    appendContentToFile(params: FileAppendRequest): Promise<boolean> {
        return this._messenger.sendRequest(appendContentToFile, HOST_EXTENSION, params);
    }

    getHistory(): Promise<HistoryEntryResponse> {
        return this._messenger.sendRequest(getHistory, HOST_EXTENSION);
    }

    addToHistory(params: HistoryEntry): void {
        return this._messenger.sendNotification(addToHistory, HOST_EXTENSION, params);
    }

    goHome(): void {
        return this._messenger.sendNotification(goHome, HOST_EXTENSION);
    }

    goSelected(params: number): void {
        return this._messenger.sendNotification(goSelected, HOST_EXTENSION, params);
    }

    toggleDisplayOverview(params: ToggleDisplayOverviewRequest): Promise<void> {
        return this._messenger.sendRequest(toggleDisplayOverview, HOST_EXTENSION, params);
    }

    goToSource(params: GoToSourceRequest): void {
        return this._messenger.sendNotification(goToSource, HOST_EXTENSION, params);
    }

    focusOutput(): void {
        return this._messenger.sendNotification(focusOutput, HOST_EXTENSION);
    }

    log(params: LogRequest): void {
        return this._messenger.sendNotification(log, HOST_EXTENSION, params);
    }

    updateContext(params: UpdateContextRequest): Promise<void> {
        return this._messenger.sendRequest(updateContext, HOST_EXTENSION, params);
    }

    retrieveContext(params: RetrieveContextRequest): Promise<RetrieveContextResponse> {
        return this._messenger.sendRequest(retrieveContext, HOST_EXTENSION, params);
    }

    showNotification(params: NotificationRequest): Promise<NotificationResponse> {
        return this._messenger.sendRequest(showNotification, HOST_EXTENSION, params);
    }

    getAvailableRuntimeServices(): Promise<RuntimeServicesResponse> {
        return this._messenger.sendRequest(getAvailableRuntimeServices, HOST_EXTENSION);
    }

    sendSwaggerProxyRequest(params: SwaggerProxyRequest): Promise<SwaggerProxyResponse> {
        return this._messenger.sendRequest(sendSwaggerProxyRequest, HOST_EXTENSION, params);
    }

    openExternal(params: OpenExternalRequest): Promise<OpenExternalResponse> {
        return this._messenger.sendRequest(openExternal, HOST_EXTENSION, params);
    }
}
