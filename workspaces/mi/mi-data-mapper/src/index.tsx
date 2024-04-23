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
import { Global, css } from '@emotion/react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DMType, Range } from "@wso2-enterprise/mi-core";
import { Project } from "ts-morph";

import { MIDataMapper } from "./components/DataMapper/DataMapper";
import { ErrorBoundary } from "@wso2-enterprise/ui-toolkit";

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
    goToSource: (range: Range) => void;
    updateFileContent: (fileContent: string) => void;
}

function deriveConfigName(filePath: string) {
    const parts = filePath.split("/");
    const fileName = parts[parts.length - 1];
    return fileName.split(".")[0];
}

export function DataMapperView(props: DataMapperViewProps) {
    const {
        filePath,
        fileContent,
        functionName,
        inputTrees,
        outputTree,
        goToSource,
        updateFileContent
    } = props;

    const { functionST, sourceFile } = useMemo(() => {

        const project = new Project({useInMemoryFileSystem: true});
        const sourceFile = project.createSourceFile(filePath, fileContent);
        const fnST = sourceFile.getFunction(functionName);

        return {
            functionST: fnST,
            sourceFile: sourceFile,
        };

    }, [filePath, fileContent, functionName]);

    const applyModifications = () => {
        updateFileContent(sourceFile.getText());
    };

    return (
        <ErrorBoundary errorMsg="An error occurred while redering the MI Data Mapper">
            <QueryClientProvider client={queryClient}>
                <Global styles={globalStyles} />
                <MIDataMapper
                    fnST={functionST}
                    inputTrees={inputTrees}
                    outputTree={outputTree}
                    fileContent={fileContent}
                    goToSource={goToSource}
                    applyModifications={applyModifications}
                    filePath={filePath}
                    configName={deriveConfigName(filePath)}
                />
            </QueryClientProvider>
        </ErrorBoundary>
    );
}
