/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { createContext, ReactNode } from "react";
import { MenuItem } from "..";

interface IDiagramContext {
    selectedNodeId: string;
    hasDiagnostics: boolean;
    focusedNodeId?: string;
    observationVersion?: string;
    componentMenu?: MenuItem[];
    setHasDiagnostics: (hasDiagnostics: boolean) => void;
    setSelectedNodeId: (id: string) => void;
    setFocusedNodeId?: (id: string) => void;
    setObservationVersion?: (version: string) => void;
    onComponentDoubleClick?: (componentId: string) => void;
}

interface DiagramContextProps extends IDiagramContext {
    children: ReactNode;
}

const defaultState: any = {};
export const DiagramContext = createContext<IDiagramContext>(defaultState);

export function CellDiagramContext(props: DiagramContextProps) {
    const {
        children,
        selectedNodeId,
        hasDiagnostics,
        focusedNodeId,
        observationVersion,
        componentMenu,
        setSelectedNodeId,
        setHasDiagnostics,
        setFocusedNodeId,
        setObservationVersion,
        onComponentDoubleClick,
    } = props;

    const context: IDiagramContext = {
        selectedNodeId,
        hasDiagnostics,
        focusedNodeId,
        observationVersion,
        componentMenu,
        setSelectedNodeId,
        setHasDiagnostics,
        setFocusedNodeId,
        setObservationVersion,
        onComponentDoubleClick,
    };

    return <DiagramContext.Provider value={{ ...context }}>{children}</DiagramContext.Provider>;
}

export const useDiagramContext = () => React.useContext(DiagramContext);
