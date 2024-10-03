/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

export enum ComponentDisplayType {
	RestApi = "restAPI",
	ManualTrigger = "manualTrigger",
	ScheduledTask = "scheduledTask",
	Webhook = "webhook",
	Websocket = "webSocket",
	Proxy = "proxy",
	ByocCronjob = "byocCronjob",
	ByocJob = "byocJob",
	GraphQL = "graphql",
	ThirdPartyAPI = "thirdPartyAPI",
	ByocWebApp = "byocWebApp",
	ByocWebAppDockerLess = "byocWebAppsDockerfileLess",
	ByocRestApi = "byocRestApi",
	ByocEventHandler = "byocEventHandler",
	MiRestApi = "miRestApi",
	MiEventHandler = "miEventHandler",
	Service = "ballerinaService",
	ByocService = "byocService",
	ByocWebhook = "byocWebhook",
	MiApiService = "miApiService",
	MiCronjob = "miCronjob",
	MiJob = "miJob",
	MiWebhook = "miWebhook",
	ByoiService = "byoiService",
	ByoiJob = "byoiJob",
	ByoiCronjob = "byoiCronjob",
	ByoiWebApp = "byoiWebApp",
	ByocTestRunner = "byocTestRunner",
	BuildpackService = "buildpackService",
	BuildpackEventHandler = "buildpackEventHandler",
	BuildpackJob = "buildpackJob",
	BuildpackTestRunner = "buildpackTestRunner",
	BuildpackCronJob = "buildpackCronjob",
	BuildpackWebApp = "buildpackWebApp",
	BuildpackWebhook = "buildpackWebhook",
	BuildpackRestApi = "buildpackRestApi",
	BuildRestApi = "buildpackRestApi",
	PostmanTestRunner = "byocTestRunnerDockerfileLess",
	BallerinaEventHandler = "ballerinaEventHandler",
	BallerinaService = "ballerinaService",
	BallerinaWebhook = "ballerinaWebhook",
}

export enum DeploymentStatus {
	NotDeployed = "NOT_DEPLOYED",
	Active = "ACTIVE",
	Suspended = "SUSPENDED",
	Error = "ERROR",
	InProgress = "IN_PROGRESS",
}

export enum GitProvider {
	GITHUB = "github",
	BITBUCKET = "bitbucket",
}

export enum GoogleProviderBuildPackNames {
	JAVA = "java",
	NODEJS = "nodejs",
	PYTHON = "python",
	GO = "go",
	RUBY = "ruby",
	PHP = "php",
	DOTNET = "dotnet",
}

export enum ChoreoImplementationType {
	Ballerina = "ballerina",
	Docker = "docker",
	React = "react",
	Angular = "angular",
	Vue = "vuejs",
	StaticFiles = "staticweb",
	Java = "java",
	Python = "python",
	NodeJS = "nodejs",
	Go = "go",
	PHP = "php",
	Ruby = "ruby",
	MicroIntegrator = "microintegrator",
}

export enum ChoreoComponentType {
	Service = "service",
	ScheduledTask = "scheduleTask",
	ManualTrigger = "manualTask",
	Webhook = "webhook",
	WebApplication = "webApp",
	EventHandler = "eventHandler",
	TestRunner = "testRunner",
	ApiProxy = "proxy",
}
