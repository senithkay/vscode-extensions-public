/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of content.
 */

import { Messenger } from "vscode-messenger";
import { ExtensionContext } from "vscode";
import { ExtendedLangClient } from "../../core";
import { RPCManger } from "./rpc-manager";
import {
    addConnector,
    addLink,
    checkIsMultiRootWs,
    createComponent,
    deleteComponent,
    deleteLink,
    editDisplayLabel,
    executeCommand,
    fetchTrigger,
    fetchTriggers,
    getComponentModel,
    getConnectors,
    getProjectDetails,
    getProjectRoot,
    go2source,
    goToDesign,
    isCellView,
    isChoreoProject,
    pickDirectory,
    promptWorkspaceConversion,
    pullConnector,
    selectedNodeId,
    showChoreoProjectOverview,
    showDiagnosticsWarning,
    showErrorMsg
} from "./rpc-types";

export function registerProjectDesignRPCHandlers(messenger: Messenger, langClient: ExtendedLangClient, context: ExtensionContext, isChoreo: boolean) {
    const rpcManger = new RPCManger(isChoreo, langClient, context);
    messenger.onRequest(createComponent, (params) => rpcManger.createComponent(params));
    messenger.onRequest(getProjectDetails, (params) => rpcManger.getProjectDetails());
    messenger.onRequest(getProjectRoot, (params) => rpcManger.getProjectRoot());
    messenger.onRequest(getConnectors, (params) => rpcManger.getConnectors(params));
    messenger.onRequest(addConnector, (params) => rpcManger.addConnector(params));
    messenger.onRequest(pullConnector, (params) => rpcManger.pullConnector(params));
    messenger.onRequest(addLink, (params) => rpcManger.addLink(params));
    messenger.onRequest(deleteLink, (params) => rpcManger.deleteLink(params));
    messenger.onRequest(pickDirectory, (params) => rpcManger.pickDirectory());
    messenger.onRequest(executeCommand, (params) => rpcManger.executeCommand(params));
    messenger.onRequest(fetchTriggers, (params) => rpcManger.fetchTriggers());
    messenger.onRequest(fetchTrigger, (params) => rpcManger.fetchTrigger(params));
    messenger.onRequest(editDisplayLabel, (params) => rpcManger.editDisplayLabel(params));
    messenger.onRequest(checkIsMultiRootWs, (params) => rpcManger.checkIsMultiRootWs());
    messenger.onRequest(getComponentModel, () => rpcManger.getComponentModel());
    messenger.onRequest(showChoreoProjectOverview, (params) => rpcManger.showChoreoProjectOverview());
    messenger.onRequest(deleteComponent, (params) => rpcManger.deleteComponent(params));
    messenger.onRequest(isChoreoProject, (params) => rpcManger.isChoreoProject());
    messenger.onRequest(selectedNodeId, (params) => rpcManger.selectedNodeId());
    messenger.onRequest(isCellView, (params) => rpcManger.isCellView());

    messenger.onNotification(go2source, (params) => rpcManger.go2source(params));
    messenger.onNotification(goToDesign, (params) => rpcManger.goToDesign(params));
    messenger.onNotification(showDiagnosticsWarning, (params) => rpcManger.showDiagnosticsWarning());
    messenger.onNotification(showErrorMsg, (params) => rpcManger.showErrorMsg(params));
    messenger.onNotification(promptWorkspaceConversion, (params) => rpcManger.promptWorkspaceConversion());
}
