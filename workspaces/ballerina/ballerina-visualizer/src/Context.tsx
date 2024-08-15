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
import { NodePosition, STNode } from "@wso2-enterprise/syntax-tree";

export function RpcContextProvider({ children }: { children: ReactNode }) {
    const rpcClient = useRef(new BallerinaRpcClient());

    const contextValue: RpcContext = {
        rpcClient: rpcClient.current,
    };

    return <Context.Provider value={contextValue}>{children}</Context.Provider>;
}

export enum PanelType {
    STATEMENTEDITOR = "STATEMENTEDITOR",
    CONSTRUCTPANEL = "CONSTRUCTPANEL",
};

interface PanelDetails {
    isActive: boolean;
    name?: PanelType;
    contentUpdated?: boolean;
}

interface VisualizerContext {
    showPopup: boolean;
    setShowPopup: (showPopup: boolean) => void;
    activePanel: PanelDetails;
    setActivePanel: (panelDetails: PanelDetails) => void;
    statementPosition: NodePosition;
    setStatementPosition: (position: NodePosition) => void;
    parsedST: STNode;
    setParsedST: (parsedST: STNode) => void;
}

export const VisualizerContext = createContext({
    showPopup: false,
    setShowPopup: (showPopup: boolean) => { },
    activePanel: { isActive: false },
    setActivePanel: (panelDetails: PanelDetails) => { },
    statementPosition: undefined,
    setStatementPosition: (position: NodePosition) => { },
    parsedST: undefined,
    setParsedST: (parsedST: STNode) => { }
} as VisualizerContext);

export function VisualizerContextProvider({ children }: { children: ReactNode }) {
    const [showPopup, setShowPopup] = useState(false);
    const [activePanel, setActivePanel] = useState({ isActive: false });
    const [statementPosition, setStatementPosition] = useState<NodePosition>();
    const [parsedST, setParsedST] = useState<STNode>();


    const contextValue = {
        showPopup: showPopup,
        setShowPopup: setShowPopup,
        activePanel: activePanel,
        setActivePanel: setActivePanel,
        statementPosition: statementPosition,
        setStatementPosition: setStatementPosition,
        parsedST: parsedST,
        setParsedST: setParsedST
    };

    return <VisualizerContext.Provider value={contextValue}>{children}</VisualizerContext.Provider>;
}

export const useVisualizerContext = () => useContext(VisualizerContext);
