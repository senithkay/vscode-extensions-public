var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
import React, { useContext, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
const defaultContext = {
    loginStatus: "Initializing",
    loginStatusPending: true,
    userInfo: undefined,
    choreoUrl: "",
};
export const ChoreoWebViewContext = React.createContext(defaultContext);
export const useChoreoWebViewContext = () => {
    return useContext(ChoreoWebViewContext);
};
export const ChoreoWebViewContextProvider = ({ children, choreoUrl, ctxOrgId }) => {
    const queryClient = useQueryClient();
    const { data: workspaceMetaData = {}, error: getChoreoWorkspaceError, isLoading: getChoreoWorkspaceLoading, isFetched: fetchedWorkspaceMetaData, } = useQuery({
        queryKey: ["choreo_workspace_metadata"],
        queryFn: () => ChoreoWebViewAPI.getInstance().getChoreoWorkspaceMetadata(),
        refetchOnWindowFocus: false,
    });
    const isChoreoProject = (workspaceMetaData === null || workspaceMetaData === void 0 ? void 0 : workspaceMetaData.projectID) !== undefined;
    const { data: loginStatus = "Initializing", error: loginStatusError, isLoading: loginStatusLoading, isFetched: fetchedLoginStatus, } = useQuery({
        queryKey: ["choreo_login_status"],
        queryFn: () => ChoreoWebViewAPI.getInstance().getLoginStatus(),
    });
    const { data: userInfo, refetch: refetchUserInfo, error: userInfoError, isLoading: userInfoLoading, } = useQuery({
        queryKey: ["choreo_user_info", loginStatus],
        queryFn: () => ChoreoWebViewAPI.getInstance().getUserInfo(),
        enabled: loginStatus === "LoggedIn",
        refetchOnWindowFocus: false,
    });
    const { data: choreoProject, error: choreoProjectError, isLoading: choreoProjectLoading, } = useQuery({
        queryKey: [
            "choreo_project_details",
            loginStatus,
            isChoreoProject,
            workspaceMetaData === null || workspaceMetaData === void 0 ? void 0 : workspaceMetaData.projectID,
            userInfo === null || userInfo === void 0 ? void 0 : userInfo.userId,
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
                return userInfo === null || userInfo === void 0 ? void 0 : userInfo.organizations.find((org) => org.id.toString() === (ctxOrgId === null || ctxOrgId === void 0 ? void 0 : ctxOrgId.toString()));
            }
            if (choreoProject) {
                return userInfo === null || userInfo === void 0 ? void 0 : userInfo.organizations.find((org) => { var _a; return org.id.toString() === ((_a = choreoProject === null || choreoProject === void 0 ? void 0 : choreoProject.orgId) === null || _a === void 0 ? void 0 : _a.toString()); });
            }
        }
    }, [userInfo, choreoProject, ctxOrgId]);
    useEffect(() => {
        const rpcInstance = ChoreoWebViewAPI.getInstance();
        rpcInstance.onLoginStatusChanged((newLoginStatus) => __awaiter(void 0, void 0, void 0, function* () {
            console.log("Login status changed" + JSON.stringify(newLoginStatus));
            queryClient.setQueryData(["choreo_login_status"], newLoginStatus);
            if (newLoginStatus === "LoggedIn") {
                refetchUserInfo();
            }
        }));
    }, []);
    const error = (getChoreoWorkspaceError || loginStatusError || userInfoError || choreoProjectError);
    return (React.createElement(ChoreoWebViewContext.Provider, { value: {
            loginStatus,
            userInfo,
            choreoProject,
            isChoreoProject,
            error,
            choreoUrl,
            loginStatusPending: loginStatusLoading || userInfoLoading,
            loadingProject: getChoreoWorkspaceLoading || (isChoreoProject === true && choreoProjectLoading),
            currentProjectOrg,
        } }, children));
};
//# sourceMappingURL=choreo-web-view-ctx.js.map