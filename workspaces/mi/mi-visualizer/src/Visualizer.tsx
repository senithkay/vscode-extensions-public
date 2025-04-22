/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { createRef, useEffect, useState } from "react";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { MachineStateValue, AIMachineStateValue, SwaggerData, VisualizerLocation } from "@wso2-enterprise/mi-core";
import MainPanel from "./MainPanel";
import { VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import styled from "@emotion/styled";
import { AIPanel } from "./views/AIPanel";
import { ErrorBoundary, ProgressIndicator } from "@wso2-enterprise/ui-toolkit";
import { WelcomePanel } from "./WelcomePanel";
import { DisabledView } from "./views/Disabled";
import { RuntimeServicePanel } from "./RuntimeServicesPanel";
import { SwaggerPanel } from "./SwaggerPanel";
import { gitIssueUrl } from "./constants";
import { EnvironmentSetup } from "./views/EnvironmentSetup";

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

const MODES = {
    VISUALIZER: "visualizer",
    AI: "ai",
    RUNTIME_SERVICES: "runtime-services",
    SWAGGER: "swagger"
};

export function Visualizer({ mode, swaggerData }: { mode: string, swaggerData?: SwaggerData }) {
    const { rpcClient } = useVisualizerContext();
    const errorBoundaryRef = createRef<any>();
    const [state, setState] = React.useState<MachineStateValue | AIMachineStateValue>('initialize');
    const [visualizerState, setVisualizerState] = useState<VisualizerLocation>();
    const [currentView, setCurrentView] = useState<string | undefined>(undefined);

    const handleResetError = () => {
        if (errorBoundaryRef.current) {
            errorBoundaryRef.current.resetErrorBoundary();
        }
    };

    const goHome = () => {
        rpcClient.getMiVisualizerRpcClient().goHome();
    };

    rpcClient?.onStateChanged((newState: MachineStateValue | AIMachineStateValue) => {
        if (state === newState) {
            return;
        }

        // Set the current view based on the state
        if (typeof newState === 'object') {
            if ('ready' in newState && newState.ready === "viewReady") {
                setCurrentView('main');
            } else if ('newProject' in newState && newState.newProject === "viewReady") {
                setCurrentView('welcome');
            } else if ('environmentSetup' in newState && newState.environmentSetup === "viewReady") {
                setCurrentView('environmentSetup');
            } else if (currentView === 'main') {
                return setCurrentView('updating');
            } else {
                setCurrentView('loading');
            }
        } else if (newState === 'disabled') {
            setCurrentView('disabled');
        } else if (currentView !== 'main') {
            setCurrentView('loading');
        }

        rpcClient.getVisualizerState().then((initialState) => {
            setState(newState);
            setVisualizerState(initialState);
        });
    });

    useEffect(() => {
        rpcClient.webviewReady();
        if (mode === "ai") {
            rpcClient.getAIVisualizerState().then(context => {
                setState(context.state);
            });
        }
    }, [rpcClient]);


    const VisualizerComponent = React.memo(({ state, visualizerState }: { state: MachineStateValue, visualizerState: VisualizerLocation }) => {
        switch (currentView) {
            case 'main':
                return <MainPanel visualizerState={visualizerState} />;
            case 'welcome':
                return <WelcomePanel machineView={visualizerState.view} />;
            case 'environmentSetup':
                return <EnvironmentSetup />;
            case 'disabled':
                return <DisabledView />;
            case 'loading':
            default:
                return (
                    <LoaderWrapper>
                        <ProgressRing />
                    </LoaderWrapper>
                );
        }
    });

    const AiVisualizerComponent = React.memo(({ state }: { state: AIMachineStateValue }) => {
        if (state !== 'Initialize') {
            return <AIPanel />;
        } else {
            return (
                <LoaderWrapper>
                    <ProgressRing />
                </LoaderWrapper>
            );
        }
    });

    const RuntimeServicesComponent = React.memo(() => {
        return <RuntimeServicePanel />;
    });

    const SwaggerComponent = React.memo(({ data }: { data: SwaggerData }) => {
        if (!data) {
            return (
                <LoaderWrapper>
                    <ProgressRing />
                </LoaderWrapper>
            );
        }
        return <SwaggerPanel swaggerData={data} />;
    });

    const MainComponent = React.useMemo(() => (
        <ErrorBoundary goHome={goHome} errorMsg="An error occurred in the MI Diagram" issueUrl={gitIssueUrl} ref={errorBoundaryRef}>
            {(() => {
                switch (mode) {
                    case MODES.VISUALIZER:
                        return <VisualizerComponent state={state as MachineStateValue} visualizerState={visualizerState} />;
                    case MODES.AI:
                        return <AiVisualizerComponent state={state as AIMachineStateValue} />;
                    case MODES.RUNTIME_SERVICES:
                        return <RuntimeServicesComponent />;
                    case MODES.SWAGGER:
                        return <SwaggerComponent data={swaggerData} />;
                }
            })()}
        </ErrorBoundary>
    ), [mode, state, visualizerState, swaggerData]);

    return (
        <React.Fragment>
            {currentView === 'updating' && (
                <ProgressIndicator />
            )}
            {MainComponent}
        </React.Fragment>
    );

};
