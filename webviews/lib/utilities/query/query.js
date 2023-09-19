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
import React from "react";
import { QueryClient } from '@tanstack/react-query';
import { get, set, del } from "idb-keyval";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
/**
 * Creates an Indexed DB persister
 */
export function createIDBPersister(idbValidKey = "choreoWebviewData") {
    return {
        persistClient: (client) => __awaiter(this, void 0, void 0, function* () {
            set(idbValidKey, client);
        }),
        restoreClient: () => __awaiter(this, void 0, void 0, function* () {
            return yield get(idbValidKey);
        }),
        removeClient: () => __awaiter(this, void 0, void 0, function* () {
            yield del(idbValidKey);
        }),
    };
}
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            cacheTime: 1000 * 60 * 60 * 24,
            retry: false
        },
    },
});
const persister = createIDBPersister();
export const ChoreoWebviewQueryClientProvider = ({ children }) => {
    return (React.createElement(PersistQueryClientProvider, { client: queryClient, persistOptions: { persister } }, children));
};
//# sourceMappingURL=query.js.map