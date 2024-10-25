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
    AIPanelAPI,
    AIVisualizerState,
    AddToProjectRequest,
    GenerateMappingsRequest,
    GenerateMappingsResponse,
    InitialPrompt,
    NotifyAIMappingsRequest,
    ProjectDiagnostics,
    ProjectSource,
    addToProject,
    clearInitialPrompt,
    generateMappings,
    getAccessToken,
    getAiPanelState,
    getBackendURL,
    getInitialPrompt,
    getProjectSource,
    getProjectUuid,
    getRefreshToken,
    getShadowDiagnostics,
    login,
    logout,
    notifyAIMappings,
    promptLogin,
    refreshAccessToken,
    stopAIMappings,
    updateProject
} from "@wso2-enterprise/ballerina-core";
import { HOST_EXTENSION } from "vscode-messenger-common";
import { Messenger } from "vscode-messenger-webview";

export class AiPanelRpcClient implements AIPanelAPI {
    private _messenger: Messenger;

    constructor(messenger: Messenger) {
        this._messenger = messenger;
    }

    getBackendURL(): Promise<string> {
        return this._messenger.sendRequest(getBackendURL, HOST_EXTENSION);
    }

    updateProject(): void {
        return this._messenger.sendNotification(updateProject, HOST_EXTENSION);
    }

    login(): void {
        return this._messenger.sendNotification(login, HOST_EXTENSION);
    }

    logout(): void {
        return this._messenger.sendNotification(logout, HOST_EXTENSION);
    }

    getAiPanelState(): Promise<AIVisualizerState> {
        return this._messenger.sendRequest(getAiPanelState, HOST_EXTENSION);
    }

    getAccessToken(): Promise<string> {
        return this._messenger.sendRequest(getAccessToken, HOST_EXTENSION);
    }

    refreshAccessToken(): void {
        return this._messenger.sendNotification(refreshAccessToken, HOST_EXTENSION);
    }

    getProjectUuid(): Promise<string> {
        return this._messenger.sendRequest(getProjectUuid, HOST_EXTENSION);
    }

    addToProject(params: AddToProjectRequest): void {
        return this._messenger.sendNotification(addToProject, HOST_EXTENSION, params);
    }

    getRefreshToken(): Promise<string> {
        return this._messenger.sendRequest(getRefreshToken, HOST_EXTENSION);
    }

    generateMappings(params: GenerateMappingsRequest): Promise<GenerateMappingsResponse> {
        return this._messenger.sendRequest(generateMappings, HOST_EXTENSION, params);
    }

    notifyAIMappings(params: NotifyAIMappingsRequest): Promise<boolean> {
        return this._messenger.sendRequest(notifyAIMappings, HOST_EXTENSION, params);
    }

    stopAIMappings(): Promise<GenerateMappingsResponse> {
        return this._messenger.sendRequest(stopAIMappings, HOST_EXTENSION);
    }

    promptLogin(): Promise<boolean> {
        return this._messenger.sendRequest(promptLogin, HOST_EXTENSION);
    }

    getProjectSource(): Promise<ProjectSource> {
        return this._messenger.sendRequest(getProjectSource, HOST_EXTENSION);
    }

    getShadowDiagnostics(params: ProjectSource): Promise<ProjectDiagnostics> {
        return this._messenger.sendRequest(getShadowDiagnostics, HOST_EXTENSION, params);
    }

    getInitialPrompt(): Promise<InitialPrompt> {
        return this._messenger.sendRequest(getInitialPrompt, HOST_EXTENSION);
    }

    clearInitialPrompt(): void {
        return this._messenger.sendNotification(clearInitialPrompt, HOST_EXTENSION);
    }
}
