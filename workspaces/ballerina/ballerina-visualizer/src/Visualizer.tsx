/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect } from "react";
import { useVisualizerContext } from "@wso2-enterprise/ballerina-rpc-client";
import { MachineStateValue } from "@wso2-enterprise/ballerina-core";
import MainPanel from "./MainPanel";
import { LoadingRing } from "./components/Loader";
import AIPanel from "./views/AIPanel/AIPanel";

export function Visualizer({ mode }: { mode: string }) {
    const { rpcClient } = useVisualizerContext();
    const [state, setState] = React.useState<MachineStateValue>('initialize');

    rpcClient?.onStateChanged((newState: MachineStateValue) => {
        setState(newState);
    });

    useEffect(() => {
        rpcClient.webviewReady();
    }, []);

    return (
        <>
            {(() => {
                switch (mode) {
                    case "visualizer":
                        return <VisualizerComponent state={state} />
                    case "ai":
                        return <AIPanel />
                }
            })()}
        </>
    );
};

const VisualizerComponent = React.memo(({ state }: { state: MachineStateValue }) => {
    switch (true) {
        case typeof state === 'object' && 'viewActive' in state && state.viewActive === "viewReady":
            return <MainPanel />;
        default:
            return <LoadingRing />;
    }
});
