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
    AIChatRequest,
    BIAiSuggestionsRequest,
    BIAvailableNodesRequest,
    BIConnectorsRequest,
    BIDeleteByComponentInfoRequest,
    BIGetFunctionsRequest,
    BIGetVisibleVariableTypesRequest,
    BINodeTemplateRequest,
    BISourceCodeRequest,
    BreakpointRequest,
    ComponentRequest,
    ComponentsRequest,
    ExpressionCompletionsRequest,
    ExpressionDiagnosticsRequest,
    ProjectRequest,
    ReadmeContentRequest,
    SignatureHelpRequest,
    UpdateConfigVariableRequest,
    VisibleTypesRequest,
    addBreakpointToSource,
    buildProject,
    createComponent,
    createComponents,
    createProject,
    deleteByComponentInfo,
    deleteFlowNode,
    deployProject,
    getAiSuggestions,
    getAvailableNodes,
    getBIConnectors,
    getBreakpointInfo,
    getConfigVariables,
    getExpressionCompletions,
    getExpressionDiagnostics,
    getFlowModel,
    getFunctions,
    getModuleNodes,
    getNodeTemplate,
    getProjectComponents,
    getProjectStructure,
    getReadmeContent,
    getSignatureHelp,
    getSourceCode,
    getVisibleTypes,
    getVisibleVariableTypes,
    getWorkspaces,
    handleReadmeContent,
    openAIChat,
    openReadme,
    removeBreakpointFromSource,
    runProject,
    updateConfigVariables
} from "@wso2-enterprise/ballerina-core";
import { Messenger } from "vscode-messenger";
import { BIDiagramRpcManager } from "./rpc-manager";

export function registerBIDiagramRpcHandlers(messenger: Messenger) {
    const rpcManger = new BIDiagramRpcManager();
    messenger.onRequest(getFlowModel, () => rpcManger.getFlowModel());
    messenger.onRequest(getSourceCode, (args: BISourceCodeRequest) => rpcManger.getSourceCode(args));
    messenger.onRequest(deleteFlowNode, (args: BISourceCodeRequest) => rpcManger.deleteFlowNode(args));
    messenger.onRequest(deleteByComponentInfo, (args: BIDeleteByComponentInfoRequest) => rpcManger.deleteByComponentInfo(args));
    messenger.onRequest(getAvailableNodes, (args: BIAvailableNodesRequest) => rpcManger.getAvailableNodes(args));
    messenger.onRequest(getFunctions, (args: BIGetFunctionsRequest) => rpcManger.getFunctions(args));
    messenger.onRequest(getNodeTemplate, (args: BINodeTemplateRequest) => rpcManger.getNodeTemplate(args));
    messenger.onRequest(getAiSuggestions, (args: BIAiSuggestionsRequest) => rpcManger.getAiSuggestions(args));
    messenger.onNotification(createProject, (args: ProjectRequest) => rpcManger.createProject(args));
    messenger.onRequest(getWorkspaces, () => rpcManger.getWorkspaces());
    messenger.onRequest(getProjectStructure, () => rpcManger.getProjectStructure());
    messenger.onRequest(getProjectComponents, () => rpcManger.getProjectComponents());
    messenger.onRequest(createComponent, (args: ComponentRequest) => rpcManger.createComponent(args));
    messenger.onRequest(getBIConnectors, (args: BIConnectorsRequest) => rpcManger.getBIConnectors(args));
    messenger.onRequest(handleReadmeContent, (args: ReadmeContentRequest) => rpcManger.handleReadmeContent(args));
    messenger.onRequest(createComponents, (args: ComponentsRequest) => rpcManger.createComponents(args));
    messenger.onRequest(getVisibleVariableTypes, (args: BIGetVisibleVariableTypesRequest) => rpcManger.getVisibleVariableTypes(args));
    messenger.onRequest(getExpressionCompletions, (args: ExpressionCompletionsRequest) => rpcManger.getExpressionCompletions(args));
    messenger.onRequest(getConfigVariables, () => rpcManger.getConfigVariables());
    messenger.onRequest(updateConfigVariables, (args: UpdateConfigVariableRequest) => rpcManger.updateConfigVariables(args));
    messenger.onRequest(getModuleNodes, () => rpcManger.getModuleNodes());
    messenger.onRequest(getReadmeContent, () => rpcManger.getReadmeContent());
    messenger.onNotification(openReadme, () => rpcManger.openReadme());
    messenger.onNotification(deployProject, () => rpcManger.deployProject());
    messenger.onNotification(openAIChat, (args: AIChatRequest) => rpcManger.openAIChat(args));
    messenger.onRequest(getSignatureHelp, (args: SignatureHelpRequest) => rpcManger.getSignatureHelp(args));
    messenger.onNotification(buildProject, () => rpcManger.buildProject());
    messenger.onNotification(runProject, () => rpcManger.runProject());
    messenger.onRequest(getVisibleTypes, (args: VisibleTypesRequest) => rpcManger.getVisibleTypes(args));
    messenger.onNotification(addBreakpointToSource, (args: BreakpointRequest) => rpcManger.addBreakpointToSource(args));
    messenger.onNotification(removeBreakpointFromSource, (args: BreakpointRequest) => rpcManger.removeBreakpointFromSource(args));
    messenger.onRequest(getBreakpointInfo, () => rpcManger.getBreakpointInfo());
    messenger.onRequest(getExpressionDiagnostics, (args: ExpressionDiagnosticsRequest) => rpcManger.getExpressionDiagnostics(args));
}
