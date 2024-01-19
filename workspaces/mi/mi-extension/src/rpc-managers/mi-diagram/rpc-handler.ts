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
    ApplyEditRequest,
    CommandsRequest,
    ConnectorRequest,
    CreateAPIRequest,
    OpenDiagramRequest,
    ProjectStructureRequest,
    ShowErrorMessageRequest,
    applyEdit,
    closeWebViewNotification,
    createAPI,
    executeCommand,
    getAPIDirectory,
    getConnector,
    getConnectors,
    getProjectStructure,
    getSTRequest,
    getSyntaxTree,
    openDiagram,
    refresh,
    showErrorMessage
} from "@wso2-enterprise/mi-core";
import { Messenger } from "vscode-messenger";
import { MiDiagramRpcManager } from "./rpc-manager";

export function registerMiDiagramRpcHandlers(messenger: Messenger) {
    const rpcManger = new MiDiagramRpcManager();
    messenger.onRequest(executeCommand, (args: CommandsRequest) => rpcManger.executeCommand(args));
    messenger.onRequest(getSyntaxTree, (args: getSTRequest) => rpcManger.getSyntaxTree(args));
    messenger.onRequest(getConnectors, () => rpcManger.getConnectors());
    messenger.onRequest(getConnector, (args: ConnectorRequest) => rpcManger.getConnector(args));
    messenger.onRequest(getProjectStructure, (args: ProjectStructureRequest) => rpcManger.getProjectStructure(args));
    messenger.onRequest(getAPIDirectory, () => rpcManger.getAPIDirectory());
    messenger.onRequest(createAPI, (args: CreateAPIRequest) => rpcManger.createAPI(args));
    messenger.onNotification(showErrorMessage, (args: ShowErrorMessageRequest) => rpcManger.showErrorMessage(args));
    messenger.onNotification(refresh, () => rpcManger.refresh());
    messenger.onRequest(applyEdit, (args: ApplyEditRequest) => rpcManger.applyEdit(args));
    messenger.onNotification(closeWebViewNotification, () => rpcManger.closeWebViewNotification());
    messenger.onNotification(openDiagram, (args: OpenDiagramRequest) => rpcManger.openDiagram(args));
}
