/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useMemo } from "react";

/** @jsx jsx */
import { css, Global } from '@emotion/react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IDMType } from "@wso2-enterprise/ballerina-core";

import { InlineDataMapper } from "./components/DataMapper/DataMapper";
import { ErrorBoundary } from "@wso2-enterprise/ui-toolkit";
// import { useVisualizerContext } from "@wso2-enterprise/ballerina-rpc-client";
import { hasFields } from "./components/Diagram/utils/node-utils";
import { STNode } from "@wso2-enterprise/syntax-tree";

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
    filePath: string;
    stNode: STNode;
    inputTrees: IDMType[];
    outputTree: IDMType;
}

export function DataMapperView(props: DataMapperViewProps) {
    const {
        stNode,
        inputTrees,
        outputTree
    } = props;

    // const { rpcClient } = useVisualizerContext();

    // const functionST = useMemo(() => {

    //     const project = new Project({
    //         useInMemoryFileSystem: true,
    //         compilerOptions: { target: 2 }
    //     });
    //     const sourceFile = project.createSourceFile(filePath, fileContent);
    //     const fnST = sourceFile.getFunction(functionName);

    //     const hasNonEmptyIOTrees = inputTrees.every(tree => hasFields(tree)) && hasFields(outputTree);

    //     // Check if the return statement is empty
    //     const returnStatement = fnST?.getDescendantsOfKind(SyntaxKind.ReturnStatement)[0];
    //     const isEmptyReturnStatement =
    //         // If return type is an object
    //         returnStatement?.getExpressionIfKind(SyntaxKind.ObjectLiteralExpression)?.getProperties().length === 0
    //         // If return type is an array
    //         || returnStatement?.getExpressionIfKind(SyntaxKind.ArrayLiteralExpression)?.getElements().length === 0;
    //     if (hasNonEmptyIOTrees && isEmptyReturnStatement) {
    //         rpcClient.getMiVisualizerRpcClient().retrieveContext({
    //             key: "showDmLandingMessage",
    //             contextType: "workspace"
    //         }).then((response) => {
    //             if (response.value ?? true) {
    //                 rpcClient.getMiVisualizerRpcClient().showNotification({
    //                     message: "Begin mapping by selecting a field from the Input section and then selecting a corresponding field in the Output section.",
    //                     options: ["Don't show this again"],
    //                     type: "info",
    //                 }).then((response) => {
    //                     if (response.selection) {
    //                         rpcClient.getMiVisualizerRpcClient().updateContext({
    //                             key: "showDmLandingMessage",
    //                             value: false,
    //                             contextType: "workspace"
    //                         });
    //                     }
    //                 });
    //             }
    //         });
    //     }

    //     return fnST;

    // }, [rpcClient, filePath, fileContent, functionName]);

    // const applyModifications = async (fileContent: string) => {
    //     await updateFileContent(fileContent);
    // };

    // return (<div>INLINE DATA MAPPWR</div>);

    return (
        <ErrorBoundary errorMsg="An error occurred while redering the MI Data Mapper">
            <QueryClientProvider client={queryClient}>
                <Global styles={globalStyles} />
                <InlineDataMapper
                    stNode={stNode}
                    inputTrees={inputTrees}
                    outputTree={outputTree}
                />
            </QueryClientProvider>
        </ErrorBoundary>
    );
}
