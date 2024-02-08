/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Range } from '@wso2-enterprise/mi-syntax-tree/lib/src';

export interface ApplyEditRequest {
    text: string;
    documentUri: string;
    range: Range;
}

export interface ApplyEditResponse {
    status: boolean;
}

export interface CreateAPIRequest {
    directory: string;
    name: string;
    context: string;
    swaggerDef: string;
    type: string;
    version: string;
}

export interface CreateEndpointRequest {
    directory: string;
    name: string;
    type: string;
    configuration: string;
    address: string;
    uriTemplate: string;
    method: string;
}
export interface CreateEndpointResponse {
    path: string;
}

export interface CreateProjectRequest {
    directory: string;
    name: string;
}

export interface Connector {
    path: string;
    name: string;
    description: string;
    icon: string;
}
export interface ConnectorsResponse {
    data: Connector[];
}

export interface ESBConfigsResponse {
    data: string[];
}

export interface CommandsRequest {
    commands: string[];
}

export interface CommandsResponse {
    data: string;
}

export interface getSTRequest {
    documentUri: string;
}
export interface getSTResponse {
    syntaxTree: any;
    defFilePath: string;
}

export interface ConnectorRequest {
    path: string;
}
export interface ConnectorResponse {
    data: string[];
}

export interface ApiDirectoryResponse {
    data: string;
}

export interface EndpointDirectoryResponse {
    data: string;
}
export interface ShowErrorMessageRequest {
    message: string;
}

export interface OpenDiagramRequest {
    path: string;
}

export interface CreateAPIResponse {
    path: string;
}

export interface EndpointsAndSequencesResponse {
    data: any;
}

export interface SequenceDirectoryResponse {
    data: string;
}

export interface CreateSequenceRequest {
    directory: string;
    name: string;
    endpoint: string;
    onErrorSequence: string;
}
export interface CreateSequenceResponse {
    filePath: string;
}

export interface ProjectRootResponse {
    path: string;
}

export interface ProjectDirResponse {
    path: string;
}

export interface CreateProjectResponse {
    filePath: string;
}

export interface FileStructure {
    [key: string]: string | FileStructure;
}

export interface HighlightCodeRequest {
    range: Range;
}
