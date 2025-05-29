/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from 'react';
import { AIMachineStateValue, AI_EVENT_TYPE } from '@wso2-enterprise/mi-core';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { Alert } from '@wso2-enterprise/ui-toolkit';
import { LoaderWrapper, ProgressRing } from './styles';
import { AICodeGenerator }  from './component/AICodeGenerator';
import { SignInToCopilotMessage } from '../LoggedOutWindow';
import { WaitingForLoginMessage } from '../WaitingForLoginWindow';
import { DisabledMessage } from '../DisabledWindow';
import { UpdateMIExtension } from '../UpdateExtension';
import { MICopilotContextProvider } from "./component/MICopilotContext";

export const AIPanel = () => {
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
                    setViewComponent(
                        <MICopilotContextProvider>
                            <AICodeGenerator />
                        </MICopilotContextProvider>
                    );
                    break;
                case "loggedOut":
                    setViewComponent(<SignInToCopilotMessage />);
                    break;
                case "WaitingForLogin":
                    setViewComponent(<WaitingForLoginMessage />);
                    break;
                case "notSupported":
                    setViewComponent(
                        <div style={{ padding: "20px", textAlign: "center" }}>
                            <Alert
                                variant='primary'
                                title="MI Copilot Chat is not supported when multiple workspaces are open"
                                subTitle="We're working on bringing multiple workspace support to MI Copilot Chat in the future."
                            />
                        </div>
                    )
                    break;
                case "disabled":
                    setViewComponent(<DisabledMessage />);
                    break;
                case "updateExtension":
                    setViewComponent(<UpdateMIExtension />);
                    break;
                default:
                    setViewComponent(null);
            }
        }).catch((error) => {
            console.error("Error fetching AI visualizer state:", error);
        });

    }

    return (
            <div style={{
                height: "100%"
            }}>
                {!viewComponent ? (
                    <LoaderWrapper>
                        <ProgressRing />
                    </LoaderWrapper>
                ) : <div style={{ height: "100%" }}>
                    {viewComponent}
                </div>}
            </div>
    );
};
