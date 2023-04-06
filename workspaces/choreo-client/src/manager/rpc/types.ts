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
import { BallerinaTriggersResponse, BallerinaTriggerResponse } from "@wso2-enterprise/ballerina-languageclient";
import { ChoreoComponentCreationParams, IsRepoClonedRequestParams, Project, RepoCloneRequestParams } from "@wso2-enterprise/choreo-core";
import { RequestType } from "vscode-messenger-common";

export const CreateLocalComponentRequest: RequestType<ChoreoComponentCreationParams, boolean> = { method: 'manager/createLocalComponent' };
export const CreateLocalComponentFromExistingSourceRequest: RequestType<ChoreoComponentCreationParams, boolean> = { method: 'manager/createLocalComponentFromExistingSource' };
export const GetProjectRoot: RequestType<string, string | undefined> = { method: 'manager/getProjectRoot' };
export const GetProjectDetails: RequestType<string, Project> = { method: 'manager/getProjectDetails' };
export const IsRepoClonedRequest: RequestType<IsRepoClonedRequestParams, boolean> = { method: 'manager/isRepoCloned' };
export const CloneRepoRequeset: RequestType<RepoCloneRequestParams, boolean> = { method: 'manager/cloneRepo' };
export const GetRepoPathRequest: RequestType<string, string> = { method: 'manager/getRepoPath' };
export const FetchBallerinaTriggers: RequestType<string, BallerinaTriggersResponse | undefined> = { method: 'manager/fetchBallerinaTriggers' };
export const FetchBallerinaTrigger: RequestType<string, BallerinaTriggerResponse | undefined> = { method: 'manager/fetchBallerinaTrigger' };
export const GetBallerinaVersion: RequestType<string, string> = { method: 'manager/getBallerinaVersion' };

