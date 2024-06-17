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
import { MachineStateValue, AIMachineStateValue } from "@wso2-enterprise/mi-core";
import MainPanel from "./MainPanel";
import { VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import styled from "@emotion/styled";
import AIPanel from "./AIPanel";
import { ErrorBoundary } from "@wso2-enterprise/ui-toolkit";
import { WelcomePanel } from "./WelcomePanel";
import { DisabledView } from "./views/Disabled";
import { RuntimeServicePanel } from "./RuntimeServicesPanel";

const LoaderWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50vh;
    width: 100vw;
`;

const ProgressRing = styled(VSCodeProgressRing)`
    height: 40px;
    width: 40px;
    margin-top: auto;
    padding: 4px;
`;

export function Visualizer({ mode }: { mode: string }) {
    const { rpcClient } = useVisualizerContext();
    const [state, setState] = React.useState<MachineStateValue | AIMachineStateValue>('initialize');

    rpcClient?.onStateChanged((newState: MachineStateValue | AIMachineStateValue) => {
        setState(newState);
    });

    useEffect(() => {
        rpcClient.webviewReady();
        if (mode === "ai") {
            rpcClient.getAIVisualizerState().then(context => {
                setState(context.state);
            });
        }
    }, []);

    return (
        <ErrorBoundary errorMsg="An error occurred in the MI Diagram" issueUrl="https://github.com/wso2/mi-vscode/issues">
            {(() => {
                switch (mode) {
                    case "visualizer":
                        return <VisualizerComponent state={state as MachineStateValue} />
                    case "ai":
                        return <AiVisualizerComponent state={state as AIMachineStateValue} />
                    case "runtime-services":
                        return <RuntimeServicesComponent />
                }
            })()}
        </ErrorBoundary>
    );
};

const VisualizerComponent = React.memo(({ state }: { state: MachineStateValue }) => {
    switch (true) {
        case typeof state === 'object' && 'ready' in state && state.ready === "viewReady":
            return <MainPanel />;
        case typeof state === 'object' && 'newProject' in state && state.newProject === "viewReady":
            return <WelcomePanel />;
        case state === 'disabled':
            return <DisabledView />
        default:
            return (
                <LoaderWrapper>
                    <ProgressRing />
                </LoaderWrapper>
            );
    }
});

const AiVisualizerComponent = React.memo(({ state }: { state: AIMachineStateValue }) => {
    switch (true) {
        case state !== 'Initialize':
            return <AIPanel />;
        default:
            return (
                <LoaderWrapper>
                    <ProgressRing />
                </LoaderWrapper>
            );
    }
});

const RuntimeServicesComponent = () => {
    return <RuntimeServicePanel />;
}
