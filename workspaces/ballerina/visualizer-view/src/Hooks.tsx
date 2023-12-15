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
import { transformNodePosition } from './components/Utils';

export const useSyntaxTreeFromRange = (hasFileChanged?: boolean) => {
    const { ballerinaRpcClient, viewLocation } = useVisualizerContext();
    const { position, fileName } = viewLocation?.location || {};
    const getST = async () => {
        if (position && fileName) {
            try {
                const response = await ballerinaRpcClient?.getVisualizerRpcClient().getSTByRange({
                    lineRange: transformNodePosition(position),
                    documentIdentifier: {
                        uri: URI.file(fileName).toString()
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
    } = useQuery(['getST', {position, hasFileChanged}], () => getST(), {});

    return { data, isFetching, isError, refetch };
};
