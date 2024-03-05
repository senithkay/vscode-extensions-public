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
import { ConnectorsRequest, ConnectorsResponse } from "../connector-wizard/interfaces";
import {
    CreateComponentRequest,
    CreateComponentResponse,
    ProjectDetailsResponse,
    ProjectRootResponse,
    AddConnectorRequest,
    AddConnectorResponse,
    PullConnectorResponse,
    AddLinkRequest,
    AddLinkResponse,
    DeleteLinkRequest,
    DeleteLinkResponse,
    DirectoryResponse,
    CommandRequest,
    CommandResponse,
    BallerinaTriggersResponse,
    BallerinaTriggerResponse,
    DisplayLabelRequest,
    DisplayLabelResponse,
    ComponentModelResponse,
    DeleteComponentRequest,
    ChoreoProjectResponse,
    SelectedNodeResponse,
    CellViewResponse,
    GoToDesignRequest,
    ErrorMessageRequest,
    MultiRootWsResponse,
    LocationRequest,
    BallerinaTriggerRequest
} from "./interfaces";
import { RequestType, NotificationType } from "vscode-messenger-common";

const _preFix = "project-design-diagram";
export const createComponent: RequestType<CreateComponentRequest, CreateComponentResponse> = { method: `${_preFix}/createComponent` };
export const getProjectDetails: RequestType<void, ProjectDetailsResponse> = { method: `${_preFix}/getProjectDetails` };
export const getProjectRoot: RequestType<void, ProjectRootResponse> = { method: `${_preFix}/getProjectRoot` };
export const addConnector: RequestType<AddConnectorRequest, AddConnectorResponse> = { method: `${_preFix}/addConnector` };
export const pullConnector: RequestType<AddConnectorRequest, PullConnectorResponse> = { method: `${_preFix}/pullConnector` };
export const addLink: RequestType<AddLinkRequest, AddLinkResponse> = { method: `${_preFix}/addLink` };
export const deleteLink: RequestType<DeleteLinkRequest, DeleteLinkResponse> = { method: `${_preFix}/deleteLink` };
export const pickDirectory: RequestType<void, DirectoryResponse> = { method: `${_preFix}/pickDirectory` };
export const executeCommand: RequestType<CommandRequest, CommandResponse> = { method: `${_preFix}/executeCommand` };
export const fetchTriggers: RequestType<void, BallerinaTriggersResponse> = { method: `${_preFix}/fetchTriggers` };
export const fetchTrigger: RequestType<BallerinaTriggerRequest, BallerinaTriggerResponse> = { method: `${_preFix}/fetchTrigger` };
export const editDisplayLabel: RequestType<DisplayLabelRequest, DisplayLabelResponse> = { method: `${_preFix}/editDisplayLabel` };
export const getComponentModel: RequestType<void, ComponentModelResponse> = { method: `${_preFix}/getComponentModel` };
export const showChoreoProjectOverview: NotificationType<void> = { method: `${_preFix}/showChoreoProjectOverview` };
export const deleteComponent: NotificationType<DeleteComponentRequest> = { method: `${_preFix}/deleteComponent` };
export const isChoreoProject: RequestType<void, ChoreoProjectResponse> = { method: `${_preFix}/isChoreoProject` };
export const selectedNodeId: RequestType<void, SelectedNodeResponse> = { method: `${_preFix}/selectedNodeId` };
export const isCellView: RequestType<void, CellViewResponse> = { method: `${_preFix}/isCellView` };
export const go2source: NotificationType<LocationRequest> = { method: `${_preFix}/go2source` };
export const goToDesign: NotificationType<GoToDesignRequest> = { method: `${_preFix}/goToDesign` };
export const showDiagnosticsWarning: NotificationType<void> = { method: `${_preFix}/showDiagnosticsWarning` };
export const showErrorMessage: NotificationType<ErrorMessageRequest> = { method: `${_preFix}/showErrorMessage` };
export const promptWorkspaceConversion: NotificationType<void> = { method: `${_preFix}/promptWorkspaceConversion` };
export const checkIsMultiRootWs: RequestType<void, MultiRootWsResponse> = { method: `${_preFix}/checkIsMultiRootWs` };
export const getConnectors: RequestType<ConnectorsRequest, ConnectorsResponse> = { method: `${_preFix}/getConnectors` };
