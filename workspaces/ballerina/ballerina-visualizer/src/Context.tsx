/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { ReactNode, useRef, useState, createContext, useContext } from "react";
import { BallerinaRpcClient, VisualizerContext as RpcContext, Context } from "@wso2-enterprise/ballerina-rpc-client";

export function RpcContextProvider({ children }: { children: ReactNode }) {
    const rpcClient = useRef(new BallerinaRpcClient());

    const contextValue: RpcContext = {
        rpcClient: rpcClient.current,
    };

    return <Context.Provider value={contextValue}>{children}</Context.Provider>;
}

interface VisualizerContext {
    showPopup: boolean;
    setShowPopup: (showPopup: boolean) => void;
}

export const VisualizerContext = createContext({
    showPopup: false,
    setShowPopup: (showPopup: boolean) => {},
} as VisualizerContext);

export function VisualizerContextProvider({ children }: { children: ReactNode }) {
    const [showPopup, setShowPopup] = useState(false);

    const contextValue = {
        showPopup: showPopup,
        setShowPopup: setShowPopup,
    };

    return <VisualizerContext.Provider value={contextValue}>{children}</VisualizerContext.Provider>;
}

export const useVisualizerContext = () => useContext(VisualizerContext);
