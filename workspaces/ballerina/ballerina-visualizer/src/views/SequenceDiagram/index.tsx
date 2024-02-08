/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect } from "react";
import { VisualizerLocation } from "@wso2-enterprise/ballerina-core";
import { useVisualizerContext } from "@wso2-enterprise/ballerina-rpc-client";

export function SequenceDiagram() {
    const { rpcClient } = useVisualizerContext();
    const [context, setContext] = React.useState<VisualizerLocation>();

    useEffect(() => {
        if (rpcClient) {
            rpcClient.getVisualizerContext().then((value) => {
                setContext(value);
            });
        }
    }, [rpcClient]);


    return (
        <>
            <h1>Hello Sequence Diagram</h1>
            <ul>
                <li>{context?.view}</li>
                <li>{context?.documentUri}</li>
                <li>{context?.position?.startLine}</li>
                <li>{context?.identifier}</li>
            </ul>
        </>
    );
}
