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

export const useIOTypes = (filePath: string, functionName: string) => {
    const { rpcClient } = useVisualizerContext();
    const getIOTypes = async () => {
        try {
            const res = await rpcClient
                .getMiDataMapperRpcClient()
                .getIOTypes({ filePath, functionName });
            return res;
        } catch (error) {
            console.error('Error while fetching transformation profile: ', error);
        }
    }

    const {
        data: dmIOTypes,
        isFetching: isFetchingIOTypes,
        isError: isTypeError,
        refetch,
    } = useQuery(['getIOTypes', { filePath, functionName }], () => getIOTypes(), {});

    return {dmIOTypes, isFetchingIOTypes, isTypeError, refetch };
};

export const useFileContent = (filePath: string) => {
    const { rpcClient } = useVisualizerContext();
    const getFileContent = async () => {
        try {
            const res = await rpcClient
                .getMiDataMapperRpcClient()
                .getFileContent({ filePath });
            return res.fileContent;
        } catch (error) {
            console.error('Error while fetching file content: ', error);
        }
    }

    const {
        data: dmFileContent,
        isFetching: isFetchingFileContent,
        isError: isFileError,
        refetch,
    } = useQuery(['getFileContent', { filePath }], () => getFileContent(), {});

    return {dmFileContent, isFetchingFileContent, isFileError, refetch };
};
