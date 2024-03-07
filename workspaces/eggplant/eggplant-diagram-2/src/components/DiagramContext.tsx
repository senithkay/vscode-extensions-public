/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { Flow, NodeKind, TargetMetadata, Node } from "../utils/types";

export interface DiagramContextState {
    flow: Flow;
    componentPanel: {
        visible: boolean;
        show(): void;
        hide(): void;
    };
    addNode: {
        targetMetadata?: TargetMetadata;
        kind?: NodeKind;
        setTargetMetadata?(metadata: TargetMetadata): void;
        setKind?(kind: NodeKind): void;
    };
    onNodeUpdate: (node: Node) => void;
}

export const DiagramContext = React.createContext<DiagramContextState>({
    flow: { name: "", nodes: [], clients: [] },
    componentPanel: {
        visible: false,
        show: () => { },
        hide: () => { },
    },
    addNode: {},
    onNodeUpdate: () => { },
});

export const useDiagramContext = () => React.useContext(DiagramContext);

export function DiagramContextProvider(props: { children: React.ReactNode; value: DiagramContextState }) {
    // add node states
    const [addNodeTargetMetadata, setAddNodeTargetMetadata] = React.useState<TargetMetadata | undefined>();
    const [addNodeKind, setAddNodeKind] = React.useState<NodeKind | undefined>();
    // enrich context with optional states
    const ctx = {
        ...props.value,
        addNode: {
            targetMetadata: addNodeTargetMetadata,
            kind: addNodeKind,
            setTargetMetadata: setAddNodeTargetMetadata,
            setKind: setAddNodeKind,
        },
    };

    return <DiagramContext.Provider value={ctx}>{props.children}</DiagramContext.Provider>;
}
