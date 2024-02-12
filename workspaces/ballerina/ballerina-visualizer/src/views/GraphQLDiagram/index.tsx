/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect } from "react";
import { GraphqlDesignServiceRequest, GraphqlDesignServiceResponse, VisualizerLocation } from "@wso2-enterprise/ballerina-core";
import { useVisualizerContext } from "@wso2-enterprise/ballerina-rpc-client";
import { GraphqlDesignDiagram } from "@wso2-enterprise/ballerina-graphql-design-diagram";

export function GraphQLDiagram() {
    const { rpcClient } = useVisualizerContext();
    const [context, setContext] = React.useState<VisualizerLocation>();
    const [graphqlModdel, setGraphqlModel] = React.useState<GraphqlDesignServiceResponse>();

    useEffect(() => {
        if (rpcClient) {
            rpcClient.getVisualizerLocation().then((value) => {
                setVisualizerLocation(value);
            });
        }
    }, [rpcClient]);

    useEffect( () => {
        getGraphqlDesignModel();
    }, [context]);

    const getGraphqlDesignModel = async () => {
        if (!rpcClient) {
            return;
        }
        const request : GraphqlDesignServiceRequest = {
            filePath: context?.documentUri,
            startLine: {line: context?.position?.startLine, offset: context?.position?.startColumn},
            endLine: {line: context?.position?.endLine, offset: context?.position?.endColumn}
        }
        const response: GraphqlDesignServiceResponse = await rpcClient.getGraphqlDesignerRpcClient().getGraphqlModel(request);
        setGraphqlModel(response);
    };


    return (
        <>
            <h1>Hello GraphQL Diagram</h1>
            <ul>
                <li>{visualizerLocation?.view}</li>
                <li>{visualizerLocation?.documentUri}</li>
                <li>{visualizerLocation?.position?.startLine}</li>
                <li>{visualizerLocation?.identifier}</li>
            </ul>
            <GraphqlDesignDiagram
                graphqlModelResponse={graphqlModdel}
                filePath={context?.documentUri}
            />
        </>
    );
}
