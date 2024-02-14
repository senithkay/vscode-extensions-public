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
import { URI } from "vscode-uri";
import { transformNodePosition } from './utils/utils';
import { NodePosition } from '@wso2-enterprise/syntax-tree';

export const useSyntaxTreeFromRange = (location: NodePosition, filePath: string, hasFileChanged?: boolean) => {
    const { rpcClient } = useVisualizerContext();
    const getST = async () => {
        if (location && filePath) {
            try {
                const response = await rpcClient?.getLangServerRpcClient().getSTByRange({
                    lineRange: transformNodePosition(location),
                    documentIdentifier: {
                        uri: URI.file(filePath).toString()
                    }
                });
                return response;
            } catch (networkError: any) {
                console.error('Error while fetching syntax tree', networkError);
            }
        }
    }

    const {
        data,
        isFetching,
        isError,
        refetch,
    } = useQuery(['getST', { location, filePath, hasFileChanged }], () => getST(), {});

    return { data, isFetching, isError, refetch };
};
