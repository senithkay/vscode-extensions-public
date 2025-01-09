/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from "react";
import { Flow, NodeKind, FlowNode, Branch, LineRange, NodePosition, FlowNodeStyle } from "../utils/types";

export interface DiagramContextState {
    flow: Flow;
    componentPanel: {
        visible: boolean;
        show(): void;
        hide(): void;
    };
    showErrorFlow: boolean;
    onAddNode?: (parent: FlowNode | Branch, target: LineRange) => void;
    onAddNodePrompt?: (parent: FlowNode | Branch, target: LineRange, prompt: string) => void;
    onDeleteNode?: (node: FlowNode) => void;
    onAddComment?: (comment: string, target: LineRange) => void;
    onNodeSelect?: (node: FlowNode) => void;
    addBreakpoint?: (node: FlowNode) => void;
    removeBreakpoint?: (node: FlowNode) => void;
    onConnectionSelect?: (connectionName: string) => void;
    goToSource: (node: FlowNode) => void;
    openView: (filePath: string, position: NodePosition) => void;
    suggestions?: {
        fetching: boolean;
        onAccept(): void;
        onDiscard(): void;
    };
    projectPath?: string;
    readOnly?: boolean;
    lockCanvas?: boolean;
    setLockCanvas?: (lock: boolean) => void;
}

export const DiagramContext = React.createContext<DiagramContextState>({
    flow: { fileName: "", nodes: [], connections: [] },
    componentPanel: {
        visible: false,
        show: () => {},
        hide: () => {},
    },
    showErrorFlow: false,
    onAddNode: () => {},
    onAddNodePrompt: () => {},
    onDeleteNode: () => {},
    onAddComment: () => {},
    onNodeSelect: () => {},
    onConnectionSelect: () => {},
    goToSource: () => {},
    addBreakpoint: () => {},
    removeBreakpoint: () => {},
    openView: () => {},
    suggestions: {
        fetching: false,
        onAccept: () => {},
        onDiscard: () => {},
    },
    projectPath: "",
    readOnly: false,
    lockCanvas: false,
    setLockCanvas: (lock: boolean) => {},
});

export const useDiagramContext = () => React.useContext(DiagramContext);

export function DiagramContextProvider(props: { children: React.ReactNode; value: DiagramContextState }) {
    const [lockCanvas, setLockCanvas] = useState(false);
    
    const ctx = {
        ...props.value,
        lockCanvas,
        setLockCanvas,
    };

    return <DiagramContext.Provider value={ctx}>{props.children}</DiagramContext.Provider>;
}
