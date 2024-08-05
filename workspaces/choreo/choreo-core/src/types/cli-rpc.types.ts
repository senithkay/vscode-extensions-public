/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { HOST_EXTENSION, type RequestType } from "vscode-messenger-common";
import type { Messenger } from "vscode-messenger-webview";
import type {
	BuildKind,
	Buildpack,
	CommitHistory,
	ComponentDeployment,
	ComponentEP,
	ComponentKind,
	DeploymentTrack,
	Environment,
	Project,
} from "./common.types";
import type { InboundConfig } from "./config-file.types";

export interface BuildPackReq {
	orgId: string;
	orgUuid: string;
	componentType: string;
}
export interface GetBranchesReq {
	orgId: string;
	repoUrl: string;
}
export interface IsRepoAuthorizedReq {
	orgId: string;
	repoUrl: string;
}
export interface GetComponentItemReq {
	orgId: string;
	projectHandle: string;
	componentName: string;
}
export interface GetComponentsReq {
	orgId: string;
	projectHandle: string;
}
export interface CreateProjectReq {
	orgId: string;
	orgHandler: string;
	projectName: string;
	region: string;
}
export interface DeleteCompReq {
	orgId: string;
	orgHandler: string;
	projectId: string;
	componentId: string;
	componentName: string;
}
export interface CreateComponentReq {
	orgId: string;
	projectHandle: string;
	name: string;
	displayName: string;
	type: string;
	buildPackLang: string;
	componentDir: string;
	repoUrl: string;
	branch: string;
	langVersion: string;
	dockerFile: string;
	port: number;
	spaBuildCommand: string;
	spaNodeVersion: string;
	spaOutputDir: string;
}
export interface CreateConfigYamlReq {
	componentDir: string;
	type: string;
	inbound?: InboundConfig;
}
export interface GetBuildsReq {
	orgId: string;
	componentName: string;
	projectHandle: string;
	deploymentTrackId: string;
}
export interface CreateBuildReq {
	orgId: string;
	componentName: string;
	displayType: string;
	projectHandle: string;
	deploymentTrackId: string;
	commitHash: string;
	gitRepoUrl: string;
	gitBranch: string;
	subPath: string;
}

export interface GetDeploymentTracksReq {
	orgId: string;
	orgHandler: string;
	projectId: string;
	componentId: string;
}
export interface GetCommitsReq {
	orgId: string;
	orgHandler: string;
	componentId: string;
	branch: string;
}
export interface GetProjectEnvsReq {
	orgId: string;
	orgUuid: string;
	projectId: string;
}
export interface GetComponentEndpointsReq {
	orgId: string;
	orgHandler: string;
	componentId: string;
	deploymentTrackId: string;
}
export interface GetDeploymentStatusReq {
	orgId: string;
	orgHandler: string;
	orgUuid: string;
	componentId: string;
	deploymentTrackId: string;
	envId: string;
}
export interface CreateDeploymentReq {
	orgId: string;
	orgHandler: string;
	componentName: string;
	componentId: string;
	componentDisplayType: string;
	projectHandle: string;
	projectId: string;
	deploymentTrackId: string;
	commitHash: string;
	envName: string;
	envId: string;
	buildRef: string;
	cronExpression?: string;
	cronTimezone?: string;
}
export interface GetTestKeyReq {
	apimId: string;
	orgUuid: string;
	orgId: string;
	envName: string;
}
export interface GetSwaggerSpecReq {
	apimRevisionId: string;
	orgUuid: string;
	orgId: string;
}

export interface IsRepoAuthorizedResp {
	retrievedRepos: boolean;
	isAccessible: boolean;
}
export interface GetTestKeyResp {
	apiKey: string;
	validityTime: number;
}

export interface IChoreoRPCClient {
	getProjects(orgID: string): Promise<Project[]>;
	getComponentItem(params: GetComponentItemReq): Promise<ComponentKind>;
	getComponentList(params: GetComponentsReq): Promise<ComponentKind[]>;
	createProject(params: CreateProjectReq): Promise<Project>;
	createComponent(params: CreateComponentReq): Promise<ComponentKind>;
	getBuildPacks(params: BuildPackReq): Promise<Buildpack[]>;
	getRepoBranches(params: GetBranchesReq): Promise<string[]>;
	isRepoAuthorized(params: IsRepoAuthorizedReq): Promise<IsRepoAuthorizedResp>;
	deleteComponent(params: DeleteCompReq): Promise<void>;
	getBuilds(params: GetBuildsReq): Promise<BuildKind[]>;
	createBuild(params: CreateBuildReq): Promise<BuildKind>;
	getDeploymentTracks(params: GetDeploymentTracksReq): Promise<DeploymentTrack[]>;
	getCommits(params: GetCommitsReq): Promise<CommitHistory[]>;
	getEnvs(params: GetProjectEnvsReq): Promise<Environment[]>;
	getComponentEndpoints(params: GetComponentEndpointsReq): Promise<ComponentEP[]>;
	getDeploymentStatus(params: GetDeploymentStatusReq): Promise<ComponentDeployment | null>;
	createDeployment(params: CreateDeploymentReq): Promise<void>;
	getTestKey(params: GetTestKeyReq): Promise<GetTestKeyResp>;
	getSwaggerSpec(params: GetSwaggerSpecReq): Promise<object>;
}

export class ChoreoRpcWebview implements IChoreoRPCClient {
	constructor(private _messenger: Messenger) {}

	getProjects(orgID: string): Promise<Project[]> {
		return this._messenger.sendRequest(ChoreoRpcGetProjectsRequest, HOST_EXTENSION, orgID);
	}
	getComponentItem(params: GetComponentItemReq): Promise<ComponentKind> {
		return this._messenger.sendRequest(ChoreoRpcGetComponentItemRequest, HOST_EXTENSION, params);
	}
	getComponentList(params: GetComponentsReq): Promise<ComponentKind[]> {
		return this._messenger.sendRequest(ChoreoRpcGetComponentsRequest, HOST_EXTENSION, params);
	}
	createProject(params: CreateProjectReq): Promise<Project> {
		return this._messenger.sendRequest(ChoreoRpcCreateProjectRequest, HOST_EXTENSION, params);
	}
	createComponent(params: CreateComponentReq): Promise<ComponentKind> {
		return this._messenger.sendRequest(ChoreoRpcCreateComponentRequest, HOST_EXTENSION, params);
	}
	getBuildPacks(params: BuildPackReq): Promise<Buildpack[]> {
		return this._messenger.sendRequest(ChoreoRpcGetBuildPacksRequest, HOST_EXTENSION, params);
	}
	getRepoBranches(params: GetBranchesReq): Promise<string[]> {
		return this._messenger.sendRequest(ChoreoRpcGetBranchesRequest, HOST_EXTENSION, params);
	}
	isRepoAuthorized(params: IsRepoAuthorizedReq): Promise<IsRepoAuthorizedResp> {
		return this._messenger.sendRequest(ChoreoRpcIsRepoAuthorizedRequest, HOST_EXTENSION, params);
	}
	deleteComponent(params: DeleteCompReq): Promise<void> {
		return this._messenger.sendRequest(ChoreoRpcDeleteComponentRequest, HOST_EXTENSION, params);
	}
	getBuilds(params: GetBuildsReq): Promise<BuildKind[]> {
		return this._messenger.sendRequest(ChoreoRpcGetBuildsRequest, HOST_EXTENSION, params);
	}
	createBuild(params: CreateBuildReq): Promise<BuildKind> {
		return this._messenger.sendRequest(ChoreoRpcCreateBuildRequest, HOST_EXTENSION, params);
	}
	getDeploymentTracks(params: GetDeploymentTracksReq): Promise<DeploymentTrack[]> {
		return this._messenger.sendRequest(ChoreoRpcGetDeploymentTracksRequest, HOST_EXTENSION, params);
	}
	getCommits(params: GetCommitsReq): Promise<CommitHistory[]> {
		return this._messenger.sendRequest(ChoreoRpcGetCommitsRequest, HOST_EXTENSION, params);
	}
	getEnvs(params: GetProjectEnvsReq): Promise<Environment[]> {
		return this._messenger.sendRequest(ChoreoRpcGetEnvsRequest, HOST_EXTENSION, params);
	}
	getComponentEndpoints(params: GetComponentEndpointsReq): Promise<ComponentEP[]> {
		return this._messenger.sendRequest(ChoreoRpcGetEndpointsRequest, HOST_EXTENSION, params);
	}
	getDeploymentStatus(params: GetDeploymentStatusReq): Promise<ComponentDeployment | null> {
		return this._messenger.sendRequest(ChoreoRpcGetDeploymentStatusRequest, HOST_EXTENSION, params);
	}
	createDeployment(params: CreateDeploymentReq): Promise<void> {
		return this._messenger.sendRequest(ChoreoRpcCreateDeploymentRequest, HOST_EXTENSION, params);
	}
	getTestKey(params: GetTestKeyReq): Promise<GetTestKeyResp> {
		return this._messenger.sendRequest(ChoreoRpcGetTestKeyRequest, HOST_EXTENSION, params);
	}
	getSwaggerSpec(params: GetSwaggerSpecReq): Promise<object> {
		return this._messenger.sendRequest(ChoreoRpcGetSwaggerRequest, HOST_EXTENSION, params);
	}
}

export const ChoreoRpcGetProjectsRequest: RequestType<string, Project[]> = { method: "rpc/project/getProjects" };
export const ChoreoRpcGetComponentsRequest: RequestType<GetComponentsReq, ComponentKind[]> = { method: "rpc/component/getList" };
export const ChoreoRpcGetComponentItemRequest: RequestType<GetComponentItemReq, ComponentKind> = { method: "rpc/component/getItem" };
export const ChoreoRpcCreateProjectRequest: RequestType<CreateProjectReq, Project> = { method: "rpc/project/create" };
export const ChoreoRpcCreateComponentRequest: RequestType<CreateComponentReq, ComponentKind> = { method: "rpc/component/create" };
export const ChoreoRpcGetBuildPacksRequest: RequestType<BuildPackReq, Buildpack[]> = { method: "rpc/component/getBuildPacks" };
export const ChoreoRpcGetBranchesRequest: RequestType<GetBranchesReq, string[]> = { method: "rpc/repo/getBranches" };
export const ChoreoRpcIsRepoAuthorizedRequest: RequestType<IsRepoAuthorizedReq, IsRepoAuthorizedResp> = { method: "rpc/repo/isRepoAuthorized" };
export const ChoreoRpcDeleteComponentRequest: RequestType<DeleteCompReq, void> = { method: "rpc/component/delete" };
export const ChoreoRpcCreateBuildRequest: RequestType<CreateBuildReq, BuildKind> = { method: "rpc/build/create" };
export const ChoreoRpcGetDeploymentTracksRequest: RequestType<GetDeploymentTracksReq, DeploymentTrack[]> = {
	method: "rpc/component/getDeploymentTracks",
};
export const ChoreoRpcGetBuildsRequest: RequestType<GetBuildsReq, BuildKind[]> = { method: "rpc/build/getList" };
export const ChoreoRpcGetCommitsRequest: RequestType<GetCommitsReq, CommitHistory[]> = { method: "rpc/component/getCommits" };
export const ChoreoRpcGetEnvsRequest: RequestType<GetProjectEnvsReq, Environment[]> = { method: "rpc/project/getEnvs" };
export const ChoreoRpcGetEndpointsRequest: RequestType<GetComponentEndpointsReq, ComponentEP[]> = { method: "rpc/component/getEndpoints" };
export const ChoreoRpcGetDeploymentStatusRequest: RequestType<GetDeploymentStatusReq, ComponentDeployment | null> = {
	method: "rpc/component/getDeploymentStatus",
};
export const ChoreoRpcCreateDeploymentRequest: RequestType<CreateDeploymentReq, void> = { method: "rpc/deployment/create" };
export const ChoreoRpcGetTestKeyRequest: RequestType<GetTestKeyReq, GetTestKeyResp> = { method: "rpc/apim/getTestKey" };
export const ChoreoRpcGetSwaggerRequest: RequestType<GetSwaggerSpecReq, object> = { method: "rpc/apim/getSwaggerSpec" };
