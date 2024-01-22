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
import { ApiDirectoryResponse, ApplyEditRequest, ApplyEditResponse, CommandsRequest, CommandsResponse, ConnectorRequest, ConnectorResponse, ConnectorsResponse, CreateAPIRequest, CreateAPIResponse, CreateEndpointRequest, CreateEndpointResponse, CreateSequenceRequest, CreateSequenceResponse, EndpointDirectoryResponse, EndpointsAndSequencesResponse, OpenDiagramRequest, ProjectStructureRequest, ProjectStructureResponse, SequenceDirectoryResponse, ShowErrorMessageRequest, getSTRequest, getSTResponse } from "./types";
import { RequestType, NotificationType } from "vscode-messenger-common";

const _preFix = "mi-diagram";
export const executeCommand: RequestType<CommandsRequest, CommandsResponse> = { method: `${_preFix}/executeCommand` };
export const showErrorMessage: NotificationType<ShowErrorMessageRequest> = { method: `${_preFix}/showErrorMessage` };
export const getSyntaxTree: RequestType<getSTRequest, getSTResponse> = { method: `${_preFix}/getSyntaxTree` };
export const applyEdit: RequestType<ApplyEditRequest, ApplyEditResponse> = { method: `${_preFix}/applyEdit` };
export const getConnectors: RequestType<void, ConnectorsResponse> = { method: `${_preFix}/getConnectors` };
export const getConnector: RequestType<ConnectorRequest, ConnectorResponse> = { method: `${_preFix}/getConnector` };
export const getAPIDirectory: RequestType<void, ApiDirectoryResponse> = { method: `${_preFix}/getAPIDirectory` };
export const createAPI: RequestType<CreateAPIRequest, CreateAPIResponse> = { method: `${_preFix}/createAPI` };
export const getEndpointDirectory: RequestType<void, EndpointDirectoryResponse> = { method: `${_preFix}/getEndpointDirectory` };
export const createEndpoint: RequestType<CreateEndpointRequest, CreateEndpointResponse> = { method: `${_preFix}/createEndpoint` };
export const getEndpointsAndSequences: RequestType<void, EndpointsAndSequencesResponse> = { method: `${_preFix}/getEndpointsAndSequences` };
export const getSequenceDirectory: RequestType<void, SequenceDirectoryResponse> = { method: `${_preFix}/getSequenceDirectory` };
export const createSequence: RequestType<CreateSequenceRequest, CreateSequenceResponse> = { method: `${_preFix}/createSequence` };
export const closeWebView: NotificationType<void> = { method: `${_preFix}/closeWebView` };
export const openDiagram: NotificationType<OpenDiagramRequest> = { method: `${_preFix}/openDiagram` };
export const openFile: NotificationType<OpenDiagramRequest> = { method: `${_preFix}/openFile` };
export const getProjectStructure: RequestType<ProjectStructureRequest, ProjectStructureResponse> = { method: `${_preFix}/getProjectStructure` };
export const refresh: NotificationType<void> = { method: `${_preFix}/refresh` };
export const closeWebViewNotification: NotificationType<void> = { method: `${_preFix}/closeWebViewNotification` };
