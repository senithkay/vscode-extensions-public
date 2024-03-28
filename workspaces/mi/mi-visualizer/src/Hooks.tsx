/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";

export const useIOTypes = (
    filePath: string,
    functionName: string
) => {
    const { rpcClient } = useVisualizerContext();
    const getIOTypes = async () => {
        try {
            const profile = await rpcClient
                .getMiDataMapperRpcClient()
                .getIOTypes({ filePath, functionName });
            return profile;
        } catch (error) {
            console.error('Error while fetching transformation profile: ', error);
        }
    }

    const {
        data: dmIOTypes,
        isFetching,
        isError,
        refetch,
    } = useQuery(['getIOTypes', { filePath, functionName }], () => getIOTypes(), {});

    return {dmIOTypes, isFetching, isError, refetch };
};

export const useFunctionST = (
    filePath: string,
    functionName: string
) => {
    const { rpcClient } = useVisualizerContext();
    const getFnST = async () => {
        try {
            const profile = await rpcClient
                .getMiDataMapperRpcClient()
                .getFunctionST({ filePath, functionName });
            return profile;
        } catch (error) {
            console.error('Error while fetching function ST: ', error);
        }
    }

    const {
        data: dmFnST,
        isFetching,
        isError,
        refetch,
    } = useQuery(['getFnST', { filePath, functionName }], () => getFnST(), {});

    return {dmFnST, isFetching, isError, refetch };
};
