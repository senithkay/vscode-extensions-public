/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { BallerinaModuleResponse, BallerinaTriggerInfo, Connector, NodePosition, Trigger } from "../../interfaces/ballerina";
import { BallerinaComponentTypes } from "../../interfaces/common";
import { CMAnnotation, CMDiagnostics, CMEntryPoint, CMLocation, CMService, ComponentModel } from "../../interfaces/component";

export interface CreateComponentRequest {
    name: string;
    version: string;
    org: string;
    package: string;
    directory: string;
    type: BallerinaComponentTypes;
    trigger?: TriggerDetails;
}

export interface TriggerDetails {
    id: string;
    services?: string[];
}

export interface CreateComponentResponse {
    status: string | boolean;
}

export interface ProjectDetailsResponse {
    //unknown
}

export interface ProjectRootResponse {
    response: string
}

export interface AddConnectorRequest {
    connector: Connector;
    source: CMEntryPoint | CMService;
}

export interface AddConnectorResponse {
    status: boolean;
}

export interface PullConnectorResponse {
    status: boolean;
}

export interface AddLinkRequest {
    source: CMEntryPoint | CMService;
    target: CMService;
}

export interface AddLinkResponse {
    status: boolean;
}

export interface DeleteLinkRequest {
    linkLocation: CMLocation;
    nodeLocation: CMLocation;
}

export interface DeleteLinkResponse {
    status: boolean;
}

export interface DirectoryResponse {
    response: string;
}

export interface CommandRequest {
    command: string;
}

export interface CommandResponse {
    status: boolean;
}

export interface BallerinaTriggersResponse extends BallerinaModuleResponse {
    central: Trigger[];
    error?: string;
}

export interface BallerinaTriggerRequest {
    triggerId: string
}

export interface BallerinaTriggerResponse extends BallerinaTriggerInfo {
    error?: string;
}

export interface DisplayLabelRequest {
    annotation: CMAnnotation;
}

export interface DisplayLabelResponse {
    status: boolean;
}

export interface ComponentModelResponse {
    componentModels: {
        [key: string]: ComponentModel;
    };
    diagnostics: CMDiagnostics[];
}

export interface DeleteComponentRequest {
    location: CMLocation;
    deletePkg: boolean;
}

export interface ChoreoProjectResponse {
    response: boolean;
}

export interface SelectedNodeResponse {
    response: string
}

export interface CellViewResponse {
    response: boolean;
}

export interface LocationRequest {
    location: CMLocation;
}

export interface GoToDesignRequest {
    filePath: string;
    position: NodePosition;
}

export interface ErrorMessageRequest {
    message: string;
}

export interface MultiRootWsResponse {
    status: boolean;
}
