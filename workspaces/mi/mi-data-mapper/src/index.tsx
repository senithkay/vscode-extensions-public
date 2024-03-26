/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FunctionDefinition } from "@wso2-enterprise/syntax-tree";
import { HistoryEntry } from "@wso2-enterprise/mi-core";
import { DataMapper } from "./components/DataMapper/DataMapper";
import { StatementEditorComponentProps } from "@wso2-enterprise/record-creator";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            refetchOnWindowFocus: false,
            staleTime: 1000,
            cacheTime: 1000,
        },
    },
});

export interface DataMapperViewProps {
    filePath: string;
    fnST?: FunctionDefinition;
    langServerRpcClient?: any;
    libraryBrowserRpcClient?: any;
    applyModifications?: (modifications: any[]) => Promise<void>;
    goToFunction?: (componentInfo: HistoryEntry) => Promise<void>;
    onClose?: () => void;
    renderRecordPanel?: (props: {
        closeAddNewRecord: (createdNewRecord?: string) => void,
        onUpdate: (update: boolean) => void
    } & StatementEditorComponentProps) => React.ReactElement;
}

export function DataMapperView(props: DataMapperViewProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <DataMapper 
                fnST={undefined}
                filePath={props.filePath}
                langServerRpcClient={undefined}
                libraryBrowserRpcClient={undefined}
                applyModifications={undefined}
                goToFunction={undefined}
                onClose={undefined}
                renderRecordPanel={undefined}
            />
        </QueryClientProvider>
    );
}
