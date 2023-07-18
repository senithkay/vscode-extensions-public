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
import { ChoreoLoginStatus, Project, UserInfo } from "@wso2-enterprise/choreo-core";
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
}

const defaultContext: IChoreoWebViewContext = {
    loginStatus: "Initializing",
    loginStatusPending: true,
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
        refetchOnWindowFocus: false
    });

    const {
        data: loginStatus = "Initializing",
        error: loginStatusError,
        isLoading: loginStatusLoading,
    } = useQuery({
        queryKey: ["choreo_login_status"],
        queryFn: () => ChoreoWebViewAPI.getInstance().getLoginStatus(),
        refetchOnWindowFocus: false
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
        refetchOnWindowFocus: false
    });


    const {
        data: choreoProject,
        error: choreoProjectError,
        isLoading: choreoProjectLoading,
    } = useQuery({
        queryKey: ["choreo_project_details", loginStatus, isChoreoProject],
        queryFn: () => ChoreoWebViewAPI.getInstance().getChoreoProject(),
        enabled: loginStatus === "LoggedIn" && isChoreoProject,
        refetchOnWindowFocus: false
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
    }, []);

    const error = (isChoreoProjectError ||
        loginStatusError ||
        userInfoError ||
        choreoProjectError) as Error;

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
                loadingProject: isChoreoProjectLoading || (isChoreoProject === true && choreoProjectLoading),
            }}
        >
            {children}
        </ChoreoWebViewContext.Provider>
    );
};
