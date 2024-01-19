/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect } from "react";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { MachineStateValue } from "@wso2-enterprise/mi-core";
import DiagramPanel from "./DiagramPanel";


export function Visualizer({ mode }: { mode: string }) {
    const { rpcClient } = useVisualizerContext();
    const [state, setState] = React.useState<MachineStateValue>('initialize');

    rpcClient?.onStateChanged((newState: MachineStateValue) => {
        setState(newState);
    });

    useEffect(() => {
        if (rpcClient) {
            // rpcClient.getWebviewRpcClient().getState().then((initialState: any) => {
            //     setState(initialState);
            // });
        }
    }, [rpcClient]);

    return (
        <>
            {(() => {
                switch (mode) {
                    case "activityPanel":
                        return <h2>Hello Activity Panel</h2>
                    case "visualizer":
                        return <LowCodeComponent state={state}/>
                }
            })()}
        </>
    );
};

// const OverviewComponent = ({ state }: { state: MachineStateValue }) => {
//     switch (true) {
//         case typeof state === 'object' && 'ready' in state:
//             return <Overview />;
//         case typeof state === 'object' && 'newProject' in state:
//             return <InitProject />;
//         default:
//             return <Loader />;
//     }
// };

const LowCodeComponent = ({ state }: { state: MachineStateValue }) => {
    switch (true) {
        case typeof state === 'object' && 'ready' in state:
            return <DiagramPanel state={state} />;
        case typeof state === 'object' && 'newProject' in state:
            return <h1>New Project Page</h1>
        default:
            return <h1>LOADING</h1>;
    }
};
