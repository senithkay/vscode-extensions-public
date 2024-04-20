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
import React, { FC, ReactNode, useContext, useEffect, useState } from "react";
import { ComponentLink, LinkedDirectoryState } from "@wso2-enterprise/choreo-core";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { ErrorBanner, ProgressIndicator } from "@wso2-enterprise/ui-toolkit";

export interface ILinkedDirContext {
    links: ComponentLink[];
    isLoading?: boolean;
    activeComponentPath?: string;
}

const defaultContext: ILinkedDirContext = {
    links: [],
};

export const ChoreoLinkedDirContext = React.createContext(defaultContext);

export const useLinkedDirContext = () => {
    return useContext(ChoreoLinkedDirContext);
};

interface Props {
    children: ReactNode;
}

export const LinkedDirContextProvider: FC<Props> = ({ children }) => {
    const queryClient = useQueryClient();

    const {
        data: linkedDirState,
        error: linkedDirStateError,
        isLoading
    } = useQuery({
        queryKey: ["linked_dir_state"],
        queryFn: () => ChoreoWebViewAPI.getInstance().getLinkedDirState(),
        refetchInterval: 10000,
    });

    const {
        data: activeComponentPath,
    } = useQuery({
        queryKey: ["active_component"],
        queryFn: () => ChoreoWebViewAPI.getInstance().getWebviewStoreState(),
        select: (data) => data.openedComponentPath,
    });

    useEffect(() => {
        ChoreoWebViewAPI.getInstance().refreshLinkedDirState();
        ChoreoWebViewAPI.getInstance().onLinkedDirStateChanged((linkedDirState) => {
            queryClient.setQueryData(["linked_dir_state"], linkedDirState);
        });
        ChoreoWebViewAPI.getInstance().onWebviewStateChanged((webviewState) => {
            queryClient.setQueryData(["active_component"], webviewState);
        });
    }, []);

    return (
        <ChoreoLinkedDirContext.Provider
            value={{
                links: linkedDirState?.links || [],
                isLoading: isLoading || linkedDirState.loading,
                activeComponentPath
            }}
        >
            {linkedDirStateError ? (
                <ErrorBanner errorMsg="Failed load linked components" />
            ) : (
                <>
                    {(isLoading || linkedDirState.loading) && <ProgressIndicator />}
                    {children}
                </>
            )}
        </ChoreoLinkedDirContext.Provider>
    );
};
