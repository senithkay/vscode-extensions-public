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
import React, { FC, ReactNode, useContext, useEffect } from "react";
import { AuthState, UserInfo } from "@wso2-enterprise/choreo-core";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { SignInView } from "../views/SignInView";
import { ErrorBanner, ProgressIndicator } from "@wso2-enterprise/ui-toolkit";

export interface IAuthContext {
    userInfo: UserInfo | null;
}

const defaultContext: IAuthContext = {
    userInfo: null,
};

export const ChoreoAuthContext = React.createContext(defaultContext);

export const useAuthContext = () => {
    return useContext(ChoreoAuthContext);
};

interface Props {
    children: ReactNode;
}

export const AuthContextProvider: FC<Props> = ({ children }) => {
    const queryClient = useQueryClient();

    const {
        data: authState,
        error: authStateError,
        isLoading
    } = useQuery({
        queryKey: ["auth_state"],
        queryFn: () => ChoreoWebViewAPI.getInstance().getAuthState(),
    });

    useEffect(() => {
        ChoreoWebViewAPI.getInstance().onAuthStateChanged((authState) => {
            queryClient.setQueryData(["auth_state"], authState);
        });
    }, []);

    return (
        <ChoreoAuthContext.Provider value={{ userInfo: authState?.userInfo || null }}>
            {authStateError ? (
                <ErrorBanner errorMsg="Failed to authenticate user" />
            ) : (
                <>
                    {(authState?.loading || isLoading) && <ProgressIndicator />}
                    {!isLoading && <>{authState?.userInfo ? children : <SignInView />}</>}
                </>
            )}
        </ChoreoAuthContext.Provider>
    );
};
