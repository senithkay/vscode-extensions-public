/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { MachineStateValue } from "@wso2-enterprise/mi-core";
import MainPanel from "./MainPanel";
import { GettingStarted } from "./views/GettingStarted";
import { ProjectWizard } from "./views/Forms/ProjectForm";

export function Visualizer({ mode }: { mode: string }) {
    const { rpcClient } = useVisualizerContext();
    const [state, setState] = React.useState<MachineStateValue>('initialize');

    rpcClient?.onStateChanged((newState: MachineStateValue) => {
        setState(newState);
    });

    return (
        <>
            {(() => {
                switch (mode) {
                    case "visualizer":
                        return <VisualizerComponent state={state}/>
                    // TODO: Below is to render another webview in the activity panel
                    // case "activityPanel":
                    //     return <ActivityPanelComponent state={state}/>
                }
            })()}
        </>
    );
};

const VisualizerComponent = React.memo(({ state }: { state: MachineStateValue }) => {
    switch (true) {
        case typeof state === 'object' && 'ready' in state:
            return <MainPanel state={state} />;
        case typeof state === 'object' && 'newProject' in state && state.newProject === "welcome":
            return <GettingStarted />;
        case typeof state === 'object' && 'newProject' in state && state.newProject === "create":
            return <ProjectWizard />;

        default:
            return <h1>LOADING</h1>;
    }
});


// TODO: Remove below code if we don't need to have a webview for the activity panel
// const ActivityPanelComponent = ({ state }: { state: MachineStateValue }) => {
//     switch (true) {
//         case typeof state === 'object' && 'ready' in state:
//             return <GettingStartedPanel state={state} />;
//             // return <MainPanel state={state} />;
//         case typeof state === 'object' && 'newProject' in state:
//             return <GettingStartedPanel state={state} />;
//         default:
//             return <h1>LOADING</h1>;
//     }
// };
