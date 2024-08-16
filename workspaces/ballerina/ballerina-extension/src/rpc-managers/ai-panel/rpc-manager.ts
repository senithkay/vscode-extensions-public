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
    AIPanelAPI,
    AIVisualizerState
} from "@wso2-enterprise/ballerina-core";
import { StateMachineAI } from '../../views/ai-panel/aiMachine';
import { AI_EVENT_TYPE } from '@wso2-enterprise/ballerina-core';
export class AiPanelRpcManager implements AIPanelAPI {
    async getBackendURL(): Promise<string> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async updateProject(): Promise<void> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async getToken(): Promise<string> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async login(): Promise<void> {
        // ADD YOUR IMPLEMENTATION HERE
        StateMachineAI.service().send(AI_EVENT_TYPE.LOGIN);
    }

    async logout(): Promise<void> {
        // ADD YOUR IMPLEMENTATION HERE
        StateMachineAI.service().send(AI_EVENT_TYPE.LOGOUT);
    }

    async getAIVisualizerState(): Promise<AIVisualizerState> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async getAiPanelState(): Promise<AIVisualizerState> {
        return { state: StateMachineAI.state() };
    }

    async getAccessToken(): Promise<string> {
        // ADD YOUR IMPLEMENTATION HERE
        return StateMachineAI.context().token;
    }

    async refreshAccessToken(): Promise<void> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }
}
