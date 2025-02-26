/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { AIGentToolsRequest, AIGentToolsResponse, AIModelsRequest, AINodesResponse, AIToolsRequest, AIToolsResponse } from "../../interfaces/extended-lang-client";

export interface AIAgentAPI {
    getAllAgents: () => Promise<AINodesResponse>;
    getAllModels: (params: AIModelsRequest) => Promise<AINodesResponse>;
    getModels: (params: AIModelsRequest) => Promise<AINodesResponse>;
    getTools: (params: AIToolsRequest) => Promise<AIToolsResponse>;
    genTool: (params: AIGentToolsRequest) => Promise<AIGentToolsResponse>;
}
