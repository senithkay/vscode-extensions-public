/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import type { ComponentEP, ComponentKind, DeploymentTrack, Environment, Organization, Project } from "./common.types";

export type WebviewTypes = "NewComponentForm" | "ComponentsListActivityView" | "ComponentDetailsView" | "TestView" | "ChoreoCellView";

export interface TestWebviewProps {
	type: "TestView";
	component: ComponentKind;
	project: Project;
	org: Organization;
	env: Environment;
	deploymentTrack: DeploymentTrack;
	endpoints: ComponentEP[];
}

export interface NewComponentWebviewProps {
	type: "NewComponentForm";
	directoryPath: string;
	directoryFsPath: string;
	directoryName: string;
	organization: Organization;
	project: Project;
	existingComponents: ComponentKind[];
	initialValues?: { type?: string; buildPackLang?: string; subPath?: string };
}

export interface ComponentsDetailsWebviewProps {
	type: "ComponentDetailsView";
	organization: Organization;
	project: Project;
	component: ComponentKind;
	directoryPath?: string;
}

export interface ComponentsListActivityViewProps {
	type: "ComponentsListActivityView";
	directoryPath?: string;
}

export type WebviewProps = ComponentsDetailsWebviewProps | NewComponentWebviewProps | ComponentsListActivityViewProps | TestWebviewProps;
