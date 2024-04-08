import { ChoreoBuildPackNames } from "./types";

export const CommandIds = {
    SignIn: "wso2.choreo.sign.in",
    SignInWithAuthCode: "wso2.choreo.sign.in.with.authCode",
    SignOut: "wso2.choreo.sign.out",
    AddComponent: "wso2.choreo.add.component",
    CreateNewComponent: "wso2.choreo.create.component",
    LinkExistingComponent: "wso2.choreo.link.component",
    RefreshComponent: "wso2.choreo.refresh.component",
    OpenWalkthrough:"wso2.choreo.getStarted"
};


export const WebAppSPATypes = [ChoreoBuildPackNames.React, ChoreoBuildPackNames.Vue, ChoreoBuildPackNames.Angular]
