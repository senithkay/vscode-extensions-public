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

    return (
        <>
            {mode === "overview" &&
                <>
                    {getStateValues(state)[0] === 'ready' ? <Overview /> : <Loader />}
                </>
            }
            {mode === "lowcode" &&
                <>
                    {getStateValues(state)[0] === 'ready' ? <LowCode state={getStateValues(state)[1]} /> : <Loader />}
                </>
            }
        </>
    );
};

function getStateValues(state: string) {
    return state.split(".");
}
