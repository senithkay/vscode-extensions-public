/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ChoreoBuildPackNames } from "./types/common.types";

export const CommandIds = {
	FocusChoreoProjectActivity: "platform.activity.project.focus",
	SignIn: "wso2.platform.sign.in",
	SignInWithAuthCode: "wso2.platform.sign.in.with.authCode",
	SignOut: "wso2.platform.sign.out",
	AddComponent: "wso2.platform.add.component",
	CreateNewComponent: "wso2.platform.create.component",
	DeleteComponent: "wso2.platform.delete.component",
	OpenWalkthrough: "wso2.platform.getStarted",
	OpenInConsole: "wso2.platform.open.external",
	ViewComponent: "wso2.platform.component.view",
	CloneProject: "wso2.platform.project.clone",
	CreateDirectoryContext: "wso2.platform.project.create.context",
	ManageDirectoryContext: "wso2.platform.project.manage.context",
	RefreshDirectoryContext: "wso2.platform.project.refresh",
	CreateProjectWorkspace: "wso2.platform.project.create.workspace",
	CreateComponentDependency: "wso2.platform.component.create.dependency",
	ViewDependency: "wso2.platform.component.view.dependency",
	// TODO: add command & code lens to delete dependency
};

export const WebAppSPATypes = [ChoreoBuildPackNames.React, ChoreoBuildPackNames.Vue, ChoreoBuildPackNames.Angular];
