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
    ApiDirectoryResponse,
    ApplyEditRequest,
    CommandsRequest,
    CommandsResponse,
    ConnectorRequest,
    ConnectorResponse,
    ConnectorsResponse,
    CreateAPIRequest,
    MiDiagramAPI,
    OpenDiagramRequest,
    ProjectStructureRequest,
    ProjectStructureResponse,
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
    getSTResponse,
    getSyntaxTree,
    openDiagram,
    refresh,
    showErrorMessage
} from "@wso2-enterprise/mi-core";
import { HOST_EXTENSION } from "vscode-messenger-common";
import { Messenger } from "vscode-messenger-webview";

export class MiDiagramRpcClient implements MiDiagramAPI {
    private _messenger: Messenger;

    constructor(messenger: Messenger) {
        this._messenger = messenger;
    }

    executeCommand(params: CommandsRequest): Promise<CommandsResponse> {
        return this._messenger.sendRequest(executeCommand, HOST_EXTENSION, params);
    }

    getSyntaxTree(params: getSTRequest): Promise<getSTResponse> {
        return this._messenger.sendRequest(getSyntaxTree, HOST_EXTENSION, params);
    }

    getConnectors(): Promise<ConnectorsResponse> {
        return this._messenger.sendRequest(getConnectors, HOST_EXTENSION);
    }

    getConnector(params: ConnectorRequest): Promise<ConnectorResponse> {
        return this._messenger.sendRequest(getConnector, HOST_EXTENSION, params);
    }

    getProjectStructure(params: ProjectStructureRequest): Promise<ProjectStructureResponse> {
        return this._messenger.sendRequest(getProjectStructure, HOST_EXTENSION, params);
    }

    getAPIDirectory(): Promise<ApiDirectoryResponse> {
        return this._messenger.sendRequest(getAPIDirectory, HOST_EXTENSION);
    }

    createAPI(params: CreateAPIRequest): Promise<CreateAPIRequest> {
        return this._messenger.sendRequest(createAPI, HOST_EXTENSION, params);
    }

    showErrorMessage(params: ShowErrorMessageRequest): void {
        return this._messenger.sendNotification(showErrorMessage, HOST_EXTENSION, params);
    }

    refresh(): void {
        return this._messenger.sendNotification(refresh, HOST_EXTENSION);
    }

    applyEdit(params: ApplyEditRequest): Promise<boolean> {
        return this._messenger.sendRequest(applyEdit, HOST_EXTENSION, params);
    }

    closeWebViewNotification(): void {
        return this._messenger.sendNotification(closeWebViewNotification, HOST_EXTENSION);
    }

    openDiagram(params: OpenDiagramRequest): void {
        return this._messenger.sendNotification(openDiagram, HOST_EXTENSION, params);
    }
}
