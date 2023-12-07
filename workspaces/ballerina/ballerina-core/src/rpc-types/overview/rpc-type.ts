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
import { BallerinaFunctionSTRequest, ExecutorPositionsResponse, GetBallerinaProjectParams } from "../../lang-server-interfaces/project-overview-types";
import { BallerinaSTModifyResponse } from "../../lang-server-interfaces/extended-lang-server-types";
import { RequestType } from "vscode-messenger-common";

const _preFix = "overview";
export const getSTForFunction: RequestType<BallerinaFunctionSTRequest, BallerinaSTModifyResponse> = { method: `${_preFix}/getSTForFunction` };
export const getExecutorPositions: RequestType<GetBallerinaProjectParams, ExecutorPositionsResponse> = { method: `${_preFix}/getExecutorPositions` };
