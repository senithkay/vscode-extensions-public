import { ChoreoBuildPackNames } from "./types";

export const CommandIds = {
    SignIn: "wso2.choreo.sign.in",
    SignInWithAuthCode: "wso2.choreo.sign.in.with.authCode",
    SignOut: "wso2.choreo.sign.out",
    AddComponent: "wso2.choreo.add.component",
    CreateNewComponent: "wso2.choreo.create.component",
    DeleteComponent: "wso2.choreo.delete.component",
    OpenWalkthrough:"wso2.choreo.getStarted",
    OpenComponentInConsole: "wso2.choreo.component.open.external",
    ViewComponent:"wso2.choreo.component.view",
    CloneProject:"wso2.choreo.project.clone",
    SetDirectoryContext: "wso2.choreo.project.context.create",
    SwitchDirectoryContext: "wso2.choreo.project.context.switch",
    RefreshDirectoryContext: "wso2.choreo.project.context.refresh",
};


export const WebAppSPATypes = [ChoreoBuildPackNames.React, ChoreoBuildPackNames.Vue, ChoreoBuildPackNames.Angular]
