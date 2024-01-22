/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect } from "react";
import { MachineStateValue, VisualizerLocation } from "@wso2-enterprise/mi-core";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";

export function Overview() {
    const { rpcClient } = useVisualizerContext();
    const [visualizerState, setVisualizerState] = React.useState<VisualizerLocation>(null);

    const [state, setState] = React.useState<MachineStateValue>('initialize');

    // Listening to state value change
    rpcClient?.onStateChanged((newState: MachineStateValue) => {
        setState(newState);
    });
    
    useEffect(() => {
        if (rpcClient) {
            rpcClient.getVisualizerState().then((stateValue) => {
                setVisualizerState(stateValue);
            });
        }
    }, [state]);

    return (
        <>
            <h1>Hello Overview - {visualizerState?.documentUri}</h1>
        </>
    );
}
