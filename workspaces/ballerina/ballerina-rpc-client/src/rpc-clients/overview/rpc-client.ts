

import { Messenger } from "vscode-messenger-webview";
import { HOST_EXTENSION } from "vscode-messenger-common";
import { ProjectOverviewAPI, BallerinaProjectComponents, ExecutorPositionsResponse, GetBallerinaProjectParams, BallerinaFunctionSTRequest, BallerinaSTModifyResponse, getBallerinaProjectComponents, GetBallerinaPackagesParams } from "@wso2-enterprise/ballerina-core";

export class OverviewRpcClient implements ProjectOverviewAPI {

    private _messenger: Messenger;

    constructor(messenger: Messenger) {
        this._messenger = messenger;
    }

    getBallerinaProjectComponents(params: GetBallerinaPackagesParams): Promise<BallerinaProjectComponents> {
        return this._messenger.sendRequest(getBallerinaProjectComponents, HOST_EXTENSION, params)
    }

    getExecutorPositions: (params: GetBallerinaProjectParams) => Promise<ExecutorPositionsResponse>;

    getSTForFunction: (params: BallerinaFunctionSTRequest) => Promise<BallerinaSTModifyResponse>;

}