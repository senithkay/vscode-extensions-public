/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { ReactNode, useRef, useState, createContext, useContext } from "react";
import { BallerinaRpcClient, VisualizerContext, Context } from "@wso2-enterprise/ballerina-rpc-client";

export function VisualizerContextProvider({ children }: { children: ReactNode }) {
    const rpcClient = useRef(new BallerinaRpcClient());

    const contextValue: VisualizerContext = {
        rpcClient: rpcClient.current,
    };

    return <Context.Provider value={contextValue}>{children}</Context.Provider>;
}


interface EggplantContext {
    showPopup: boolean;
    setShowPopup: (showPopup: boolean) => void;
}

export const EggplantContext = createContext({
    showPopup: false,
    setShowPopup: (showPopup: boolean) => { },
} as EggplantContext);

export function EggplantContextProvider({ children }: { children: ReactNode }) {
    const [showPopup, setShowPopup] = useState(false);

    const contextValue = {
        showPopup: showPopup,
        setShowPopup: (showPopup: boolean) => {
            console.log(">>> setShowPopup", showPopup);
            setShowPopup(showPopup);
        },
    };

    console.log(">>> EggplantContextProvider", contextValue);

    return <EggplantContext.Provider value={contextValue}>{children}</EggplantContext.Provider>;
}


export const useEggplantContext = () => useContext(EggplantContext);
