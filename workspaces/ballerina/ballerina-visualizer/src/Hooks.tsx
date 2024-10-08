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
import { useRpcContext } from '@wso2-enterprise/ballerina-rpc-client';
import { Range } from '@wso2-enterprise/ballerina-core';
import { URI } from 'vscode-uri';

export const useExperimentalEnabled = () => {
    const { rpcClient } = useRpcContext();

    const isExperimentalEnabled = async () => {
        return await rpcClient.getCommonRpcClient().experimentalEnabled();
    }

    const {
        data: experimentalEnabled,
        isFetching: isFetchingExperimentalEnabled,
        isError,
        refetch,
    } = useQuery(['isExperimentalEnabled', {}], () => isExperimentalEnabled(), {});

    return { experimentalEnabled, isFetchingExperimentalEnabled, isError, refetch };
};

export const useIOTypes = (filePath: string) => {
    const { rpcClient } = useRpcContext();
    const getIOTypes = async () => {
        try {
            const res = await rpcClient
                .getInlineDataMapperRpcClient()
                .getIOTypes({ filePath, position: { line: 28, offset: 12 } });
            return res;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    const {
        data: dmIOTypes,
        isFetching: isFetchingIOTypes,
        isError: isIOTypeError,
        refetch
    } = useQuery(['getIOTypes', { filePath }], () => getIOTypes(), {});

    return {dmIOTypes, isFetchingIOTypes, isIOTypeError, refetch};
};

export const useSTNodeByRange = (filePath: string, range: Range) => {
    const { rpcClient } = useRpcContext();
    const getSTNode = async () => {
        try {
            const res = await rpcClient
                .getLangClientRpcClient()
                .getSTByRange({
                    documentIdentifier: { uri: URI.file(filePath).toString() },
                    lineRange: range
                });
            return res;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    const {
        data: stNode,
        isFetching: isFetchingSTNode,
        isError: isSTNodeError,
        refetch
    } = useQuery(['getSTNode', { filePath }], () => getSTNode(), {});

    return {stNode, isFetchingSTNode, isSTNodeError, refetch};
};
