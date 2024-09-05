/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useMemo, useState } from "react";

/** @jsx jsx */
import { Global, css } from '@emotion/react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DMType } from "@wso2-enterprise/mi-core";
import { Project, SyntaxKind } from "ts-morph";

import { MIDataMapper } from "./components/DataMapper/DataMapper";
import { ErrorBoundary } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { hasFields } from "./components/Diagram/utils/node-utils";

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
    fileContent: string;
    functionName: string;
    inputTrees: DMType[];
    outputTree: DMType;
    configName: string;
    updateFileContent: (fileContent: string) => Promise<void>;
}

export function DataMapperView(props: DataMapperViewProps) {
    const {
        filePath,
        fileContent,
        functionName,
        inputTrees,
        outputTree,
        updateFileContent,
        configName
    } = props;

    const [isLoading, setIsLoading] = useState(false); 
    const [isMapping, setIsMapping] = useState(false);

    const { rpcClient } = useVisualizerContext();

    const functionST = useMemo(() => {

        const project = new Project({
            useInMemoryFileSystem: true,
            compilerOptions: { target: 2 }
        });
        const sourceFile = project.createSourceFile(filePath, fileContent);
        const fnST = sourceFile.getFunction(functionName);

        const hasNonEmptyIOTrees = inputTrees.every(tree => hasFields(tree)) && hasFields(outputTree);

        // Check if the return statement is empty
        const returnStatement = fnST?.getDescendantsOfKind(SyntaxKind.ReturnStatement)[0];
        const isEmptyReturnStatement =
            // If return type is an object
            returnStatement?.getExpressionIfKind(SyntaxKind.ObjectLiteralExpression)?.getProperties().length === 0
            // If return type is an array
            || returnStatement?.getExpressionIfKind(SyntaxKind.ArrayLiteralExpression)?.getElements().length === 0;
        if (hasNonEmptyIOTrees && isEmptyReturnStatement) {
            rpcClient.getMiVisualizerRpcClient().retrieveContext({
                key: "showDmLandingMessage",
                contextType: "workspace"
            }).then((response) => {
                if (response.value ?? true) {
                    rpcClient.getMiVisualizerRpcClient().showNotification({
                        message: "Begin mapping by selecting a field from the Input section and then selecting a corresponding field in the Output section.",
                        options: ["Don't show this again"],
                        type: "info",
                    }).then((response) => {
                        if (response.selection) {
                            rpcClient.getMiVisualizerRpcClient().updateContext({
                                key: "showDmLandingMessage",
                                value: false,
                                contextType: "workspace"
                            });
                        }
                    });
                }
            });
        }

        return fnST;

    }, [rpcClient, filePath, fileContent, functionName]);

    const applyModifications = async (fileContent: string) => {
        await updateFileContent(fileContent);
    };

    return (
        <ErrorBoundary errorMsg="An error occurred while rendering the MI Data Mapper">
            <QueryClientProvider client={queryClient}>
                <Global styles={globalStyles} />
                <MIDataMapper
                    fnST={functionST}
                    inputTrees={inputTrees}
                    outputTree={outputTree}
                    fileContent={fileContent}
                    applyModifications={applyModifications}
                    filePath={filePath}
                    configName={configName}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    isMapping={isMapping}
                    setIsMapping={setIsMapping}
                />
            </QueryClientProvider>
        </ErrorBoundary>
    );
}
