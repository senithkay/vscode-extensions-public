/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Messenger } from "vscode-messenger";
import {
    ChoreoRpcGetBuildPacksRequest,
    ChoreoRpcGetBranchesRequest,
    IChoreoRPCClient,
    ChoreoRpcIsRepoAuthorizedRequest,
    ChoreoRpcGetProjectsRequest,
    ChoreoRpcGetComponentsRequest,
    ChoreoRpcCreateLinkRequest,
    ChoreoRpcCreateProjectRequest,
    ChoreoRpcCreateComponentRequest,
    ChoreoRpcDeleteComponentRequest,
} from "@wso2-enterprise/choreo-core";
import { ProgressLocation, window } from "vscode";

export function registerChoreoRpcResolver(messenger: Messenger, rpcClient: IChoreoRPCClient) {
    messenger.onRequest(ChoreoRpcGetProjectsRequest, (orgID) => rpcClient.getProjects(orgID));
    messenger.onRequest(ChoreoRpcGetComponentsRequest, (params) => rpcClient.getComponentList(params));
    messenger.onRequest(ChoreoRpcCreateLinkRequest, (params) => rpcClient.createComponentLink(params));
    messenger.onRequest(ChoreoRpcCreateProjectRequest, async (params) => {
        return window.withProgress(
            { title: `Creating project ${params.projectName}`, location: ProgressLocation.Notification },
            () => rpcClient.createProject(params)
        );
    });
    messenger.onRequest(ChoreoRpcCreateComponentRequest, async (params) => {
        return window.withProgress(
            { title: `Creating component ${params.name}...`, location: ProgressLocation.Notification },
            () => rpcClient.createComponent(params)
        );
    });
    messenger.onRequest(ChoreoRpcGetBuildPacksRequest, (params) => rpcClient.getBuildPacks(params));
    messenger.onRequest(ChoreoRpcGetBranchesRequest, (params) => rpcClient.getRepoBranches(params));
    messenger.onRequest(ChoreoRpcIsRepoAuthorizedRequest, (params) => rpcClient.isRepoAuthorized(params));
    messenger.onRequest(ChoreoRpcDeleteComponentRequest, async (params) => {
        return window.withProgress(
            { title: `Deleting component ${params.compHandler}...`, location: ProgressLocation.Notification },
            () => rpcClient.deleteComponent(params)
        );
    });
}
