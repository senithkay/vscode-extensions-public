/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";

/** @jsx jsx */
import { Global, css } from '@emotion/react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DMType } from "@wso2-enterprise/mi-core";
import { MIDataMapper } from "./components/DataMapper/DataMapper";
import * as ts from "typescript";

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

const globalStyles = css`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
`;

export interface MIDataMapperProps {
    fnST: ts.VariableDeclaration;
    inputTrees: DMType[];
    outputTree: DMType;
}

export function DataMapperView(props: MIDataMapperProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <Global styles={globalStyles} />
            <MIDataMapper {...props}/>
        </QueryClientProvider>
    );
}
