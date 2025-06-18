/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import {
	BuildPackReq,
	CancelApprovalReq,
	CheckWorkflowStatusReq,
	ChoreoRpcCancelWorkflowApproval,
	ChoreoRpcCheckWorkflowStatus,
	ChoreoRpcCreateBuildRequest,
	ChoreoRpcCreateComponentConnection,
	ChoreoRpcCreateComponentRequest,
	ChoreoRpcCreateDeploymentRequest,
	ChoreoRpcCreateProjectRequest,
	ChoreoRpcDeleteComponentRequest,
	ChoreoRpcDeleteConnection,
	ChoreoRpcDisableAutoBuild,
	ChoreoRpcEnableAutoBuild,
	ChoreoRpcGetAutoBuildStatus,
	ChoreoRpcGetBranchesRequest,
	ChoreoRpcGetBuildLogs,
	ChoreoRpcGetBuildLogsForType,
	ChoreoRpcGetBuildPacksRequest,
	ChoreoRpcGetBuildsRequest,
	ChoreoRpcGetCommitsRequest,
	ChoreoRpcGetComponentItemRequest,
	ChoreoRpcGetComponentsRequest,
	ChoreoRpcGetConnectionGuide,
	ChoreoRpcGetConnectionItem,
	ChoreoRpcGetConnections,
	ChoreoRpcGetCredentialsRequest,
	ChoreoRpcGetDeploymentStatusRequest,
	ChoreoRpcGetDeploymentTracksRequest,
	ChoreoRpcGetEndpointsRequest,
	ChoreoRpcGetEnvsRequest,
	ChoreoRpcGetMarketplaceItemIdl,
	ChoreoRpcGetMarketplaceItems,
	ChoreoRpcGetProjectsRequest,
	ChoreoRpcGetProxyDeploymentInfo,
	ChoreoRpcGetSwaggerRequest,
	ChoreoRpcGetTestKeyRequest,
	ChoreoRpcIsRepoAuthorizedRequest,
	ChoreoRpcPromoteProxyDeployment,
	ChoreoRpcRequestPromoteApproval,
	GetAutoBuildStatusReq,
	GetBranchesReq,
	GetBuildLogsForTypeReq,
	GetBuildLogsReq,
	GetBuildsReq,
	GetCommitsReq,
	GetComponentEndpointsReq,
	GetComponentItemReq,
	GetComponentsReq,
	GetConnectionGuideReq,
	GetConnectionItemReq,
	GetConnectionsReq,
	GetCredentialsReq,
	GetDeploymentStatusReq,
	GetDeploymentTracksReq,
	GetMarketplaceIdlReq,
	GetMarketplaceListReq,
	GetProjectEnvsReq,
	GetProxyDeploymentInfoReq,
	GetSwaggerSpecReq,
	GetTestKeyReq,
	IsRepoAuthorizedReq,
	PromoteProxyDeploymentReq,
	RequestPromoteApprovalReq,
	ToggleAutoBuildReq,
	type IChoreoRPCClient,
} from "@wso2-enterprise/choreo-core";
import { ProgressLocation, window } from "vscode";
import type { Messenger } from "vscode-messenger";

export function registerChoreoRpcResolver(messenger: Messenger, rpcClient: IChoreoRPCClient) {
	messenger.onRequest(ChoreoRpcGetProjectsRequest, (orgID:string) => rpcClient.getProjects(orgID));
	messenger.onRequest(ChoreoRpcGetComponentItemRequest, (params:GetComponentItemReq) => rpcClient.getComponentItem(params));
	messenger.onRequest(ChoreoRpcGetComponentsRequest, (params:GetComponentsReq) => rpcClient.getComponentList(params));
	messenger.onRequest(ChoreoRpcCreateProjectRequest, async (params: any) => {
		return window.withProgress({ title: `Creating project ${params.projectName}`, location: ProgressLocation.Notification }, () =>
			rpcClient.createProject(params),
		);
	});
	messenger.onRequest(ChoreoRpcCreateComponentRequest, async (params: any) => {
		return window.withProgress({ title: `Creating component ${params.name}...`, location: ProgressLocation.Notification }, () =>
			rpcClient.createComponent(params),
		);
	});
	messenger.onRequest(ChoreoRpcGetBuildPacksRequest, (params: BuildPackReq) => rpcClient.getBuildPacks(params));
	messenger.onRequest(ChoreoRpcGetBranchesRequest, (params:GetBranchesReq) => rpcClient.getRepoBranches(params));
	messenger.onRequest(ChoreoRpcIsRepoAuthorizedRequest, (params:IsRepoAuthorizedReq) => rpcClient.isRepoAuthorized(params));
	messenger.onRequest(ChoreoRpcGetCredentialsRequest, (params: GetCredentialsReq) => rpcClient.getCredentials(params));
	messenger.onRequest(ChoreoRpcDeleteComponentRequest, async (params: { orgId: string; orgHandler: string; projectId: string; componentId: string; componentName: string }) => {
		return window.withProgress({ title: `Deleting component ${params.componentName ?? params.componentId}...`, location: ProgressLocation.Notification }, () =>
			rpcClient.deleteComponent({
				orgId: params.orgId,
				orgHandler: params.orgHandler,
				projectId: params.projectId,
				componentId: params.componentId,
				componentName: params.componentName,
			}),
		);
	});
	messenger.onRequest(ChoreoRpcCreateBuildRequest, async (params: any) => {
		return window.withProgress({ title: `Triggering build for ${params.componentName}...`, location: ProgressLocation.Notification }, () =>
			rpcClient.createBuild(params),
		);
	});
	messenger.onRequest(ChoreoRpcGetDeploymentTracksRequest, (params:GetDeploymentTracksReq) => rpcClient.getDeploymentTracks(params));
	messenger.onRequest(ChoreoRpcGetBuildsRequest, (params: GetBuildsReq) => rpcClient.getBuilds(params));
	messenger.onRequest(ChoreoRpcGetCommitsRequest, (params: GetCommitsReq) => rpcClient.getCommits(params));
	messenger.onRequest(ChoreoRpcGetEnvsRequest, (params: GetProjectEnvsReq) => rpcClient.getEnvs(params));
	messenger.onRequest(ChoreoRpcGetEndpointsRequest, (params: GetComponentEndpointsReq) => rpcClient.getComponentEndpoints(params));
	messenger.onRequest(ChoreoRpcGetDeploymentStatusRequest, (params: GetDeploymentStatusReq) => rpcClient.getDeploymentStatus(params));
	messenger.onRequest(ChoreoRpcGetProxyDeploymentInfo, (params: GetProxyDeploymentInfoReq) => rpcClient.getProxyDeploymentInfo(params));
	messenger.onRequest(ChoreoRpcCreateDeploymentRequest, async (params: any) => {
		return window.withProgress(
			{ title: `Deploying component ${params.componentName} in ${params.envName} environment...`, location: ProgressLocation.Notification },
			() => rpcClient.createDeployment(params),
		);
	});
	messenger.onRequest(ChoreoRpcGetTestKeyRequest, (params: GetTestKeyReq) => rpcClient.getTestKey(params));
	messenger.onRequest(ChoreoRpcGetSwaggerRequest, (params:GetSwaggerSpecReq) => rpcClient.getSwaggerSpec(params));
	messenger.onRequest(ChoreoRpcGetMarketplaceItems, (params: GetMarketplaceListReq) => rpcClient.getMarketplaceItems(params));
	messenger.onRequest(ChoreoRpcGetMarketplaceItemIdl, (params: GetMarketplaceIdlReq) => rpcClient.getMarketplaceIdl(params));
	messenger.onRequest(ChoreoRpcGetConnections, (params: GetConnectionsReq) => rpcClient.getConnections(params));
	messenger.onRequest(ChoreoRpcGetConnectionItem, (params: GetConnectionItemReq) => rpcClient.getConnectionItem(params));
	messenger.onRequest(ChoreoRpcCreateComponentConnection, async (params: any) => {
		return window.withProgress({ title: `Creating connection ${params.name}...`, location: ProgressLocation.Notification }, () =>
			rpcClient.createComponentConnection(params),
		);
	});
	messenger.onRequest(ChoreoRpcDeleteConnection, async (params: { orgId: string; connectionId: string; componentPath: string; connectionName: string }) => {
		return window.withProgress({ title: `Deleting connection ${params.connectionName}...`, location: ProgressLocation.Notification }, () =>
			rpcClient.deleteConnection({
				orgId: params.orgId,
				connectionId: params.connectionId,
				componentPath: params.componentPath,
				connectionName: params.connectionName,
			}),
		);
	});
	messenger.onRequest(ChoreoRpcGetConnectionGuide, (params: GetConnectionGuideReq) => rpcClient.getConnectionGuide(params));
	messenger.onRequest(ChoreoRpcGetAutoBuildStatus, (params: GetAutoBuildStatusReq) => rpcClient.getAutoBuildStatus(params));
	messenger.onRequest(ChoreoRpcEnableAutoBuild, (params: ToggleAutoBuildReq) => rpcClient.enableAutoBuildOnCommit(params));
	messenger.onRequest(ChoreoRpcDisableAutoBuild, (params: ToggleAutoBuildReq) => rpcClient.disableAutoBuildOnCommit(params));
	messenger.onRequest(ChoreoRpcGetBuildLogs, (params: GetBuildLogsReq) => rpcClient.getBuildLogs(params));
	messenger.onRequest(ChoreoRpcGetBuildLogsForType, (params: GetBuildLogsForTypeReq) => rpcClient.getBuildLogsForType(params));
	messenger.onRequest(ChoreoRpcCheckWorkflowStatus, (params: CheckWorkflowStatusReq) => rpcClient.checkWorkflowStatus(params));
	messenger.onRequest(ChoreoRpcCancelWorkflowApproval, async (params: CancelApprovalReq) => {
			return window.withProgress({ title: "Cancelling approval request...", location: ProgressLocation.Notification }, () =>
				rpcClient.cancelApprovalRequest(params),
			);
		});
	
	messenger.onRequest(ChoreoRpcRequestPromoteApproval, async (params: RequestPromoteApprovalReq) => {
			return window.withProgress(
				{ title: `Requesting approval to promote to ${params.envName} environment...`, location: ProgressLocation.Notification },
				() => rpcClient.requestPromoteApproval(params),
			);
		});
	messenger.onRequest(ChoreoRpcPromoteProxyDeployment, async (params: PromoteProxyDeploymentReq) => {
		return window.withProgress({ title: "Promoting proxy deployment...", location: ProgressLocation.Notification }, () =>
			rpcClient.promoteProxyDeployment(params),
		);
	});
}
