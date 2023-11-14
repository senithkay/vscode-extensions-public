/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

export interface ChoreoAIAPIS {
    perfAPI: string;
    swaggerExamplesAPI: string;
}

export const DEFAULT_CHOREO_AI_APIS: ChoreoAIAPIS = {
    perfAPI: process.env.VSCODE_CHOREO_GATEWAY_BASE_URI ?
        `${process.env.VSCODE_CHOREO_GATEWAY_BASE_URI}/performance-analyzer/2.0.0/get_estimations/4.0` :
        "https://choreocontrolplane.choreo.dev/93tu/performance-analyzer/2.0.0/get_estimations/4.0",
    swaggerExamplesAPI: process.env.VSCODE_CHOREO_GATEWAY_BASE_URI ?
        `${process.env.VSCODE_CHOREO_GATEWAY_BASE_URI}/ai-test-assistant/1.0.0/generate-data` :
        "https://apis.choreo.dev/ai-test-assistant/1.0.0/generate-data"
};

export class ChoreoAIConfig {
    constructor(private _config: ChoreoAIAPIS = DEFAULT_CHOREO_AI_APIS) { }

    public getPerfAPI(): string {
        return this._config.perfAPI;
    }

    public getSwaggerExamplesAPI(): string {
        return this._config.swaggerExamplesAPI;
    }
}
