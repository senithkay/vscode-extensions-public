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

interface ComponentInfo {
    model: STNode;
    position: NodePosition;
    componentType: string;
}

export type PopupScreen = "EMPTY" | "ADD_CONNECTION";
export type SidePanel = "EMPTY" | "RECORD_EDITOR";

interface VisualizerContext {
    popupScreen: PopupScreen;
    sidePanel: SidePanel;
    screenMetadata: any;
    setPopupScreen: (screen: PopupScreen) => void;
    setSidePanel: (panel: SidePanel) => void;
    setScreenMetadata: (metadata: any) => void;
    activePanel: PanelDetails;
    setActivePanel: (panelDetails: PanelDetails) => void;
    statementPosition: NodePosition;
    setStatementPosition: (position: NodePosition) => void;
    parsedST: STNode;
    setParsedST: (parsedST: STNode) => void;
    componentInfo?: ComponentInfo;
    setComponentInfo?: (componentInfo: ComponentInfo) => void;
}

export const VisualizerContext = createContext({
    popupScreen: "EMPTY",
    setPopupScreen: (screen: PopupScreen) => {  },
    activePanel: { isActive: false },
    setActivePanel: (panelDetails: PanelDetails) => { },
    statementPosition: undefined,
    setStatementPosition: (position: NodePosition) => { },
    parsedST: undefined,
    setParsedST: (parsedST: STNode) => { },
    componentInfo: undefined,
    setComponentInfo: (componentInfo: ComponentInfo) => { },

} as VisualizerContext);

export function VisualizerContextProvider({ children }: { children: ReactNode }) {
    const [popupScreen, setPopupScreen] = useState("EMPTY" as PopupScreen);
    const [sidePanel, setSidePanel] = useState("EMPTY" as SidePanel);
    const [metadata, setMetadata] = useState({} as any);
    const [activePanel, setActivePanel] = useState({ isActive: false });
    const [statementPosition, setStatementPosition] = useState<NodePosition>();
    const [parsedST, setParsedST] = useState<STNode>();
    const [componentInfo, setComponentInfo] = useState<ComponentInfo>();


    const contextValue: VisualizerContext = {
        popupScreen: popupScreen,
        sidePanel: sidePanel,
        screenMetadata: metadata,
        setPopupScreen: setPopupScreen,
        setSidePanel: setSidePanel,
        setScreenMetadata: setMetadata,
        activePanel: activePanel,
        setActivePanel: setActivePanel,
        statementPosition: statementPosition,
        setStatementPosition: setStatementPosition,
        parsedST: parsedST,
        setParsedST: setParsedST,
        componentInfo: componentInfo,
        setComponentInfo: setComponentInfo,
    };

    return <VisualizerContext.Provider value={contextValue}>{children}</VisualizerContext.Provider>;
}

export const useVisualizerContext = () => useContext(VisualizerContext);
