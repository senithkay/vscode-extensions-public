/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect } from "react";
import { GraphqlDesignServiceParams, GraphqlDesignService, VisualizerLocation } from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { GraphqlDesignDiagram } from "@wso2-enterprise/ballerina-graphql-design-diagram";

export function GraphQLDiagram() {
    const { rpcClient } = useRpcContext();
    const [visualizerLocation, setVisualizerLocation] = React.useState<VisualizerLocation>();
    const [graphqlModdel, setGraphqlModel] = React.useState<GraphqlDesignService>();

    useEffect(() => {
        if (rpcClient) {
            rpcClient.getVisualizerLocation().then((value) => {
                setVisualizerLocation(value);
            });
        }
    }, [rpcClient]);

    useEffect(() => {
        getGraphqlDesignModel();
    }, [visualizerLocation]);

    const getGraphqlDesignModel = async () => {
        if (!rpcClient && !visualizerLocation) {
            return;
        }
        const request: GraphqlDesignServiceParams = {
            filePath: visualizerLocation?.documentUri,
            startLine: { line: visualizerLocation?.position?.startLine, offset: visualizerLocation?.position?.startColumn },
            endLine: { line: visualizerLocation?.position?.endLine, offset: visualizerLocation?.position?.endColumn }
        }
        const response: GraphqlDesignService = await rpcClient.getGraphqlDesignerRpcClient().getGraphqlModel(request);
        setGraphqlModel(response);
    };

    const goToSource = (filePath: string, position: any) => {
        rpcClient.getCommonRpcClient().goToSource({  position, filePath });
    }


    return (
        <>
            {visualizerLocation &&
                <GraphqlDesignDiagram
                    graphqlModelResponse={graphqlModdel}
                    filePath={visualizerLocation?.documentUri}
                    goToSource={goToSource}
                />
            }
        </>
    );
}
