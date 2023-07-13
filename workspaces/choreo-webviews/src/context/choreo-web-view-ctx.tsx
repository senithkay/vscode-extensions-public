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
import React, { FC, useContext, useEffect } from "react";
import { ChoreoLoginStatus, Organization, Project, UserInfo } from "@wso2-enterprise/choreo-core";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";

export interface IChoreoWebViewContext {
    loginStatus: ChoreoLoginStatus;
    loginStatusPending: boolean;
    userInfo: UserInfo;
    fetchingOrgInfo: boolean;
    selectedOrg?: Organization;
    userOrgs?: Organization[];
    error?: Error;
    isChoreoProject?: boolean;
    choreoProject?: Project;
    loadingProject?: boolean;
    choreoUrl: string;
}

const defaultContext: IChoreoWebViewContext = {
    loginStatus: "Initializing",
    loginStatusPending: true,
    fetchingOrgInfo: true,
    userInfo: undefined,
    choreoUrl: "",
};

export const ChoreoWebViewContext = React.createContext(defaultContext);

export const useChoreoWebViewContext = () => {
    return useContext(ChoreoWebViewContext);
};

export const ChoreoWebViewContextProvider: FC<{ choreoUrl?: string }> = ({ children, choreoUrl }) => {
    const queryClient = useQueryClient();

    const {
        data: isChoreoProject = false,
        error: isChoreoProjectError,
        isLoading: isChoreoProjectLoading,
    } = useQuery({
        queryKey: ["is_choreo_project"],
        queryFn: () => ChoreoWebViewAPI.getInstance().isChoreoProject(),
    });

    const {
        data: loginStatus = "Initializing",
        error: loginStatusError,
        isLoading: loginStatusLoading,
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
    });

    const {
        data: selectedOrg,
        error: selectedOrgError,
        isLoading: selectedOrgLoading,
    } = useQuery({
        queryKey: ["choreo_selected_org", loginStatus],
        queryFn: () => ChoreoWebViewAPI.getInstance().getCurrentOrg(),
        enabled: loginStatus === "LoggedIn",
    });

    const {
        data: choreoProject,
        error: choreoProjectError,
        isLoading: choreoProjectLoading,
    } = useQuery({
        queryKey: ["choreo_project_details", loginStatus, isChoreoProject, selectedOrg],
        queryFn: () => ChoreoWebViewAPI.getInstance().getChoreoProject(),
        enabled: loginStatus === "LoggedIn" && isChoreoProject,
    });

    const { data: userOrgs, error: allOrgError } = useQuery({
        queryKey: ["choreo_all_user_orgs", loginStatus],
        queryFn: () => ChoreoWebViewAPI.getInstance().getAllOrgs(),
        enabled: loginStatus === "LoggedIn",
    });

    useEffect(() => {
        const rpcInstance = ChoreoWebViewAPI.getInstance();
        rpcInstance.onLoginStatusChanged(async (newLoginStatus) => {
            console.log("Login status changed" + JSON.stringify(newLoginStatus));
            queryClient.setQueryData(["choreo_login_status"], newLoginStatus);
            if (newLoginStatus === "LoggedIn") {
                refetchUserInfo();
            }
        });
        rpcInstance.onSelectedOrgChanged((newOrg) => {
            console.log("Selected org changed" + JSON.stringify(newOrg));
            queryClient.setQueryData(["choreo_selected_org", true], newOrg);
        });
    }, []);

    const error = (isChoreoProjectError ||
        loginStatusError ||
        userInfoError ||
        choreoProjectError ||
        selectedOrgError ||
        allOrgError) as Error;

    return (
        <ChoreoWebViewContext.Provider
            value={{
                loginStatus,
                userInfo,
                choreoProject,
                isChoreoProject,
                selectedOrg,
                userOrgs,
                error,
                choreoUrl,
                loginStatusPending: loginStatusLoading || userInfoLoading,
                fetchingOrgInfo: selectedOrgLoading,
                loadingProject: isChoreoProjectLoading || choreoProjectLoading,
            }}
        >
            {children}
        </ChoreoWebViewContext.Provider>
    );
};
