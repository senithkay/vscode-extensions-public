/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect } from "react";
import { VisualizerLocation, ComponentModels } from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { TypeDiagram as TypeDesignDiagram } from "@wso2-enterprise/type-diagram";

export function TypeDiagram() {
    const { rpcClient } = useRpcContext();
    const langRpcClient = rpcClient.getLangClientRpcClient();
    const commonRpcClient = rpcClient.getCommonRpcClient();
    const [visualizerLocation, setVisualizerLocation] = React.useState<VisualizerLocation>();

    useEffect(() => {
        if (rpcClient) {
            rpcClient.getVisualizerLocation().then((value) => {
                setVisualizerLocation(value);
            });
        }
    }, [rpcClient]);


    const getComponentModel = async () => {
        if (!rpcClient || !visualizerLocation?.documentUri) {
            return;
        }
        const response: ComponentModels = await langRpcClient.getPackageComponentModels({ documentUris: [visualizerLocation?.documentUri] });
        return response;
    };

    const showProblemPanel = async () => {
        if (!rpcClient) {
            return;
        }
        await commonRpcClient.executeCommand({ commands: ['workbench.action.problems.focus'] });
    }

    return (
        <TypeDesignDiagram
            getComponentModel={getComponentModel}
            // selectedRecordName={visualizerLocation?.identifier}
            showProblemPanel={showProblemPanel}
        />
    );
}
