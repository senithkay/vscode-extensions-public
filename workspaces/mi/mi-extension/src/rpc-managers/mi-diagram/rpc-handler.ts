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
    AIUserInput,
    ApplyEditRequest,
    CommandsRequest,
    ConnectorRequest,
    CreateAPIRequest,
    CreateEndpointRequest,
    CreateProjectRequest,
    CreateSequenceRequest,
    OpenDiagramRequest,
    ShowErrorMessageRequest,
    applyEdit,
    askProjectDirPath,
    closeWebView,
    closeWebViewNotification,
    createAPI,
    createEndpoint,
    createProject,
    createSequence,
    executeCommand,
    getAIResponse,
    getAPIDirectory,
    getConnector,
    getConnectors,
    getESBConfigs,
    getEndpointDirectory,
    getEndpointsAndSequences,
    getProjectRoot,
    getSTRequest,
    getSequenceDirectory,
    getSyntaxTree,
    onRefresh,
    openDiagram,
    openFile,
    showErrorMessage,
    writeContentToFile,
    writeContentToFileRequest
} from "@wso2-enterprise/mi-core";
import { Messenger } from "vscode-messenger";
import { MiDiagramRpcManager } from "./rpc-manager";

export function registerMiDiagramRpcHandlers(messenger: Messenger) {
    const rpcManger = new MiDiagramRpcManager();
    messenger.onRequest(executeCommand, (args: CommandsRequest) => rpcManger.executeCommand(args));
    messenger.onNotification(showErrorMessage, (args: ShowErrorMessageRequest) => rpcManger.showErrorMessage(args));
    messenger.onRequest(getSyntaxTree, (args: getSTRequest) => rpcManger.getSyntaxTree(args));
    messenger.onRequest(applyEdit, (args: ApplyEditRequest) => rpcManger.applyEdit(args));
    messenger.onRequest(getESBConfigs, () => rpcManger.getESBConfigs());
    messenger.onRequest(getConnectors, () => rpcManger.getConnectors());
    messenger.onRequest(getConnector, (args: ConnectorRequest) => rpcManger.getConnector(args));
    messenger.onRequest(getAPIDirectory, () => rpcManger.getAPIDirectory());
    messenger.onRequest(createAPI, (args: CreateAPIRequest) => rpcManger.createAPI(args));
    messenger.onRequest(getEndpointDirectory, () => rpcManger.getEndpointDirectory());
    messenger.onRequest(createEndpoint, (args: CreateEndpointRequest) => rpcManger.createEndpoint(args));
    messenger.onRequest(getEndpointsAndSequences, () => rpcManger.getEndpointsAndSequences());
    messenger.onRequest(getSequenceDirectory, () => rpcManger.getSequenceDirectory());
    messenger.onRequest(createSequence, (args: CreateSequenceRequest) => rpcManger.createSequence(args));
    messenger.onNotification(closeWebView, () => rpcManger.closeWebView());
    messenger.onNotification(openDiagram, (args: OpenDiagramRequest) => rpcManger.openDiagram(args));
    messenger.onNotification(openFile, (args: OpenDiagramRequest) => rpcManger.openFile(args));
        messenger.onNotification(closeWebViewNotification, () => rpcManger.closeWebViewNotification());
    messenger.onRequest(getProjectRoot, () => rpcManger.getProjectRoot());
    messenger.onRequest(askProjectDirPath, () => rpcManger.askProjectDirPath());
    messenger.onRequest(createProject, (args: CreateProjectRequest) => rpcManger.createProject(args));
    messenger.onRequest(getAIResponse, (args: AIUserInput) => rpcManger.getAIResponse(args));
    messenger.onRequest(writeContentToFile, (args: writeContentToFileRequest) => rpcManger.writeContentToFile(args));
}
