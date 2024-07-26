/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { ChoreoComponentCreationParams, IsRepoClonedRequestParams, Project, RepoCloneRequestParams } from "@wso2-enterprise/choreo-core";
import { RequestType } from "vscode-messenger-common";

export const CreateLocalComponentRequest: RequestType<ChoreoComponentCreationParams, boolean> = { method: 'manager/createLocalComponent' };
export const CreateLocalBalComponentFromExistingSourceRequest: RequestType<ChoreoComponentCreationParams, boolean> = { method: 'manager/createLocalBalComponentFromExistingSource' };
export const GetProjectRoot: RequestType<string, string | undefined> = { method: 'manager/getProjectRoot' };
export const GetProjectDetails: RequestType<string, Project> = { method: 'manager/getProjectDetails' };
export const IsRepoClonedRequest: RequestType<IsRepoClonedRequestParams, boolean> = { method: 'manager/isRepoCloned' };
export const IsComponentNameAvailableRequest: RequestType<string, boolean> = { method: 'manager/isComponentNameAvailable' };
export const CloneRepoRequeset: RequestType<RepoCloneRequestParams, boolean> = { method: 'manager/cloneRepo' };
export const GetRepoPathRequest: RequestType<string, string> = { method: 'manager/getRepoPath' };
export const GetBallerinaVersion: RequestType<string, string> = { method: 'manager/getBallerinaVersion' };

