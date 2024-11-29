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
    OpenExternalRequest,
    OpenViewRequest,
    ProjectStructureRequest,
    RetrieveContextRequest,
    SampleDownloadRequest,
    SwaggerProxyRequest,
    ToggleDisplayOverviewRequest,
    UpdateContextRequest,
    addToHistory,
    downloadSelectedSampleFromGithub,
    fetchSamplesFromGithub,
    focusOutput,
    getAvailableRuntimeServices,
    getCurrentThemeKind,
    getHistory,
    getProjectOverview,
    getProjectStructure,
    getWorkspaces,
    goBack,
    goHome,
    goSelected,
    goToSource,
    log,
    openExternal,
    openView,
    reloadWindow,
    retrieveContext,
    sendSwaggerProxyRequest,
    showNotification,
    downloadJava,
    downloadMI,
    getSupportedMIVersions,
    getMIVersionFromPom,
    setJavaHomeForMIVersion,
    setMIHomeForMIVersion,
    isJavaHomeSet,
    isMISet,
    toggleDisplayOverview,
    updateContext,
    getOverviewPageDetails,
    PomXmlEditRequest,
    removeDependency,
    addDependency,
    updatePomValue,
    updateConfigFileValue,
    ConfigFileEditRequest
} from "@wso2-enterprise/mi-core";
import { Messenger } from "vscode-messenger";
import { MiVisualizerRpcManager } from "./rpc-manager";
import { Range } from '../../../../syntax-tree/lib/src';

export function registerMiVisualizerRpcHandlers(messenger: Messenger) {
    const rpcManger = new MiVisualizerRpcManager();
    messenger.onRequest(getWorkspaces, () => rpcManger.getWorkspaces());
    messenger.onRequest(getProjectStructure, (args: ProjectStructureRequest) => rpcManger.getProjectStructure(args));
    messenger.onRequest(getProjectOverview, (args: ProjectStructureRequest) => rpcManger.getProjectOverview(args));
    messenger.onRequest(getCurrentThemeKind, () => rpcManger.getCurrentThemeKind());
    messenger.onNotification(openView, (args: OpenViewRequest) => rpcManger.openView(args));
    messenger.onNotification(reloadWindow, () => rpcManger.reloadWindow());
    messenger.onNotification(goBack, () => rpcManger.goBack());
    messenger.onRequest(fetchSamplesFromGithub, () => rpcManger.fetchSamplesFromGithub());
    messenger.onNotification(downloadSelectedSampleFromGithub, (args: SampleDownloadRequest) => rpcManger.downloadSelectedSampleFromGithub(args));
    messenger.onRequest(getHistory, () => rpcManger.getHistory());
    messenger.onNotification(addToHistory, (args: HistoryEntry) => rpcManger.addToHistory(args));
    messenger.onNotification(goHome, () => rpcManger.goHome());
    messenger.onNotification(goSelected, (args: number) => rpcManger.goSelected(args));
    messenger.onNotification(toggleDisplayOverview, (args: ToggleDisplayOverviewRequest) => rpcManger.toggleDisplayOverview(args));
    messenger.onNotification(goToSource, (args: GoToSourceRequest) => rpcManger.goToSource(args));
    messenger.onNotification(focusOutput, () => rpcManger.focusOutput());
    messenger.onNotification(log, (args: LogRequest) => rpcManger.log(args));
    messenger.onNotification(updateContext, (args: UpdateContextRequest) => rpcManger.updateContext(args));
    messenger.onRequest(retrieveContext, (args: RetrieveContextRequest) => rpcManger.retrieveContext(args));
    messenger.onRequest(showNotification, (args: NotificationRequest) => rpcManger.showNotification(args));
    messenger.onRequest(getAvailableRuntimeServices, () => rpcManger.getAvailableRuntimeServices());
    messenger.onRequest(sendSwaggerProxyRequest, (args: SwaggerProxyRequest) => rpcManger.sendSwaggerProxyRequest(args));
    messenger.onRequest(openExternal, (args: OpenExternalRequest) => rpcManger.openExternal(args));
    messenger.onRequest(downloadJava, (args: string) => rpcManger.downloadJava(args));
    messenger.onRequest(downloadMI, (args: string) => rpcManger.downloadMI(args));
    messenger.onRequest(getSupportedMIVersions, () => rpcManger.getSupportedMIVersions());
    messenger.onRequest(getMIVersionFromPom, () => rpcManger.getMIVersionFromPom());
    messenger.onRequest(setJavaHomeForMIVersion, (args: string) => rpcManger.setJavaHomeForMIVersion(args));
    messenger.onRequest(setMIHomeForMIVersion, (args: string) => rpcManger.setMIHomeForMIVersion(args));
    messenger.onRequest(isJavaHomeSet, (args: string) => rpcManger.isJavaHomeSet());
    messenger.onRequest(isMISet, (args: string) => rpcManger.isMISet());
    messenger.onRequest(getOverviewPageDetails, () => rpcManger.getOverviewPageDetails());
    messenger.onRequest(removeDependency, (args: Range) => rpcManger.removeDependency(args));
    messenger.onRequest(addDependency, (args: PomXmlEditRequest) => rpcManger.addDependency(args));
    messenger.onRequest(updatePomValue, (args: PomXmlEditRequest) => rpcManger.updatePomValue(args));
    messenger.onRequest(updateConfigFileValue, (args: ConfigFileEditRequest) => rpcManger.updateConfigFileValue(args));
}
