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
    AddConnectorRequest,
    AddLinkRequest,
    BallerinaTriggerRequest,
    CommandRequest,
    ConnectorsRequest,
    CreateComponentRequest,
    DeleteComponentRequest,
    DeleteLinkRequest,
    DisplayLabelRequest,
    ErrorMessageRequest,
    GoToDesignRequest,
    LocationRequest,
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
    showErrorMessage
} from "@wso2-enterprise/ballerina-core";
import { Messenger } from "vscode-messenger";
import { ProjectDesignDiagramRpcManager } from "./rpc-manager";

export function registerProjectDesignDiagramRpcHandlers(messenger: Messenger) {
    const rpcManger = new ProjectDesignDiagramRpcManager();
    messenger.onRequest(createComponent, (args: CreateComponentRequest) => rpcManger.createComponent(args));
    messenger.onRequest(getProjectDetails, () => rpcManger.getProjectDetails());
    messenger.onRequest(getProjectRoot, () => rpcManger.getProjectRoot());
    messenger.onRequest(addConnector, (args: AddConnectorRequest) => rpcManger.addConnector(args));
    messenger.onRequest(pullConnector, (args: AddConnectorRequest) => rpcManger.pullConnector(args));
    messenger.onRequest(addLink, (args: AddLinkRequest) => rpcManger.addLink(args));
    messenger.onRequest(deleteLink, (args: DeleteLinkRequest) => rpcManger.deleteLink(args));
    messenger.onRequest(pickDirectory, () => rpcManger.pickDirectory());
    messenger.onRequest(executeCommand, (args: CommandRequest) => rpcManger.executeCommand(args));
    messenger.onRequest(fetchTriggers, () => rpcManger.fetchTriggers());
    messenger.onRequest(fetchTrigger, (args: BallerinaTriggerRequest) => rpcManger.fetchTrigger(args));
    messenger.onRequest(editDisplayLabel, (args: DisplayLabelRequest) => rpcManger.editDisplayLabel(args));
    messenger.onRequest(getComponentModel, () => rpcManger.getComponentModel());
    messenger.onNotification(showChoreoProjectOverview, () => rpcManger.showChoreoProjectOverview());
    messenger.onNotification(deleteComponent, (args: DeleteComponentRequest) => rpcManger.deleteComponent(args));
    messenger.onRequest(isChoreoProject, () => rpcManger.isChoreoProject());
    messenger.onRequest(selectedNodeId, () => rpcManger.selectedNodeId());
    messenger.onRequest(isCellView, () => rpcManger.isCellView());
    messenger.onNotification(go2source, (args: LocationRequest) => rpcManger.go2source(args));
    messenger.onNotification(goToDesign, (args: GoToDesignRequest) => rpcManger.goToDesign(args));
    messenger.onNotification(showDiagnosticsWarning, () => rpcManger.showDiagnosticsWarning());
    messenger.onNotification(showErrorMessage, (args: ErrorMessageRequest) => rpcManger.showErrorMessage(args));
    messenger.onNotification(promptWorkspaceConversion, () => rpcManger.promptWorkspaceConversion());
    messenger.onRequest(checkIsMultiRootWs, () => rpcManger.checkIsMultiRootWs());
    messenger.onRequest(getConnectors, (args: ConnectorsRequest) => rpcManger.getConnectors(args));
}
