/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect } from "react";
import { VisualizerLocation } from "@wso2-enterprise/mi-core";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { SamplesView } from "../SamplesView";

export function GettingStarted() {
    const { rpcClient } = useVisualizerContext();
    const [state, setState] = React.useState<VisualizerLocation>(null);
    const [showSamples, viewSamples] = React.useState<boolean>(false);

    const viewSampleHandle = async () => {
        viewSamples(true);
    }

    useEffect(() => {
        if (rpcClient) {
            rpcClient.getVisualizerState().then((initialState) => {
                setState(initialState);
            });
        }
    }, [rpcClient]);


    return (
        <>
            <h1>Hello Getting Started - {state?.documentUri}</h1>
            <button onClick={viewSampleHandle}>Download a Sample</button>
            {showSamples && <SamplesView />}
        </>
    );
}
