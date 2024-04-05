/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from 'react';
import { AIMachineStateValue, AI_EVENT_TYPE, AI_MACHINE_VIEW } from '@wso2-enterprise/mi-core';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { VSCodeProgressRing } from '@vscode/webview-ui-toolkit/react';
import styled from '@emotion/styled';
import { AIOverviewWindow } from './views/AIOverviewWindow';
import { AIChat } from './views/AIChat';
import { AIArtifactWindow } from './views/AIArtifactWindow';
import {SignInToCopilotMessage} from './views/LoggedOutWindow';

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

const AiPanel = () => {
    const { rpcClient } = useVisualizerContext();
    const [viewComponent, setViewComponent] = useState<React.ReactNode>();
    const [state, setState] = React.useState<AIMachineStateValue>();


    rpcClient?.onAIStateChanged((newState: AIMachineStateValue) => {
        setState(newState);
    });

    useEffect(() => {
        fetchContext();
    }, [state]);

    const login = () => { 
        rpcClient.sendAIStateEvent(AI_EVENT_TYPE.LOGIN);
    }

    const fetchContext = () => {
        rpcClient.getAIVisualizerState().then((machineView) => {
            switch (machineView?.state) {
                case "Ready":
                    setViewComponent(<AIOverviewWindow />);
                    break;
                case "loggedOut":
                    setViewComponent(<SignInToCopilotMessage />);
                    break;
                case "WaitingForLogin":
                    setViewComponent(<h1>Waiting for login</h1>);
                    break;
                default:
                    setViewComponent(null);
            }
        });
    }

    return (
            <div style={{
                overflow: "hidden",
                height:"100%"
            }}>
                {!viewComponent ? (
                    <LoaderWrapper>
                        <ProgressRing />
                    </LoaderWrapper>
                ) : <div style={{height:"100%"}}>
                    {viewComponent}
                </div>}
            </div>
    );
};

export default AiPanel;   
