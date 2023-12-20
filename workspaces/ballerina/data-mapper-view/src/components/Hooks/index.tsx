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
import { BallerinaProjectComponents, BallerinaSTModifyResponse } from '@wso2-enterprise/ballerina-low-code-edtior-commons';

export const useSyntaxTreeFromRange = ():{
    data: BallerinaSTModifyResponse;
    isFetching: boolean;
    isError: boolean;
    refetch: any;
} => {
    const { ballerinaRpcClient, viewLocation } = useVisualizerContext();
    const { location: { position, fileName } } = viewLocation;
    const getST = async () => {
        if (viewLocation?.location) {
            try {
                const response = await ballerinaRpcClient?.getLangServerRpcClient().getSTByRange({
                    lineRange: {
                        start: {
                            line: position.startLine,
                            character: position.startColumn
                        },
                        end: {
                            line: position.endLine,
                            character: position.endColumn
                        }
                    },
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
    } = useQuery(['getST', {position}], () => getST(), {});

    return { data, isFetching, isError, refetch };
};

export const useProjectComponents = (): {
    projectComponents: BallerinaProjectComponents;
    isFetching: boolean;
    isError: boolean;
    refetch: any;
} => {
    const { ballerinaRpcClient, viewLocation } = useVisualizerContext();
    const fetchProjectComponents = async () => {
        try {
            const componentResponse = await ballerinaRpcClient.getLangServerRpcClient().getBallerinaProjectComponents({
                documentIdentifiers: [
                    {
                        uri: URI.file(viewLocation.location?.fileName).toString(),
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
