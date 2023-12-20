/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

// import { Overview } from "@wso2-enterprise/overview-view";
// import { ServiceDesigner } from "@wso2-enterprise/service-designer-view";
import React, { useEffect } from "react";
import LowCode from './LowCode';
import Overview from './Overview';
import { useVisualizerContext } from "@wso2-enterprise/eggplant-rpc-client";
import { Loader } from "./Loader";
import { MachineStateValue } from "@wso2-enterprise/eggplant-core";
import InitProject from "./components/overview/InitProject";
import ProjectForm from "./components/lowcode/ProjectForm";


export function Webview({ mode }: { mode: string }) {
    const { eggplantRpcClient } = useVisualizerContext();
    const [state, setState] = React.useState<MachineStateValue>('initialize');

    eggplantRpcClient?.onStateChanged((newState: MachineStateValue) => {
        setState(newState);
    });

    useEffect(() => {
        if (eggplantRpcClient) {
            eggplantRpcClient.getWebviewRpcClient().getState().then(initialState => {
                setState(initialState);
            });
        }
    }, [eggplantRpcClient]);

    return (
        <>
            {(() => {
                switch (mode) {
                    case "overview":
                        return <OverviewComponent state={state} />;
                    case "lowcode":
                        return <LowCodeComponent state={state} />;
                }
            })()}
        </>
    );
};

const OverviewComponent = ({ state }: { state: MachineStateValue }) => {
    switch (true) {
        case typeof state === 'object' && 'ready' in state:
            return <Overview />;
        case typeof state === 'string' && state === 'newProject':
            return <InitProject />;
        default:
            return <Loader />;
    }
};

const LowCodeComponent = ({ state }: { state: MachineStateValue }) => {
    switch (true) {
        case typeof state === 'object' && 'ready' in state:
            return <LowCode state={state} />;
        case typeof state === 'string' && state === 'newProject':
            return <ProjectForm />;
        default:
            return <Loader />;
    }
};
