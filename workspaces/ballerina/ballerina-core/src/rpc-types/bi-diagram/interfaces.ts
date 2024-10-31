/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { LineRange } from "../../interfaces/common";
import { DIRECTORY_MAP, Flow, OverviewFlow } from "../../interfaces/bi";
import { BallerinaProjectComponents, Trigger } from "../../interfaces/extended-lang-client";
import { TriggerFormField } from "../../interfaces/triggers";
import { RemoteFunction, ServiceType } from "../../interfaces/ballerina";

export interface ProjectRequest {
    projectName: string;
    projectPath: string;
    isService: boolean;
}

export interface WorkspacesResponse {
    workspaces: WorkspaceFolder[];
}

export interface WorkspaceFolder {
    index: number;
    name: string;
    fsPath: string;
}

export interface ComponentRequest {
    type: DIRECTORY_MAP;
    serviceType?: ComponentServiceType;
    functionType?: ComponentFunctionType;
    triggerType?: ComponentTriggerType;
}

export interface ComponentServiceType {
    name: string;
    path: string;
    port: string;
    specPath?: string;
}
export interface ComponentFunctionType {
    name: string;
    parameters: FunctionParameters[],
    returnType?: string;
    cron?: string;
}
export interface ComponentTriggerType {
    name: string;
    trigger?: Trigger;
    listener: TriggerFormField[];
    service: TriggerFormField[];
    serviceTypes: Record<string, FunctionField>;
    functions: Record<string, FunctionField>;
}

export interface FunctionField {
    required: boolean;
    checked?: boolean;
    radioValues?: string[];
    serviceType?: ServiceType;
    functionType?: RemoteFunction;
    fields?: TriggerFormField[];
}

export interface FunctionParameters {
    type: string;
    name: string;
    defaultValue?: string;
}
export interface CreateComponentResponse {
    response: boolean,
    error: string
}

export interface ProjectComponentsResponse {
    components: BallerinaProjectComponents
}

export interface ReadmeContentRequest {
    read: boolean
    content?: string;
}

export interface ReadmeContentResponse {
    content: string;
}

export interface BIAiSuggestionsRequest {
    position: LineRange;
    filePath: string;
    isOverview?: boolean;
}
export interface BIAiSuggestionsResponse {
    flowModel: Flow;
    suggestion: string;
    overviewFlow?: OverviewFlow;
}
export interface ComponentsRequest {
    overviewFlow: OverviewFlow
}

export interface ComponentsResponse {
    response: boolean;
}

export interface AIChatRequest {
    scafold: boolean;
    readme: boolean;
}
