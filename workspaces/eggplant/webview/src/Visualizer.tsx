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
import { EggplantRpcClient } from "@wso2-enterprise/eggplant-rpc-client";

export function Webview({ mode }: { mode: string }) {
    // const { viewLocation, setViewLocation, eggplantRpcClient } = useVisualizerContext();

    useEffect(() => {
        const rpc = new EggplantRpcClient();
        rpc.getWebviewRpcClient().getHelloWorld().then(res => {
            console.log(res);
        });
    }, []);


    // const setViewLocationState = async () => {
    //     const state = await eggplantRpcClient.getVisualizerClient().getVisualizerState();
    //     if (state) {
    //         setViewLocation(state);
    //     }
    // }
    return (
        <>
            {mode === "overview" && <Overview />}
            {mode === "lowcode" && <LowCode />}
        </>
    );
};