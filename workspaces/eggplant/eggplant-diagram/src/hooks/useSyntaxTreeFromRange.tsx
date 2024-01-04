/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { useQuery } from '@tanstack/react-query';
import { URI } from "vscode-uri";
import { useVisualizerContext } from "@wso2-enterprise/eggplant-rpc-client";
import { BallerinaSTModifyResponse } from "@wso2-enterprise/ballerina-core";
import { NodePosition } from '@wso2-enterprise/syntax-tree';

export const useSyntaxTreeFromRange = (location: NodePosition, fileName: string, hasRerender: boolean) : {
    data: BallerinaSTModifyResponse;
    isFetching: boolean;
    isError: boolean;
    refetch: any;
} => {
    const { eggplantRpcClient } = useVisualizerContext();
    const getST = async () => {
        try {
            const response = await eggplantRpcClient?.getLangServerRpcClient().getSTByRange({
                lineRange: {
                    start: {
                        line: location.startLine,
                        character: location.startColumn
                    },
                    end: {
                        line: location.endLine,
                        character: location.endColumn
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

    const {
        data,
        isFetching,
        isError,
        refetch,
    } = useQuery(['getST', {location, fileName, hasRerender}], () => getST(), {});

    return { data, isFetching, isError, refetch };
};
