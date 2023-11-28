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
// import { ViewLocation, useVisualizerContext } from "@wso2-enterprise/ballerina-rpc-client";

export function Webview({ mode }: { mode: string }) {
    // const { viewLocation, setViewLocation, ballerinaRpcClient } = useVisualizerContext();

    // useEffect(() => {
    //     setViewLocationState();
    //     ballerinaRpcClient.onStateChanged((state: { viewContext: ViewLocation }) => {
    //         setViewLocation(state.viewContext);
    //     });
    // }, []);

    // const setViewLocationState = async () => {
    //     const state = await ballerinaRpcClient.getVisualizerClient().getVisualizerState();
    //     if (state) {
    //         setViewLocation(state);
    //     }
    // }
    return (
        <>
            {mode === "overview" && <h1>Overview</h1>}
            {mode === "lowcode" && <h1>LowCode</h1>}
        </>
    );
};