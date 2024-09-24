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
