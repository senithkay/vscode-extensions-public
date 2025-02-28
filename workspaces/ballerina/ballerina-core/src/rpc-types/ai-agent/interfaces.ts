/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { NodePosition } from "@wso2-enterprise/syntax-tree";

export interface AgentModel {
    name: string;
    instruction: string;
}

export interface EntryPointModel {
    entryPoint: string;
    resource?: string;
}

export interface AgentAIModel {
    modelName: string;
    modelConfigs: { [key: string]: string };
}

export interface AgentTools {
    tools: string[];
    newTools: AgentTool[];
}

export interface AgentTool {
    toolName: string;
    toolType: string;

    // Function Related
    functionType: string;
    functionName: string;

    //Connector Related
    connectorState: number; // 1 = New, 2 = Existing
    connectorName: string;
    connectorResource: string;
}

export interface AIAgentRequest {
    agentModel: AgentModel;
    entryPoint: EntryPointModel;
    agentAIModel: AgentAIModel;
    agentTools: AgentTools;
}

export interface AIAgentResponse {
    response: boolean;
    filePath: string;
    position: NodePosition;
}

