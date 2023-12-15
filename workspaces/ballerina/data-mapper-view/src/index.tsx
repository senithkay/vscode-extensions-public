/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FunctionDefinition } from "@wso2-enterprise/syntax-tree";
import { STModification } from "@wso2-enterprise/ballerina-low-code-edtior-commons/lib/types/lang-client-extended";
import { DataMapper } from "./components/DataMapper/DataMapper";

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
  fnST: FunctionDefinition;
  applyModifications: (modifications: STModification[]) => Promise<void>;
}

export function DataMapperView(props: DataMapperViewProps) {
    const { fnST, applyModifications: applyModifications } = props;
    return (
        <QueryClientProvider client={queryClient}>
            <DataMapper fnST={fnST} applyModifications={applyModifications} />
        </QueryClientProvider>
    );
}
