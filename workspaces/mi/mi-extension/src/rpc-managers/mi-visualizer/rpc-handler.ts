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
    GoToSourceRequest,
    HistoryEntry,
    LogRequest,
    NotificationRequest,
    OpenViewRequest,
    ProjectStructureRequest,
    RetrieveContextRequest,
    SampleDownloadRequest,
    UpdateContextRequest,
    addToHistory,
    toggleDisplayOverview,
    downloadSelectedSampleFromGithub,
    fetchSamplesFromGithub,
    getAvailableRuntimeServices,
    getCurrentThemeKind,
    getHistory,
    getProjectStructure,
    getWorkspaces,
    goBack,
    goHome,
    goSelected,
    openView,
    ToggleDisplayOverviewRequest,
    goToSource,
    log,
    focusOutput,
    updateContext,
    retrieveContext,
    showNotification,
    reloadWindow
} from "@wso2-enterprise/mi-core";
import { Messenger } from "vscode-messenger";
import { MiVisualizerRpcManager } from "./rpc-manager";

export function registerMiVisualizerRpcHandlers(messenger: Messenger) {
    const rpcManger = new MiVisualizerRpcManager();
    messenger.onRequest(getWorkspaces, () => rpcManger.getWorkspaces());
    messenger.onRequest(getProjectStructure, (args: ProjectStructureRequest) => rpcManger.getProjectStructure(args));
    messenger.onRequest(getCurrentThemeKind, () => rpcManger.getCurrentThemeKind());
    messenger.onNotification(openView, (args: OpenViewRequest) => rpcManger.openView(args));
    messenger.onRequest(reloadWindow, () => rpcManger.reloadWindow());
    messenger.onNotification(goBack, () => rpcManger.goBack());
    messenger.onRequest(fetchSamplesFromGithub, () => rpcManger.fetchSamplesFromGithub());
    messenger.onNotification(downloadSelectedSampleFromGithub, (args: SampleDownloadRequest) => rpcManger.downloadSelectedSampleFromGithub(args));
    messenger.onRequest(getHistory, () => rpcManger.getHistory());
    messenger.onNotification(addToHistory, (args: HistoryEntry) => rpcManger.addToHistory(args));
    messenger.onNotification(goHome, () => rpcManger.goHome());
    messenger.onNotification(goSelected, (args: number) => rpcManger.goSelected(args));
    messenger.onRequest(toggleDisplayOverview, (args: ToggleDisplayOverviewRequest) => rpcManger.toggleDisplayOverview(args));
    messenger.onNotification(goToSource, (args: GoToSourceRequest) => rpcManger.goToSource(args));
    messenger.onNotification(focusOutput, () => rpcManger.focusOutput());
    messenger.onNotification(log, (args: LogRequest) => rpcManger.log(args));
    messenger.onRequest(updateContext, (args: UpdateContextRequest) => rpcManger.updateContext(args));
    messenger.onRequest(retrieveContext, (args: RetrieveContextRequest) => rpcManger.retrieveContext(args));
    messenger.onRequest(showNotification, (args: NotificationRequest) => rpcManger.showNotification(args));
    messenger.onRequest(getAvailableRuntimeServices, () => rpcManger.getAvailableRuntimeServices());
}
