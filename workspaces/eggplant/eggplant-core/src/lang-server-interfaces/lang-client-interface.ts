/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { BallerinaFunctionSTRequest, BallerinaProjectComponents, BallerinaSTModifyResponse, GetBallerinaPackagesParams } from "@wso2-enterprise/ballerina-core";
import { Flow, LinePosition } from "../rpc-types/webview/types";


export interface EggplantModelRequest {
    filePath: string;
    startLine: LinePosition;
    endLine: LinePosition;
}
export interface LangClientInterface {
    getBallerinaProjectComponents: (params: GetBallerinaPackagesParams) => Promise<BallerinaProjectComponents>;
    getSTByRange: (params: BallerinaFunctionSTRequest) => Promise<BallerinaSTModifyResponse>;
    getEggplantModel: (params: EggplantModelRequest) => Promise<Flow>;
}
