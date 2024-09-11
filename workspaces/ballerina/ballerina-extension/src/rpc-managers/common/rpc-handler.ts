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
    CommandsRequest,
    GoToSourceRequest,
    OpenExternalUrlRequest,
    RunExternalCommandRequest,
    WorkspaceFileRequest,
    askProjectDirPath,
    executeCommand,
    experimentalEnabled,
    getBallerinaDiagnostics,
    getTypes,
    getWorkspaceFiles,
    goToSource,
    openExternalUrl,
    runBackgroundTerminalCommand,
} from "@wso2-enterprise/ballerina-core";
import { Messenger } from "vscode-messenger";
import { CommonRpcManager } from "./rpc-manager";

export function registerCommonRpcHandlers(messenger: Messenger) {
    const rpcManger = new CommonRpcManager();
    messenger.onRequest(getTypes, () => rpcManger.getTypes());
    messenger.onNotification(goToSource, (args: GoToSourceRequest) => rpcManger.goToSource(args));
    messenger.onRequest(getWorkspaceFiles, (args: WorkspaceFileRequest) => rpcManger.getWorkspaceFiles(args));
    messenger.onRequest(getBallerinaDiagnostics, (args: BallerinaDiagnosticsRequest) => rpcManger.getBallerinaDiagnostics(args));
    messenger.onRequest(executeCommand, (args: CommandsRequest) => rpcManger.executeCommand(args));
    messenger.onRequest(runBackgroundTerminalCommand, (args: RunExternalCommandRequest) => rpcManger.runBackgroundTerminalCommand(args));
    messenger.onNotification(openExternalUrl, (args: OpenExternalUrlRequest) => rpcManger.openExternalUrl(args));
    messenger.onRequest(askProjectDirPath, () => rpcManger.askProjectDirPath());
    messenger.onRequest(experimentalEnabled, () => rpcManger.experimentalEnabled());
}
