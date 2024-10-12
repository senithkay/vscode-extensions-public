/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { Flow, NodeKind, FlowNode, Branch, LineRange, NodePosition, FlowNodeStyle } from "../utils/types";

export interface DiagramContextState {
    flow: Flow;
    componentPanel: {
        visible: boolean;
        show(): void;
        hide(): void;
    };
    showErrorFlow: boolean;
    onAddNode: (parent: FlowNode | Branch, target: LineRange) => void;
    onDeleteNode: (node: FlowNode) => void;
    onAddComment: (comment: string, target: LineRange) => void;
    onNodeSelect: (node: FlowNode) => void;
    goToSource: (node: FlowNode) => void;
    openView: (filePath: string, position: NodePosition) => void;
    suggestions?: {
        fetching: boolean;
        onAccept(): void;
        onDiscard(): void;
    };
    projectPath?: string;
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
    onDeleteNode: () => {},
    onAddComment: () => {},
    onNodeSelect: () => {},
    goToSource: () => {},
    openView: () => {},
    suggestions: {
        fetching: false,
        onAccept: () => {},
        onDiscard: () => {},
    },
    projectPath: "",
});

export const useDiagramContext = () => React.useContext(DiagramContext);

export function DiagramContextProvider(props: { children: React.ReactNode; value: DiagramContextState }) {
    // add node states
    // const [addNodeTargetMetadata, setAddNodeTargetMetadata] = React.useState<TargetMetadata | undefined>();
    const [addNodeKind, setAddNodeKind] = React.useState<NodeKind | undefined>();
    // enrich context with optional states
    const ctx = {
        ...props.value,
    };

    return <DiagramContext.Provider value={ctx}>{props.children}</DiagramContext.Provider>;
}
