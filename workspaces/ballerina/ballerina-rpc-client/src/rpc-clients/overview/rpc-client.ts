/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 * 
 * AUTO GENERATED CODE
 */

import { HOST_EXTENSION } from "vscode-messenger-common";
import { Messenger } from "vscode-messenger-webview";
import { 
	BallerinaFunctionSTRequest,
	BallerinaProjectComponents,
	BallerinaSTModifyResponse,
	ExecutorPositionsResponse,
	GetBallerinaPackagesParams,
	GetBallerinaProjectParams,
	OverviewAPI,
	getBallerinaProjectComponents,
	getExecutorPositions,
	getSTForFunction
} from "@wso2-enterprise/ballerina-core";

export class OverviewRpcClient implements OverviewAPI {

    private _messenger: Messenger;
    constructor(messenger: Messenger) {
        this._messenger = messenger;
    }

    getBallerinaProjectComponents(params: GetBallerinaPackagesParams): Promise<BallerinaProjectComponents> {
        return this._messenger.sendRequest(getBallerinaProjectComponents, HOST_EXTENSION, params)
    }
    
    getSTForFunction(params: BallerinaFunctionSTRequest): Promise<BallerinaSTModifyResponse> {
        return this._messenger.sendRequest(getSTForFunction, HOST_EXTENSION, params)
    }
    
    getExecutorPositions(params: GetBallerinaProjectParams): Promise<ExecutorPositionsResponse> {
        return this._messenger.sendRequest(getExecutorPositions, HOST_EXTENSION, params)
    }

    
}
