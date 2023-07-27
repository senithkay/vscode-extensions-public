/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */
import React, { FC, useContext, useEffect, useMemo } from "react";
import { ChoreoLoginStatus, Organization, Project, UserInfo } from "@wso2-enterprise/choreo-core";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";

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
    isBalExtInstalled?: boolean;
}

const defaultContext: IChoreoWebViewContext = {
    loginStatus: "Initializing",
    loginStatusPending: true,
    userInfo: undefined,
    choreoUrl: "",
    isBalExtInstalled: false,
};

export const ChoreoWebViewContext = React.createContext(defaultContext);

export const useChoreoWebViewContext = () => {
    return useContext(ChoreoWebViewContext);
};

interface Props {
    choreoUrl?: string;
    ctxOrgId?: string;
}

export const ChoreoWebViewContextProvider: FC<Props> = ({ children, choreoUrl, ctxOrgId }) => {
    const queryClient = useQueryClient();

    const { data: isBalExtInstalled } = useQuery({
        queryKey: ["is_bal_installed"],
        queryFn: () => ChoreoWebViewAPI.getInstance().isBallerinaExtInstalled(),
        refetchOnWindowFocus: false,
    });

    const {
        data: workspaceMetaData = {},
        error: getChoreoWorkspaceError,
        isLoading: getChoreoWorkspaceLoading,
        isFetched: fetchedWorkspaceMetaData,
    } = useQuery({
        queryKey: ["choreo_workspace_metadata"],
        queryFn: () => ChoreoWebViewAPI.getInstance().getChoreoWorkspaceMetadata(),
        refetchOnWindowFocus: false,
    });

    const isChoreoProject = workspaceMetaData?.projectID !== undefined;

    const {
        data: loginStatus = "Initializing",
        error: loginStatusError,
        isLoading: loginStatusLoading,
        isFetched: fetchedLoginStatus,
    } = useQuery({
        queryKey: ["choreo_login_status"],
        queryFn: () => ChoreoWebViewAPI.getInstance().getLoginStatus(),
    });

    const {
        data: userInfo,
        refetch: refetchUserInfo,
        error: userInfoError,
        isLoading: userInfoLoading,
    } = useQuery({
        queryKey: ["choreo_user_info", loginStatus],
        queryFn: () => ChoreoWebViewAPI.getInstance().getUserInfo(),
        enabled: loginStatus === "LoggedIn",
        refetchOnWindowFocus: false,
    });

    const {
        data: choreoProject,
        error: choreoProjectError,
        isLoading: choreoProjectLoading,
    } = useQuery({
        queryKey: [
            "choreo_project_details",
            loginStatus,
            isChoreoProject,
            workspaceMetaData?.projectID,
            userInfo?.userId,
            fetchedWorkspaceMetaData,
            fetchedLoginStatus,
        ],
        queryFn: () => ChoreoWebViewAPI.getInstance().getChoreoProject(),
        enabled: loginStatus === "LoggedIn" && isChoreoProject && fetchedWorkspaceMetaData && fetchedLoginStatus,
        refetchOnWindowFocus: false,
    });

    const currentProjectOrg = useMemo(() => {
        if (userInfo) {
            if (ctxOrgId) {
                return userInfo?.organizations.find((org) => org.id.toString() === ctxOrgId?.toString());
            }
            if (choreoProject) {
                return userInfo?.organizations.find((org) => org.id.toString() === choreoProject?.orgId?.toString());
            }
        }
    }, [userInfo, choreoProject, ctxOrgId]);

    useEffect(() => {
        const rpcInstance = ChoreoWebViewAPI.getInstance();
        rpcInstance.onLoginStatusChanged(async (newLoginStatus) => {
            console.log("Login status changed" + JSON.stringify(newLoginStatus));
            queryClient.setQueryData(["choreo_login_status"], newLoginStatus);
            if (newLoginStatus === "LoggedIn") {
                refetchUserInfo();
            }
        });
    }, []);

    const error = (getChoreoWorkspaceError || loginStatusError || userInfoError || choreoProjectError) as Error;

    return (
        <ChoreoWebViewContext.Provider
            value={{
                loginStatus,
                userInfo,
                choreoProject,
                isChoreoProject,
                error,
                choreoUrl,
                loginStatusPending: loginStatusLoading || userInfoLoading,
                loadingProject: getChoreoWorkspaceLoading || (isChoreoProject === true && choreoProjectLoading),
                currentProjectOrg,
                isBalExtInstalled,
            }}
        >
            {children}
        </ChoreoWebViewContext.Provider>
    );
};
