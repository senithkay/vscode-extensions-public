/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { type UseQueryOptions, useMutation, useQuery } from "@tanstack/react-query";
import type {
	ApiVersion,
	BuildKind,
	Buildpack,
	CommitHistory,
	ComponentDeployment,
	ComponentEP,
	ComponentKind,
	ConnectionListItem,
	DeploymentTrack,
	Environment,
	GetAutoBuildStatusResp,
	GetTestKeyResp,
	Organization,
	Project,
	ProxyDeploymentInfo,
} from "@wso2-enterprise/choreo-core";
import { ChoreoWebViewAPI } from "../utilities/vscode-webview-rpc";

export const queryKeys = {
	getHasLocalChanges: (directoryPath: string) => ["has-local-changes", { directoryPath }],
	getComponentConfigDraft: (directoryPath: string, component: ComponentKind) => [
		"has-config-drift",
		{ directoryPath, component: component?.metadata?.id },
	],
	getProjectEnvs: (project: Project, org: Organization) => ["get-project-envs", { organization: org.handle, project: project.handler }],
	getTestKey: (selectedEndpoint: ComponentEP, env: Environment, org: Organization) => [
		"get-test-key",
		{ endpoint: selectedEndpoint?.id, env: env.id, org: org.handle },
	],
	getSwaggerSpec: (selectedEndpoint: ComponentEP, org: Organization) => [
		"get-swagger-spec",
		{ selectedEndpoint: selectedEndpoint?.id, org: org.handle },
	],
	getBuildPacks: (selectedType: string, org: Organization) => ["build-packs", { selectedType, orgId: org?.id }],
	getGitBranches: (repoUrl: string, org: Organization) => ["get-git-branches", { repo: repoUrl, orgId: org?.id }],
	getDeployedEndpoints: (deploymentTrack: DeploymentTrack, component: ComponentKind, org: Organization) => [
		"get-deployed-endpoints",
		{ organization: org.handle, component: component.metadata.id, deploymentTrackId: deploymentTrack?.id },
	],
	getProxyDeploymentInfo: (component: ComponentKind, org: Organization, env: Environment, apiVersion: ApiVersion) => [
		"get-proxy-deployment-info",
		{ org: org.handle, component: component.metadata.id, env: env?.id, apiVersion: apiVersion?.id },
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
		{ component: component.metadata.id, organization: org.handle, project: project.handler, branch: deploymentTrack?.branch },
	],
	getComponentConnections: (component: ComponentKind, project: Project, org: Organization) => [
		"get-component-connections",
		{ component: component.metadata.id, organization: org.handle, project: project.handler },
	],
	getProjectConnections: (project: Project, org: Organization) => ["get-project-connections", { organization: org.handle, project: project.handler }],
	getAutoBuildStatus: (component: ComponentKind, deploymentTrack: DeploymentTrack, org: Organization) => [
		"get-auto-build-status",
		{ component: component.metadata.id, organization: org.handle, versionId: deploymentTrack?.id },
	],
};

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

export const useGetGitBranches = (repoUrl: string, org: Organization, options?: UseQueryOptions<string[]>) =>
	useQuery<string[]>(
		queryKeys.getGitBranches(repoUrl, org),
		async () => {
			try {
				const branches = await ChoreoWebViewAPI.getInstance().getChoreoRpcClient().getRepoBranches({
					repoUrl,
					orgId: org.id.toString(),
				});
				return branches ?? [];
			} catch {
				return [];
			}
		},
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
		async () => {
			try {
				const resp = await ChoreoWebViewAPI.getInstance().getChoreoRpcClient().getComponentEndpoints({
					orgId: org.id.toString(),
					orgHandler: org.handle,
					componentId: component.metadata.id,
					deploymentTrackId: deploymentTrack?.id,
				});
				return resp ?? [];
			} catch {
				return [];
			}
		},
		options,
	);

export const useGetProxyDeploymentInfo = (
	component: ComponentKind,
	org: Organization,
	env: Environment,
	apiVersion: ApiVersion,
	options?: UseQueryOptions<ProxyDeploymentInfo>,
) =>
	useQuery<ProxyDeploymentInfo>(
		queryKeys.getProxyDeploymentInfo(component, org, env, apiVersion),
		async () => {
			try {
				const resp = await ChoreoWebViewAPI.getInstance().getChoreoRpcClient().getProxyDeploymentInfo({
					orgId: org.id?.toString(),
					orgUuid: org.uuid,
					orgHandler: org.handle,
					componentId: component.metadata?.id,
					envId: env?.id,
					versionId: apiVersion?.id,
				});
				return resp || null;
			} catch {
				return null;
			}
		},
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
			ChoreoWebViewAPI.getInstance()
				.getChoreoRpcClient()
				.getBuilds({
					componentId: component.metadata.id,
					componentName: component.metadata.name,
					displayType: component.spec.type,
					branch: deploymentTrack?.branch,
					orgId: org.id?.toString(),
					apiVersionId: component?.apiVersions?.find((item) => item.latest)?.versionId,
				}),
		options,
	);

export const useComponentConnectionList = (
	component: ComponentKind,
	project: Project,
	org: Organization,
	options?: UseQueryOptions<ConnectionListItem[]>,
) =>
	useQuery<ConnectionListItem[]>(
		queryKeys.getComponentConnections(component, project, org),
		() =>
			ChoreoWebViewAPI.getInstance().getChoreoRpcClient().getConnections({
				componentId: component.metadata?.id,
				orgId: org.id.toString(),
				projectId: project.id,
			}),
		options,
	);

export const useProjectConnectionList = (project: Project, org: Organization, options?: UseQueryOptions<ConnectionListItem[]>) =>
	useQuery<ConnectionListItem[]>(
		queryKeys.getProjectConnections(project, org),
		() =>
			ChoreoWebViewAPI.getInstance().getChoreoRpcClient().getConnections({
				componentId: "",
				orgId: org.id.toString(),
				projectId: project.id,
			}),
		options,
	);

export const useGetAutoBuildStatus = (
	component: ComponentKind,
	deploymentTrack: DeploymentTrack,
	org: Organization,
	options?: UseQueryOptions<GetAutoBuildStatusResp>,
) =>
	useQuery<GetAutoBuildStatusResp>(
		queryKeys.getAutoBuildStatus(component, deploymentTrack, org),
		() =>
			ChoreoWebViewAPI.getInstance().getChoreoRpcClient().getAutoBuildStatus({
				componentId: component.metadata?.id,
				orgId: org.id.toString(),
				versionId: deploymentTrack?.id,
			}),
		options,
	);

export const useGoToSource = () => {
	const { mutate: openFile } = useMutation({
		mutationFn: async (paths: string[]) => {
			const filePath = await ChoreoWebViewAPI.getInstance().joinFilePaths(paths);
			const fileExists = await ChoreoWebViewAPI.getInstance().fileExist(filePath);
			if (fileExists) {
				return ChoreoWebViewAPI.getInstance().goToSource(filePath);
			}
			ChoreoWebViewAPI.getInstance().showErrorMsg("File does not not exist");
		},
		onError: () => {
			ChoreoWebViewAPI.getInstance().showErrorMsg("Failed to open file");
		},
	});
	return { openFile };
};

export const useCreateNewOpenApiFile = ({ onSuccess, compPath }: { compPath: string; onSuccess?: (subPath: string) => void }) => {
	const sampleOpenAPIContent = `openapi: 3.0.0
info:
  title: My API
  version: 1.0.0
paths:
  /example:
    get:
      summary: Retrieve an example resource
      responses:
        '200':
          description: Successful response
`;
	const { mutate: createNewOpenApiFile } = useMutation({
		mutationFn: async () => {
			return ChoreoWebViewAPI.getInstance().saveFile({
				baseDirectory: compPath,
				fileContent: sampleOpenAPIContent,
				shouldPromptDirSelect: true,
				fileName: "swagger.yaml",
				isOpenApiFile: true,
				successMessage: `A sample OpenAPI specification file has been created at ${compPath}`,
			});
		},
		onSuccess: async (createdPath) => {
			const subPath = await ChoreoWebViewAPI.getInstance().getSubPath({
				subPath: createdPath,
				parentPath: compPath,
			});
			if (onSuccess) {
				onSuccess(subPath);
			}
		},
		onError: () => ChoreoWebViewAPI.getInstance().showErrorMsg("Failed to create openapi file"),
	});
	return { createNewOpenApiFile };
};
