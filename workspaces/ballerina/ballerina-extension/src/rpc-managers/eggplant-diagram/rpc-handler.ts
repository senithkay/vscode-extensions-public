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
    ComponentsRequest,
    CreateComponentRequest,
    EggplantAiSuggestionsRequest,
    EggplantAvailableNodesRequest,
    EggplantConnectorsRequest,
    EggplantNodeTemplateRequest,
    EggplantSourceCodeRequest,
    ProjectRequest,
    ReadmeContentRequest,
    createComponent,
    createComponents,
    createProject,
    deleteFlowNode,
    getAiSuggestions,
    getAvailableNodes,
    getEggplantConnectors,
    getFlowModel,
    getNodeTemplate,
    getProjectComponents,
    getProjectStructure,
    getSourceCode,
    getWorkspaces,
    handleReadmeContent
} from "@wso2-enterprise/ballerina-core";
import { Messenger } from "vscode-messenger";
import { EggplantDiagramRpcManager } from "./rpc-manager";

export function registerEggplantDiagramRpcHandlers(messenger: Messenger) {
    const rpcManger = new EggplantDiagramRpcManager();
    messenger.onRequest(getFlowModel, () => rpcManger.getFlowModel());
    messenger.onRequest(getSourceCode, (args: EggplantSourceCodeRequest) => rpcManger.getSourceCode(args));
    messenger.onRequest(deleteFlowNode, (args: EggplantSourceCodeRequest) => rpcManger.deleteFlowNode(args));
    messenger.onRequest(getAvailableNodes, (args: EggplantAvailableNodesRequest) => rpcManger.getAvailableNodes(args));
    messenger.onRequest(getNodeTemplate, (args: EggplantNodeTemplateRequest) => rpcManger.getNodeTemplate(args));
    messenger.onRequest(getAiSuggestions, (args: EggplantAiSuggestionsRequest) => rpcManger.getAiSuggestions(args));
    messenger.onNotification(createProject, (args: ProjectRequest) => rpcManger.createProject(args));
    messenger.onRequest(getWorkspaces, () => rpcManger.getWorkspaces());
    messenger.onRequest(getProjectStructure, () => rpcManger.getProjectStructure());
    messenger.onRequest(getProjectComponents, () => rpcManger.getProjectComponents());
    messenger.onRequest(createComponent, (args: CreateComponentRequest) => rpcManger.createComponent(args));
    messenger.onRequest(getEggplantConnectors, (args: EggplantConnectorsRequest) => rpcManger.getEggplantConnectors(args));
    messenger.onRequest(handleReadmeContent, (args: ReadmeContentRequest) => rpcManger.handleReadmeContent(args));
    messenger.onRequest(createComponents, (args: ComponentsRequest) => rpcManger.createComponents(args));
}
