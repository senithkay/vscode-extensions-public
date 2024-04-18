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
import React from "react";

import { QueryClient } from "@tanstack/react-query";
import { PersistedClient, Persister, PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { ChoreoWebViewAPI } from "./WebViewRpc";

/**
 * Persist data within vscode workspace cache
 */
const workspaceStatePersister = (queryBaseKey: string) => {
    return {
        persistClient: async (client: PersistedClient) => {
            ChoreoWebViewAPI.getInstance().setWebviewCache(queryBaseKey, client);
        },
        restoreClient: async () => {
            const cache = await ChoreoWebViewAPI.getInstance().restoreWebviewCache(queryBaseKey)
            return cache;
        },
        removeClient: async () => {
            await ChoreoWebViewAPI.getInstance().clearWebviewCache(queryBaseKey);
        },
    } as Persister;
};

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            cacheTime: 1000 * 60 * 60 * 24, // 24 hours
            retry: false,
        },
    },
});

export const ChoreoWebviewQueryClientProvider = ({ type, children }: { type: string; children: React.ReactNode, }) => {
    return (
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{
                persister: workspaceStatePersister(`react-query-persister-${type}`),
                buster: "choreo-webview-cache-v1",
            }}
        >
            {children}
        </PersistQueryClientProvider>
    );
};
