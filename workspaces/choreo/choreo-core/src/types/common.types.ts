/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import type { ChoreoComponentType } from "../enums";

export interface Organization {
	id: number;
	uuid: string;
	handle: string;
	name: string;
	owner: { id: string; idpId: string; createdAt: Date };
}

export interface UserInfo {
	displayName: string;
	userEmail: string;
	userProfilePictureUrl: string;
	idpId: string;
	organizations: Organization[];
	userId: string;
	userCreatedAt: Date;
}

export interface ComponentKindBitbucketSource {
	repository: string;
	branch: string;
	path: string;
}

export interface ComponentKindGithubSource {
	repository: string;
	branch: string;
	path: string;
}

export interface ComponentKindSource {
	bitbucket?: ComponentKindBitbucketSource;
	github?: ComponentKindGithubSource;
}

export interface ComponentKindBuildDocker {
	dockerFilePath: string;
	dockerContextPath: string;
	port?: number;
}

export interface ComponentKindBuildBallerina {
	sampleTemplate: string;
	enableCellDiagram: boolean;
}

export interface ComponentKindBuildWebapp {
	buildCommand: string;
	nodeVersion: string;
	outputDir: string;
	type: string;
}

export interface ComponentKindBuildBuildpack {
	language: string;
	version: string;
	port?: number;
}

export interface ComponentKindSpecBuild {
	docker?: ComponentKindBuildDocker;
	ballerina?: ComponentKindBuildBallerina;
	webapp?: ComponentKindBuildWebapp;
	buildpack?: ComponentKindBuildBuildpack;
}

export interface ComponentKindMetadata {
	name: string;
	displayName: string;
	projectName: string;
	id: string;
	handler: string;
}

export interface ComponentKindSpec {
	type: string;
	source: ComponentKindSource;
	build: ComponentKindSpecBuild;
}

export interface ComponentKind {
	apiVersion: string;
	kind: string;
	metadata: ComponentKindMetadata;
	spec: ComponentKindSpec;
}

export interface Project {
	createdData: string;
	handler: string;
	id: string;
	name: string;
	orgId: string;
	region: string;
	version: string;
	description: string;
	repository?: string;
	credentialId?: string;
	branch?: string;
	gitOrganization?: string;
	gitProvider?: string;
}

export interface Buildpack {
	id: string;
	buildpackImage: string;
	language: string;
	supportedVersions: string;
	displayName: string;
	isDefault: true;
	versionEnvVariable: string;
	iconUrl: string;
	provider: string;
	builder: { id: string; builderImage: string; displayName: string; imageHash: string };
	componentTypes: { id: string; displayName: string; type: string }[];
}

export interface BuildKind {
	apiVersion: string;
	kind: string;
	metadata: {
		name: string;
		componentName: string;
		projectName: string;
	};
	spec: { revision: string };
	status: {
		runId: number;
		conclusion: string;
		status: string;
		startedAt: string;
		completedAt: string;
		images: { id: string; createdAt: string; updatedAt: string }[];
		gitCommit: { message: string; author: string; date: string; email: string };
	};
}

export interface DeploymentTrack {
	id: string;
	createdAt: string;
	updatedAt: string;
	apiVersion: string;
	branch: string;
	description: string;
	componentId: string;
	latest: boolean;
	versionStrategy: string;
}

export interface CommitHistory {
	message: string;
	sha: string;
	isLatest: boolean;
}

export enum ChoreoBuildPackNames {
	Ballerina = "ballerina",
	Docker = "docker",
	React = "react",
	Angular = "angular",
	Vue = "vuejs",
	StaticFiles = "staticweb",
	MicroIntegrator = "microintegrator",
}

export interface WebviewQuickPickItem {
	kind?: WebviewQuickPickItemKind;
	/**  A human-readable string which is rendered prominent. */
	label: string;
	/** A human-readable string which is rendered less prominent in the same line. */
	description?: string;
	/** A human-readable string which is rendered less prominent in a separate line */
	detail?: string;
	/** Always show this item. */
	alwaysShow?: boolean;
	/** Optional flag indicating if this item is picked initially.  */
	picked?: boolean;
	/** Any data to be passed */
	// biome-ignore lint/suspicious/noExplicitAny: can be any type of data
	item?: any;
}

export enum WebviewQuickPickItemKind {
	Separator = -1,
	Default = 0,
}

export interface Environment {
	id: string;
	name: string;
	organizationUuid: string;
	projectId?: string;
	description: string;
	promoteFrom?: string[];
	orgShared?: boolean;
	choreoEnv: string;
	critical: boolean;
	apiEnvName: string;
	internalApiEnvName: string;
	externalApiEnvName: string;
	sandboxApiEnvName: string;
	namespace: string;
	vhost?: string;
	sandboxVhost?: string;
	apimSandboxEnvId?: string;
	apimEnvId?: string;
	isMigrating: boolean;
}

export interface ComponentEP {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	releaseId: string;
	environmentId: string;
	displayName: string;
	port: number;
	type: string;
	apiContext: string;
	apiDefinitionPath: string;
	invokeUrl: string;
	visibility: string;
	hostName: string;
	isAutoGenerated: boolean;
	apimId: string;
	apimRevisionId: string;
	apimName: string;
	projectUrl: string;
	organizationUrl: string;
	publicUrl: string;
	state: string;
	stateReason: StateReason;
	isDeleted: boolean;
	deletedAt: Date;
}

export interface ComponentDeployment {
	environmentId: string;
	configCount: number;
	apiId: string;
	releaseId: string;
	apiRevision: string;
	build: {
		buildId: string;
		deployedAt: string;
		commit: {
			author: { name: string; date: string; email: string; avatarUrl: string };
			sha: string;
			message: string;
			isLatest: boolean;
		};
	};
	imageUrl: string;
	invokeUrl: string;
	versionId: string;
	deploymentStatus: string;
	deploymentStatusV2: string;
	version: string;
	cron: string;
	cronTimezone: string;
}

export interface IComponentCreateInitValues {
	type: ChoreoComponentType;
	buildPackLang: string;
	/** Full path of the component directory */
	componentDir: string;
}

export interface ICreateComponentParams {
	initialValues?: IComponentCreateInitValues;
}

export interface GHAppConfig {
	installUrl: string;
	authUrl: string;
	clientId: string;
	redirectUrl: string;
}

export interface StateReason {
	code: string;
	message: string;
	details: string;
	workerId: string;
}

export interface WorkspaceConfig {
	folders: { name: string; path: string }[];
}
