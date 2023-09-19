import React, { FC } from "react";
import { ChoreoLoginStatus, Organization, Project, UserInfo } from "@wso2-enterprise/choreo-core";
export interface IChoreoWebViewContext {
    loginStatus: ChoreoLoginStatus;
    loginStatusPending: boolean;
    userInfo: UserInfo;
    error?: Error;
    isChoreoProject?: boolean;
    choreoProject?: Project;
    loadingProject?: boolean;
    choreoUrl: string;
    currentProjectOrg?: Organization;
}
export declare const ChoreoWebViewContext: React.Context<IChoreoWebViewContext>;
export declare const useChoreoWebViewContext: () => IChoreoWebViewContext;
interface Props {
    choreoUrl?: string;
    ctxOrgId?: string;
}
export declare const ChoreoWebViewContextProvider: FC<Props>;
export {};
