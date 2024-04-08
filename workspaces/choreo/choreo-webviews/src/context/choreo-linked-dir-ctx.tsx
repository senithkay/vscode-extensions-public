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
import { ComponentLink } from "@wso2-enterprise/choreo-core";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";

export interface ILinkedDirContext {
    links: ComponentLink[];
    isInitialLoading?: boolean;
    loading?: boolean;
    error?: Error;
}

const defaultContext: ILinkedDirContext = {
    links: [],
    loading: false,
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
        isLoading: loadingInitialLinkedDirState,
        isFetching: fetchingLinkedDirState,
    } = useQuery({
        queryKey: ["linked_dir_state"],
        queryFn: () => ChoreoWebViewAPI.getInstance().getLinkedDirState(),
    });

    useEffect(() => {
        ChoreoWebViewAPI.getInstance().refreshLinkedDirState();
        ChoreoWebViewAPI.getInstance().onLinkedDirStateChanged((linkedDirState) => {
            queryClient.setQueryData(["linked_dir_state"], linkedDirState);
        });
    }, []);

    return (
        <ChoreoLinkedDirContext.Provider
            value={{
                links: linkedDirState?.links || [],
                error: (linkedDirStateError || linkedDirState?.error) as Error,
                loading: linkedDirState?.loading || fetchingLinkedDirState,
                isInitialLoading: loadingInitialLinkedDirState
            }}
        >
            {children}
        </ChoreoLinkedDirContext.Provider>
    );
};
