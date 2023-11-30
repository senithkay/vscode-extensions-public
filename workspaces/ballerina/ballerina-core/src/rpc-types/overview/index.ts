/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 * 
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */

import { BallerinaFunctionSTRequest, ExecutorPositionsResponse, GetBallerinaProjectParams } from "../../lang-server-interfaces/project-overview-types";
import { BallerinaSTModifyResponse } from "../../lang-server-interfaces/extended-lang-server-types";

export interface OverviewAPI {
    getSTForFunction: (
        params: BallerinaFunctionSTRequest
    ) => Promise<BallerinaSTModifyResponse>;
    getExecutorPositions: (
        params: GetBallerinaProjectParams
    ) => Promise<ExecutorPositionsResponse>;
}
