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

export const useSyntaxTreeFromRange = () => {
    const { ballerinaRpcClient, viewLocation } = useVisualizerContext();
    const getST = async () => {
        if (viewLocation?.location) {
            const response = await ballerinaRpcClient?.getVisualizerRpcClient().getSTByRange({
                lineRange: {
                    start: {
                        line: viewLocation.location.position.startLine,
                        character: viewLocation.location.position.startColumn
                    },
                    end: {
                        line: viewLocation.location.position.endLine,
                        character: viewLocation.location.position.endColumn
                    }
                },
                documentIdentifier: {
                    uri: URI.file(viewLocation.location.fileName).toString()
                }
            });
            return response;
        }    
    }

    const { data, isFetching, isError, refetch } = useQuery({
        queryKey: ['getST'],
        queryFn: () => getST(),
        refetchOnWindowFocus: false,
        enabled: !!viewLocation.location 
      });

    return { data, isFetching, isError, refetch };
  };
