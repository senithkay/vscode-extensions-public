/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 * 
 * THIS FILE INCLUDES AUTO GENERATED CODE
 */
import {
    VisualizerLocationContext,
    WebviewAPI,
} from "@wso2-enterprise/eggplant-core";

export class WebviewRpcManager implements WebviewAPI {
    async getHelloWorld(): Promise<string> {
        return Promise.resolve("Hello World!");
    }

    async getVisualizerState(): Promise<VisualizerLocationContext> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async openVisualizerView(params: VisualizerLocationContext): Promise<VisualizerLocationContext> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }
}
