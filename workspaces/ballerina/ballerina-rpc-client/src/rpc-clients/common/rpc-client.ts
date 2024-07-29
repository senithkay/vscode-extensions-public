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
    BallerinaDiagnosticsRequest,
    BallerinaDiagnosticsResponse,
    CommandsRequest,
    CommandsResponse,
    CommonRPCAPI,
    GoToSourceRequest,
    TypeResponse,
    WorkspaceFileRequest,
    WorkspacesFileResponse,
    executeCommand,
    getBallerinaDiagnostics,
    getTypes,
    getWorkspaceFiles,
    goToSource
} from "@wso2-enterprise/ballerina-core";
import { HOST_EXTENSION } from "vscode-messenger-common";
import { Messenger } from "vscode-messenger-webview";

export class CommonRpcClient implements CommonRPCAPI {
    private _messenger: Messenger;

    constructor(messenger: Messenger) {
        this._messenger = messenger;
    }

    getTypes(): Promise<TypeResponse> {
        return this._messenger.sendRequest(getTypes, HOST_EXTENSION);
    }

    goToSource(params: GoToSourceRequest): void {
        return this._messenger.sendNotification(goToSource, HOST_EXTENSION, params);
    }

    getWorkspaceFiles(params: WorkspaceFileRequest): Promise<WorkspacesFileResponse> {
        return this._messenger.sendRequest(getWorkspaceFiles, HOST_EXTENSION, params);
    }

    getBallerinaDiagnostics(params: BallerinaDiagnosticsRequest): Promise<BallerinaDiagnosticsResponse> {
        return this._messenger.sendRequest(getBallerinaDiagnostics, HOST_EXTENSION, params);
    }

    executeCommand(params: CommandsRequest): Promise<CommandsResponse> {
        return this._messenger.sendRequest(executeCommand, HOST_EXTENSION, params);
    }
}
