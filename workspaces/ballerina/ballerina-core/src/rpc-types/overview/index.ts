import { RequestType } from "vscode-messenger-common";
import { BallerinaFunctionSTRequest, BallerinaProjectComponents, ExecutorPositionsResponse, GetBallerinaPackagesParams, GetBallerinaProjectParams } from "../../lang-server-interfaces/project-overview-types";
import { BallerinaSTModifyResponse } from "../../lang-server-interfaces/extended-lang-server-types";

export interface OverviewAPI {
    getBallerinaProjectComponents: (
        params: GetBallerinaPackagesParams
    ) => Promise<BallerinaProjectComponents>;
    getSTForFunction: (
        params: BallerinaFunctionSTRequest
    ) => Thenable<BallerinaSTModifyResponse>;
    getExecutorPositions: (
        params: GetBallerinaProjectParams
    ) => Thenable<ExecutorPositionsResponse>;
}

const projectOverview = "project-overview/"

export const getBallerinaProjectComponents: RequestType<GetBallerinaPackagesParams, BallerinaProjectComponents> = { method: `${projectOverview}getBallerinaProjectComponents` };
export const getSTForFunction: RequestType<BallerinaFunctionSTRequest, BallerinaSTModifyResponse> = { method: `${projectOverview}getSTForFunction` };
export const getExecutorPositions: RequestType<GetBallerinaProjectParams, ExecutorPositionsResponse> = { method: `${projectOverview}getExecutorPositions` };