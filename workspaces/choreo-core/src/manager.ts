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

import { Project, Component, ChoreoComponentCreationParams } from "./types";

export interface IProjectManager {
    createLocalComponent(componentDetails: ChoreoComponentCreationParams | BallerinaComponentCreationParams): Promise<string|boolean>;
    getProjectDetails(): Promise<Project>;
    getProjectRoot(): Promise<string | undefined>;
    getLocalComponents(workspaceFilePath: string): Component[];
    isRepoCloned(params: IsRepoClonedRequestParams): Promise<boolean>;
    cloneRepo(params: RepoCloneRequestParams): Promise<boolean>;
}

export enum BallerinaComponentTypes {
    REST_API = 'restAPI',
    GRAPHQL = 'graphql',
    MAIN = 'main',
    WEBHOOK = 'webhook',
    GRPC_API = 'grpcAPI',
    WEBSOCKET_API = 'websocketAPI'
}

export interface BallerinaComponentCreationParams {
    name: string;
    version: string;
    org: string;
    package: string;
    directory: string;
    type: BallerinaComponentTypes;
    triggerId?: string;
}

export interface IsRepoClonedRequestParams {
    repository: string;
    branch: string;
    workspaceFilePath: string;
}

export type RepoCloneRequestParams = IsRepoClonedRequestParams;
