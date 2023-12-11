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
import LowCode from './LowCode'
import Overview from './Overview'
import { useVisualizerContext } from "@wso2-enterprise/eggplant-rpc-client"
import styled from "@emotion/styled";
import { VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react"

export function Webview({ mode }: { mode: string }) {
    const { eggplantRpcClient } = useVisualizerContext();
    const [state, setState] = React.useState('Loading');

    eggplantRpcClient?.onStateChanged((newState: string) => {
        setState(newState);
    });

    useEffect(() => {
        if (eggplantRpcClient) {
            eggplantRpcClient.getWebviewRpcClient().getState().then(initialState => {
                setState(initialState);
            });
        }
    }, [eggplantRpcClient]);

    const LoaderContainer = styled.div({
        width: "100%",
        overflow: "hidden",
        height: "100vh",
        display: "grid"
    });

    const LoaderContent = styled.div({
        margin: "auto"
    });

    const Loader = () => {
        return (
            <LoaderContainer>
                <LoaderContent>
                    <VSCodeProgressRing />
                </LoaderContent>
            </LoaderContainer>
        )
    }

    return (
        <>
            {mode === "overview" &&
                <>
                    {state === 'ready' ? <Overview /> : <Loader />}
                </>
            }
            {mode === "lowcode" &&
                <>
                    {state === 'ready' ? <LowCode /> : <Loader />}
                </>
            }
        </>
    );
};