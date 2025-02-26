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
    AIAgentAPI,
    AIGentToolsRequest,
    AIGentToolsResponse,
    AIModelsRequest,
    AINodesResponse,
    AIToolsRequest,
    AIToolsResponse,
    genTool,
    getAllAgents,
    getAllModels,
    getModels,
    getTools
} from "@wso2-enterprise/ballerina-core";
import { HOST_EXTENSION } from "vscode-messenger-common";
import { Messenger } from "vscode-messenger-webview";

export class AiAgentRpcClient implements AIAgentAPI {
    private _messenger: Messenger;

    constructor(messenger: Messenger) {
        this._messenger = messenger;
    }

    getAllAgents(): Promise<AINodesResponse> {
        return this._messenger.sendRequest(getAllAgents, HOST_EXTENSION);
    }

    getAllModels(params: AIModelsRequest): Promise<AINodesResponse> {
        return this._messenger.sendRequest(getAllModels, HOST_EXTENSION, params);
    }

    getModels(params: AIModelsRequest): Promise<AINodesResponse> {
        return this._messenger.sendRequest(getModels, HOST_EXTENSION, params);
    }

    getTools(params: AIToolsRequest): Promise<AIToolsResponse> {
        return this._messenger.sendRequest(getTools, HOST_EXTENSION, params);
    }

    genTool(params: AIGentToolsRequest): Promise<AIGentToolsResponse> {
        return this._messenger.sendRequest(genTool, HOST_EXTENSION, params);
    }
}
