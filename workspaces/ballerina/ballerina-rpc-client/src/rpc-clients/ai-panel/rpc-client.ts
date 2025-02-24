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
    DeleteFromProjectRequest,
    GenerateMappingFromRecordResponse,
    GenerateMappingsFromRecordRequest,
    GenerateMappingsRequest,
    GenerateMappingsResponse,
    GenerateTestRequest,
    GenerateTypesFromRecordRequest,
    GenerateTypesFromRecordResponse,
    GeneratedTestSource,
    GetFromFileRequest,
    InitialPrompt,
    NotifyAIMappingsRequest,
    PostProcessRequest,
    PostProcessResponse,
    ProjectDiagnostics,
    ProjectSource,
    addToProject,
    applyDoOnFailBlocks,
    checkSyntaxError,
    clearInitialPrompt,
    deleteFromProject,
    generateMappings,
    getAccessToken,
    getActiveFile,
    getAiPanelState,
    getBackendURL,
    getDriftDiagnosticContents,
    getFileExists,
    getFromDocumentation,
    getFromFile,
    getGeneratedTest,
    getInitialPrompt,
    getMappingsFromRecord,
    getProjectSource,
    getProjectUuid,
    getRefreshToken,
    getShadowDiagnostics,
    getTestDiagnostics,
    getTypesFromRecord,
    isCopilotSignedIn,
    isRequirementsSpecificationFileExist,
    isWSO2AISignedIn,
    login,
    logout,
    markAlertShown,
    notifyAIMappings,
    openChat,
    openSettings,
    postProcess,
    promptGithubAuthorize,
    promptLogin,
    promptWSO2AILogout,
    refreshAccessToken,
    showSignInAlert,
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

    addToProject(content: AddToProjectRequest): void {
        return this._messenger.sendNotification(addToProject, HOST_EXTENSION, content);
    }

    getFromFile(content: GetFromFileRequest): Promise<string> {
        return this._messenger.sendRequest(getFromFile, HOST_EXTENSION, content);
    }

    getFileExists(content: GetFromFileRequest): Promise<boolean> {
        return this._messenger.sendRequest(getFileExists, HOST_EXTENSION, content);
    }

    deleteFromProject(content: DeleteFromProjectRequest): void {
        return this._messenger.sendNotification(deleteFromProject, HOST_EXTENSION, content);
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

    getShadowDiagnostics(project: ProjectSource): Promise<ProjectDiagnostics> {
        return this._messenger.sendRequest(getShadowDiagnostics, HOST_EXTENSION, project);
    }

    checkSyntaxError(project: ProjectSource): Promise<boolean> {
        return this._messenger.sendRequest(checkSyntaxError, HOST_EXTENSION, project);
    }

    getInitialPrompt(): Promise<InitialPrompt> {
        return this._messenger.sendRequest(getInitialPrompt, HOST_EXTENSION);
    }

    clearInitialPrompt(): void {
        return this._messenger.sendNotification(clearInitialPrompt, HOST_EXTENSION);
    }

    getGeneratedTest(params: GenerateTestRequest): Promise<GeneratedTestSource> {
        return this._messenger.sendRequest(getGeneratedTest, HOST_EXTENSION, params);
    }

    getTestDiagnostics(params: GeneratedTestSource): Promise<ProjectDiagnostics> {
        return this._messenger.sendRequest(getTestDiagnostics, HOST_EXTENSION, params);
    }

    getMappingsFromRecord(params: GenerateMappingsFromRecordRequest): Promise<GenerateMappingFromRecordResponse> {
        return this._messenger.sendRequest(getMappingsFromRecord, HOST_EXTENSION, params);
    }

    getTypesFromRecord(params: GenerateTypesFromRecordRequest): Promise<GenerateTypesFromRecordResponse> {
        return this._messenger.sendRequest(getTypesFromRecord, HOST_EXTENSION, params);
    }

    applyDoOnFailBlocks(): void {
        return this._messenger.sendNotification(applyDoOnFailBlocks, HOST_EXTENSION);
    }

    postProcess(req: PostProcessRequest): Promise<PostProcessResponse> {
        return this._messenger.sendRequest(postProcess, HOST_EXTENSION, req);
    }

    getActiveFile(): Promise<string> {
        return this._messenger.sendRequest(getActiveFile, HOST_EXTENSION);
    }

    openSettings(): void {
        return this._messenger.sendNotification(openSettings, HOST_EXTENSION);
    }

    openChat(): void {
        return this._messenger.sendNotification(openChat, HOST_EXTENSION);
    }

    promptGithubAuthorize(): Promise<boolean> {
        return this._messenger.sendRequest(promptGithubAuthorize, HOST_EXTENSION);
    }

    promptWSO2AILogout(): Promise<boolean> {
        return this._messenger.sendRequest(promptWSO2AILogout, HOST_EXTENSION);
    }

    isCopilotSignedIn(): Promise<boolean> {
        return this._messenger.sendRequest(isCopilotSignedIn, HOST_EXTENSION);
    }

    isWSO2AISignedIn(): Promise<boolean> {
        return this._messenger.sendRequest(isWSO2AISignedIn, HOST_EXTENSION);
    }

    showSignInAlert(): Promise<boolean> {
        return this._messenger.sendRequest(showSignInAlert, HOST_EXTENSION);
    }

    markAlertShown(): void {
        return this._messenger.sendNotification(markAlertShown, HOST_EXTENSION);
    }

    getFromDocumentation(content: string): Promise<string> {
        return this._messenger.sendRequest(getFromDocumentation, HOST_EXTENSION, content);
    }

    isRequirementsSpecificationFileExist(filePath: string): Promise<boolean> {
        return this._messenger.sendRequest(isRequirementsSpecificationFileExist, HOST_EXTENSION, filePath);
    }

    getDriftDiagnosticContents(projectPath: string): Promise<string> {
        return this._messenger.sendRequest(getDriftDiagnosticContents, HOST_EXTENSION, projectPath);
    }
}
