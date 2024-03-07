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
    HistoryEntry,
    OpenViewRequest,
    ProjectStructureRequest,
    SampleDownloadRequest,
    addToHistory,
    downloadSelectedSampleFromGithub,
    fetchSamplesFromGithub,
    getHistory,
    getProjectStructure,
    getWorkspaces,
    goBack,
    goHome,
    goSelected,
    openView
} from "@wso2-enterprise/mi-core";
import { Messenger } from "vscode-messenger";
import { MiVisualizerRpcManager } from "./rpc-manager";

export function registerMiVisualizerRpcHandlers(messenger: Messenger) {
    const rpcManger = new MiVisualizerRpcManager();
    messenger.onRequest(getWorkspaces, () => rpcManger.getWorkspaces());
    messenger.onRequest(getProjectStructure, (args: ProjectStructureRequest) => rpcManger.getProjectStructure(args));
    messenger.onNotification(openView, (args: OpenViewRequest) => rpcManger.openView(args));
    messenger.onNotification(goBack, () => rpcManger.goBack());
    messenger.onRequest(fetchSamplesFromGithub, () => rpcManger.fetchSamplesFromGithub());
    messenger.onNotification(downloadSelectedSampleFromGithub, (args: SampleDownloadRequest) => rpcManger.downloadSelectedSampleFromGithub(args));
    messenger.onRequest(getHistory, () => rpcManger.getHistory());
    messenger.onNotification(addToHistory, (args: HistoryEntry) => rpcManger.addToHistory(args));
    messenger.onNotification(goHome, () => rpcManger.goHome());
    messenger.onNotification(goSelected, (args: number) => rpcManger.goSelected(args));
}
