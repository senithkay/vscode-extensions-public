import React from "react";
import { ChoreoLoginStatus, Organization } from "../utilities/WebViewRpc";

export interface IChoreoWebViewContext {
    loginStatus: ChoreoLoginStatus;
    loginStatusPending: boolean;
    fetchingOrgInfo: boolean;
    selectedOrg?: Organization;
    userOrgs?: Organization[];
}

const defaultContext: IChoreoWebViewContext = {
    loginStatus: "Initializing",
    loginStatusPending: true,
    fetchingOrgInfo: true
}

export const ChoreoWebViewContext = React.createContext(defaultContext);