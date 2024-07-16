import { ChoreoBuildPackNames } from "./types/common.types";

export const CommandIds = {
	SignIn: "wso2.choreo.sign.in",
	SignInWithAuthCode: "wso2.choreo.sign.in.with.authCode",
	SignOut: "wso2.choreo.sign.out",
	AddComponent: "wso2.choreo.add.component",
	CreateNewComponent: "wso2.choreo.create.component",
	DeleteComponent: "wso2.choreo.delete.component",
	OpenWalkthrough: "wso2.choreo.getStarted",
	OpenInConsole: "wso2.choreo.open.external",
	ViewComponent: "wso2.choreo.component.view",
	CloneProject: "wso2.choreo.project.clone",
	CreateDirectoryContext: "wso2.choreo.project.create.context",
	ManageDirectoryContext: "wso2.choreo.project.manage.context",
	RefreshDirectoryContext: "wso2.choreo.project.refresh",
	CreateProjectWorkspace: "wso2.choreo.project.create.workspace",
};

export const WebAppSPATypes = [ChoreoBuildPackNames.React, ChoreoBuildPackNames.Vue, ChoreoBuildPackNames.Angular];
