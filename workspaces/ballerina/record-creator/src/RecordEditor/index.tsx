/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useMemo } from "react";

import { RecordTypeDesc, TypeDefinition } from "@wso2-enterprise/syntax-tree";

import { StatementEditorComponentProps } from "../types";
import { Context } from "../Context";
import { useBallerinaVersion, useFullST } from "../Hooks";
import { RecordCreatorRpcClient } from "@wso2-enterprise/ballerina-rpc-client";
import { RecordEditor } from "./RecordEditor";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export interface RecordEditorProps {
    model?: RecordTypeDesc | TypeDefinition;
    isDataMapper?: boolean;
    onCancel: (createdNewRecord?: string) => void;
    showHeader?: boolean;
}

export interface RecordEditorWrapperProps extends RecordEditorProps, StatementEditorComponentProps {
    recordCreatorRpcClient: RecordCreatorRpcClient;
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            refetchOnWindowFocus: false,
            staleTime: 1000,
            gcTime: 1000,
        },
    },
});

export function RecordEditorWrapper(props: RecordEditorWrapperProps) {
    const {
        model,
        isDataMapper,
        onCancel,
        showHeader,
        expressionInfo,
        langServerRpcClient,
        libraryBrowserRpcClient,
        recordCreatorRpcClient,
        currentFile,
        applyModifications,
        onCancelStatementEditor,
        onClose,
        importStatements,
        currentReferences,
    } = props;
    const {
        ballerinaVersion,
        isFetching: isFetchingBallerinaVersion,
        isError: isErrorBallerinaVersion,
    } = useBallerinaVersion(langServerRpcClient);
    const {
        fullST,
        isFetching: isFetchingFullST,
        isError: isErrorFullST,
    } = useFullST(currentFile.path, langServerRpcClient);

    const contextValue = useMemo(() => {
        if (isFetchingBallerinaVersion || isFetchingFullST) {
            return undefined;
        }

        return {
            props: {
                expressionInfo,
                langServerRpcClient,
                libraryBrowserRpcClient,
                recordCreatorRpcClient,
                currentFile,
                importStatements,
                currentReferences,
                ballerinaVersion,
                fullST,
            },
            api: {
                applyModifications,
                onCancelStatementEditor,
                onClose,
            },
        };
    }, [isFetchingBallerinaVersion, isFetchingFullST]);

    return (
        <QueryClientProvider client={queryClient}>
            <Context.Provider value={contextValue}>
                {!isFetchingBallerinaVersion && !isErrorBallerinaVersion && !isFetchingFullST && !isErrorFullST && (
                    <RecordEditor
                        model={model}
                        isDataMapper={isDataMapper}
                        onCancel={onCancel}
                        showHeader={showHeader}
                    />
                )}
            </Context.Provider>
        </QueryClientProvider>
    );
}
