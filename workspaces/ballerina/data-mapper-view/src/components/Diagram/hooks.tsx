/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useVisualizerContext } from '@wso2-enterprise/ballerina-rpc-client';
import { Uri } from "monaco-editor";
import { BallerinaProjectComponents } from '@wso2-enterprise/ballerina-low-code-edtior-commons';

export const useProjectComponents = (currentFilePath: string, currentFileContent: string): {
    projectComponents: BallerinaProjectComponents,
    isFetching: boolean,
    isError: boolean,
    refetch: any
} => {
    const fetchProjectComponents = async () => {
    try {
        const { ballerinaRpcClient } = useVisualizerContext();
        const componentResponse = await ballerinaRpcClient.getVisualizerRpcClient().getBallerinaProjectComponents({
            documentIdentifiers: [
                {
                    uri: Uri.file(currentFilePath).toString(),
                }
            ]
        })
        return componentResponse;
        } catch (networkError: any) {
            return null;
        }
    };

    const {
        data: projectComponents,
        isFetching,
        isError,
        refetch,
      } = useQuery({
        queryKey: ['fetchProjectComponents', { currentFilePath, currentFileContent }],
        queryFn: () => fetchProjectComponents()
      });

    return { projectComponents, isFetching, isError, refetch };
  };
