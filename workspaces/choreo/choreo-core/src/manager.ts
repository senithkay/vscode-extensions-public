/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Project, Component, ChoreoComponentCreationParams, TriggerDetails } from "./types";

export interface IProjectManager {
    createLocalComponent(componentDetails: ChoreoComponentCreationParams | BallerinaComponentCreationParams): Promise<string|boolean>;
    createLocalBalComponentFromExistingSource(componentDetails: ChoreoComponentCreationParams): Promise<string|boolean>;
    getProjectDetails(): Promise<Project>;
    getProjectRoot(): Promise<string | undefined>;
    getLocalComponents(workspaceFilePath: string): Component[];
    isRepoCloned(params: IsRepoClonedRequestParams): Promise<boolean>;
    getRepoPath(repository: string): Promise<string>;
    isComponentNameAvailable(componentName: string): Promise<boolean>;
    cloneRepo(params: RepoCloneRequestParams): Promise<boolean>;
    getBalVersion(): Promise<string>;
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
    trigger?: TriggerDetails;
}

export interface IsRepoClonedRequestParams {
    repository: string;
    branch: string;
    workspaceFilePath: string;
    gitProvider?: string;
}

export type RepoCloneRequestParams = IsRepoClonedRequestParams;
