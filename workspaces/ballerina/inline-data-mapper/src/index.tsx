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
import type {} from "@emotion/styled";
import { css, Global } from '@emotion/react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IDMModel } from "@wso2-enterprise/ballerina-core";
import { ErrorBoundary } from "@wso2-enterprise/ui-toolkit";

import { InlineDataMapper } from "./components/DataMapper/DataMapper";

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

export interface DataMapperViewProps {
    model: IDMModel;
    onClose: () => void;
}

export function DataMapperView(props: DataMapperViewProps) {
    const { model, onClose } = props;

    return (
        <ErrorBoundary errorMsg="An error occurred while redering the Inline Data Mapper">
            <QueryClientProvider client={queryClient}>
                <Global styles={globalStyles} />
                <InlineDataMapper model={model} onClose={onClose} />
            </QueryClientProvider>
        </ErrorBoundary>
    );
}
