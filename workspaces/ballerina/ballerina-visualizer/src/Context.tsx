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

export type PopupScreen = "EMPTY" | "ADD_CONNECTION";
interface VisualizerContext {
    popupScreen: PopupScreen;
    screenMetadata: any;
    setPopupScreen: (screen: PopupScreen) => void;
    setScreenMetadata: (metadata: any) => void;
}

export const VisualizerContext = createContext({
    popupScreen: "EMPTY",
    setPopupScreen: (screen: PopupScreen) => { },
} as VisualizerContext);

export function VisualizerContextProvider({ children }: { children: ReactNode }) {
    const [popupScreen, setPopupScreen] = useState("EMPTY" as PopupScreen);
    const [metadata, setMetadata] = useState({} as any);

    const contextValue: VisualizerContext = {
        popupScreen: popupScreen,
        screenMetadata: metadata,
        setPopupScreen: setPopupScreen,
        setScreenMetadata: setMetadata,
    };

    return <VisualizerContext.Provider value={contextValue}>{children}</VisualizerContext.Provider>;
}

export const useVisualizerContext = () => useContext(VisualizerContext);
