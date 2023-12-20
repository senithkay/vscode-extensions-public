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
import { URI } from "vscode-uri";
import { BallerinaProjectComponents } from '@wso2-enterprise/ballerina-low-code-edtior-commons';
import { LangServerRpcClient } from '@wso2-enterprise/ballerina-rpc-client';

export const useProjectComponents = (langServerRpcClient: LangServerRpcClient, fileName: string): {
    projectComponents: BallerinaProjectComponents;
    isFetching: boolean;
    isError: boolean;
    refetch: any;
} => {
    const fetchProjectComponents = async () => {
        try {
            const componentResponse = await langServerRpcClient.getBallerinaProjectComponents({
                documentIdentifiers: [
                    {
                        uri: URI.file(fileName).toString(),
                    }
                ]
            })
            return componentResponse;
        } catch (networkError: any) {
            console.error('Error while fetching project components', networkError);
        }
    };

    const {
        data: projectComponents,
        isFetching,
        isError,
        refetch,
    } = useQuery(['fetchProjectComponents'], () => fetchProjectComponents(), {});

    return { projectComponents, isFetching, isError, refetch };
};
