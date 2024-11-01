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
    AddToProjectRequest,
    GetFromFileRequest,
    DeleteFromProjectRequest,
    GenerateMappingsRequest,
    NotifyAIMappingsRequest,
    ProjectSource,
    addToProject,
    getFromFile,
    deleteFromProject,
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
    updateProject,
} from "@wso2-enterprise/ballerina-core";
import { Messenger } from "vscode-messenger";
import { AiPanelRpcManager } from "./rpc-manager";

export function registerAiPanelRpcHandlers(messenger: Messenger) {
    const rpcManger = new AiPanelRpcManager();
    messenger.onRequest(getBackendURL, () => rpcManger.getBackendURL());
    messenger.onNotification(updateProject, () => rpcManger.updateProject());
    messenger.onNotification(login, () => rpcManger.login());
    messenger.onNotification(logout, () => rpcManger.logout());
    messenger.onRequest(getAiPanelState, () => rpcManger.getAiPanelState());
    messenger.onRequest(getAccessToken, () => rpcManger.getAccessToken());
    messenger.onNotification(refreshAccessToken, () => rpcManger.refreshAccessToken());
    messenger.onRequest(getProjectUuid, () => rpcManger.getProjectUuid());
    messenger.onNotification(addToProject, (args: AddToProjectRequest) => rpcManger.addToProject(args));
    messenger.onRequest(getFromFile, (args: GetFromFileRequest) => rpcManger.getFromFile(args));
    messenger.onRequest(deleteFromProject, (args: DeleteFromProjectRequest) => rpcManger.deleteFromProject(args));
    messenger.onRequest(getRefreshToken, () => rpcManger.getRefreshToken());
    messenger.onRequest(generateMappings, (args: GenerateMappingsRequest) => rpcManger.generateMappings(args));
    messenger.onRequest(notifyAIMappings, (args: NotifyAIMappingsRequest) => rpcManger.notifyAIMappings(args));
    messenger.onRequest(stopAIMappings, () => rpcManger.stopAIMappings());
    messenger.onRequest(promptLogin, () => rpcManger.promptLogin());
    messenger.onRequest(getProjectSource, () => rpcManger.getProjectSource());
    messenger.onRequest(getShadowDiagnostics, (args: ProjectSource) => rpcManger.getShadowDiagnostics(args));
    messenger.onRequest(getInitialPrompt, () => rpcManger.getInitialPrompt());
    messenger.onNotification(clearInitialPrompt, () => rpcManger.clearInitialPrompt());
}
