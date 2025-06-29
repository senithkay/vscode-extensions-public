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
    const [currentView, setCurrentView] = useState<string | undefined>("loading");
    const [view, setView] = useState<any>(undefined);

    const goHome = () => {
        rpcClient.getMiVisualizerRpcClient().goHome();
    };

    useEffect(() => {
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
                }
            } else if (newState === 'disabled') {
                setCurrentView('disabled');
            }

            rpcClient.getVisualizerState().then((initialState) => {
                setState(newState);
                process.env = initialState.env || {};
                if (Object.values(newState)?.[0] === 'viewReady') {
                    setVisualizerState(initialState);
                }
            });
        });
    }, []);

    useEffect(() => {
        rpcClient.webviewReady();
        if (mode === "ai") {
            rpcClient.getAIVisualizerState().then(context => {
                setState(context.state);
            });
        }
    }, [rpcClient]);

    useEffect(() => {
        if (mode === MODES.VISUALIZER) {
            switch (currentView) {
                case 'main':
                    setView(<>{visualizerState && <MainPanel visualizerState={visualizerState} />}</>);
                    break;
                case 'welcome':
                    setView(<>{visualizerState && <WelcomePanel machineView={visualizerState.view} />}</>);
                    break;
                case 'environmentSetup':
                    setView(<EnvironmentSetup />);
                    break;
                case 'disabled':
                    setView(<DisabledView />);
                    break;
                case 'loading':
                    setView(
                        <LoaderWrapper>
                            <ProgressRing />
                        </LoaderWrapper>
                    );
            }
        } else if (mode === MODES.AI) {
            setView(<>{state && <AiVisualizerComponent state={state as AIMachineStateValue} />}</>);
        } else if (mode === MODES.RUNTIME_SERVICES) {
            setView(<RuntimeServicesComponent />);
        } else if (mode === MODES.SWAGGER) {
            setView(<>{swaggerData && <SwaggerComponent data={swaggerData} />}</>);
        }
    }, [mode, currentView, visualizerState, state, swaggerData]);

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

    return (
        <React.Fragment>
            {currentView === 'updating' && (
                <ProgressIndicator />
            )}
            <ErrorBoundary goHome={goHome} errorMsg="An error occurred in the MI Diagram" issueUrl={gitIssueUrl} ref={errorBoundaryRef}>
                {view}
            </ErrorBoundary>
        </React.Fragment>
    );

};
