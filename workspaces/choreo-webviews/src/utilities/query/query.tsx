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

import { QueryClient } from '@tanstack/react-query';
import { get, set, del } from "idb-keyval";
import { PersistedClient, Persister, PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

/**
 * Creates an Indexed DB persister
 */
export function createIDBPersister(idbValidKey: IDBValidKey = "choreoWebviewData") {
  return {
    persistClient: async (client: PersistedClient) => {
      set(idbValidKey, client);
    },
    restoreClient: async () => {
      return await get<PersistedClient>(idbValidKey);
    },
    removeClient: async () => {
      await del(idbValidKey);
    },
  } as Persister;
}

const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        cacheTime: 1000 * 60 * 60 * 24, // 24 hours
        retry: false
      },
    },
});

const persister = createIDBPersister();

export const ChoreoWebviewQueryClientProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      {children}
    </PersistQueryClientProvider>
  );
};
