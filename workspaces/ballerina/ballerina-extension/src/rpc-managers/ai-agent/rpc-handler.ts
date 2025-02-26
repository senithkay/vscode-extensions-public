/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 * 
 * THIS FILE INCLUDES AUTO GENERATED CODE
 */
import {
    AIGentToolsRequest,
    AIModelsRequest,
    AIToolsRequest,
    genTool,
    getAllAgents,
    getAllModels,
    getModels,
    getTools
} from "@wso2-enterprise/ballerina-core";
import { Messenger } from "vscode-messenger";
import { AiAgentRpcManager } from "./rpc-manager";

export function registerAiAgentRpcHandlers(messenger: Messenger) {
    const rpcManger = new AiAgentRpcManager();
    messenger.onRequest(getAllAgents, () => rpcManger.getAllAgents());
    messenger.onRequest(getAllModels, (args: AIModelsRequest) => rpcManger.getAllModels(args));
    messenger.onRequest(getModels, (args: AIModelsRequest) => rpcManger.getModels(args));
    messenger.onRequest(getTools, (args: AIToolsRequest) => rpcManger.getTools(args));
    messenger.onRequest(genTool, (args: AIGentToolsRequest) => rpcManger.genTool(args));
}
