/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import type {
	BuildKind,
	Buildpack,
	CommitHistory,
	ComponentDeployment,
	ComponentEP,
	ComponentKind,
	DeploymentTrack,
	Environment,
	GetTestKeyResp,
	Organization,
	Project,
} from "@wso2-enterprise/choreo-core";
import { ChoreoWebViewAPI } from "../utilities/vscode-webview-rpc";

export const queryKeys = {
	getDeploymentTracks: (component: ComponentKind, project: Project, org: Organization) => [
		"get-deployment-tracks",
		{ component: component.metadata.id, organization: org.handle, project: project.handler },
	],
	getProjectEnvs: (project: Project, org: Organization) => ["get-project-envs", { organization: org.handle, project: project.handler }],
	getTestKey: (selectedEndpoint: ComponentEP, env: Environment, org: Organization) => [
		"get-test-key",
		{ endpoint: selectedEndpoint.id, env: env.id, org: org.handle },
	],
	getSwaggerSpec: (selectedEndpoint: ComponentEP, org: Organization) => [
		"get-swagger-spec",
		{ selectedEndpoint: selectedEndpoint.id, org: org.handle },
	],
	getBuildPacks: (selectedType: string, org: Organization) => ["build-packs", { selectedType, orgId: org?.id }],
	getGitRemotes: (directoryFsPath: string, subPath: string) => ["get-git-remotes", { directoryFsPath, subPath }],
	getGitBranches: (repoUrl: string, org: Organization) => ["get-git-branches", { repo: repoUrl, orgId: org?.id }],
	getDeployedEndpoints: (deploymentTrack: DeploymentTrack, component: ComponentKind, org: Organization) => [
		"get-deployed-endpoints",
		{ organization: org.handle, component: component.metadata.id, deploymentTrackId: deploymentTrack?.id },
	],
	getDeploymentStatus: (deploymentTrack: DeploymentTrack, component: ComponentKind, org: Organization, env: Environment) => [
		"get-deployment-status",
		{
			organization: org.handle,
			component: component.metadata.id,
			deploymentTrackId: deploymentTrack?.id,
			envId: env.id,
		},
	],
	getBuilds: (deploymentTrack: DeploymentTrack, component: ComponentKind, project: Project, org: Organization) => [
		"get-builds",
		{
			component: component.metadata.id,
			organization: org.handle,
			project: project.handler,
			branch: deploymentTrack?.branch,
		},
	],
};

export const useGetDeploymentTracks = (component: ComponentKind, project: Project, org: Organization, options?: UseQueryOptions<DeploymentTrack[]>) =>
	useQuery<DeploymentTrack[]>(
		queryKeys.getDeploymentTracks(component, project, org),
		() =>
			ChoreoWebViewAPI.getInstance().getChoreoRpcClient().getDeploymentTracks({
				componentId: component.metadata.id,
				orgHandler: org.handle,
				orgId: org.id.toString(),
				projectId: project.id,
			}),
		options,
	);

export const useGetProjectEnvs = (project: Project, org: Organization, options?: UseQueryOptions<Environment[]>) =>
	useQuery<Environment[]>(
		queryKeys.getProjectEnvs(project, org),
		() =>
			ChoreoWebViewAPI.getInstance().getChoreoRpcClient().getEnvs({
				orgId: org.id.toString(),
				orgUuid: org.uuid,
				projectId: project.id,
			}),
		options,
	);

export const useGetTestKey = (selectedEndpoint: ComponentEP, env: Environment, org: Organization, options?: UseQueryOptions<GetTestKeyResp>) =>
	useQuery<GetTestKeyResp>(
		queryKeys.getTestKey(selectedEndpoint, env, org),
		() =>
			ChoreoWebViewAPI.getInstance().getChoreoRpcClient().getTestKey({
				apimId: selectedEndpoint.apimId,
				envName: env.name,
				orgId: org.id.toString(),
				orgUuid: org.uuid,
			}),
		options,
	);

export const useGetSwaggerSpec = (selectedEndpoint: ComponentEP, org: Organization, options?: UseQueryOptions<object>) =>
	useQuery<object>(
		queryKeys.getSwaggerSpec(selectedEndpoint, org),
		() =>
			ChoreoWebViewAPI.getInstance().getChoreoRpcClient().getSwaggerSpec({
				apimRevisionId: selectedEndpoint.apimRevisionId,
				orgId: org.id.toString(),
				orgUuid: org.uuid,
			}),
		options,
	);

export const useGetBuildPacks = (selectedType: string, org: Organization, options?: UseQueryOptions<Buildpack[]>) =>
	useQuery<Buildpack[]>(
		queryKeys.getBuildPacks(selectedType, org),
		() =>
			ChoreoWebViewAPI.getInstance().getChoreoRpcClient().getBuildPacks({
				componentType: selectedType,
				orgUuid: org.uuid,
				orgId: org.id.toString(),
			}),
		options,
	);

export const useGetGitRemotes = (directoryFsPath: string, subPath: string, options?: UseQueryOptions<string[]>) =>
	useQuery<string[]>(
		queryKeys.getGitRemotes(directoryFsPath, subPath),
		async () => {
			const joinedPath = await ChoreoWebViewAPI.getInstance().joinFilePaths([directoryFsPath, subPath]);
			return ChoreoWebViewAPI.getInstance().getGitRemotes(joinedPath);
		},
		options,
	);

export const useGetGitBranches = (repoUrl: string, org: Organization, options?: UseQueryOptions<string[]>) =>
	useQuery<string[]>(
		queryKeys.getGitBranches(repoUrl, org),
		() =>
			ChoreoWebViewAPI.getInstance().getChoreoRpcClient().getRepoBranches({
				repoUrl,
				orgId: org.id.toString(),
			}),
		options,
	);

export const useGetDeployedEndpoints = (
	deploymentTrack: DeploymentTrack,
	component: ComponentKind,
	org: Organization,
	options?: UseQueryOptions<ComponentEP[]>,
) =>
	useQuery<ComponentEP[]>(
		queryKeys.getDeployedEndpoints(deploymentTrack, component, org),
		() =>
			ChoreoWebViewAPI.getInstance().getChoreoRpcClient().getComponentEndpoints({
				orgId: org.id.toString(),
				orgHandler: org.handle,
				componentId: component.metadata.id,
				deploymentTrackId: deploymentTrack?.id,
			}),
		options,
	);

export const useGetDeploymentStatus = (
	deploymentTrack: DeploymentTrack,
	component: ComponentKind,
	org: Organization,
	env: Environment,
	options?: UseQueryOptions<ComponentDeployment>,
) =>
	useQuery<ComponentDeployment>(
		queryKeys.getDeploymentStatus(deploymentTrack, component, org, env),
		() =>
			ChoreoWebViewAPI.getInstance().getChoreoRpcClient().getDeploymentStatus({
				orgId: org.id.toString(),
				orgUuid: org.uuid,
				orgHandler: org.handle,
				componentId: component.metadata.id,
				deploymentTrackId: deploymentTrack?.id,
				envId: env.id,
			}),
		options,
	);

export const useGetBuildList = (
	deploymentTrack: DeploymentTrack,
	component: ComponentKind,
	project: Project,
	org: Organization,
	options?: UseQueryOptions<BuildKind[]>,
) =>
	useQuery<BuildKind[]>(
		queryKeys.getBuilds(deploymentTrack, component, project, org),
		() =>
			ChoreoWebViewAPI.getInstance().getChoreoRpcClient().getBuilds({
				componentName: component.metadata.name,
				deploymentTrackId: deploymentTrack?.id,
				projectHandle: project.handler,
				orgId: org.id?.toString(),
			}),
		options,
	);
