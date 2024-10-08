/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { createContext, ReactNode } from 'react';
import { NodePosition } from '@wso2-enterprise/ballerina-core';

interface DiagramContextProps {
    children?: ReactNode;
    hasDiagnostics: boolean;
    focusedNodeId?: string;
    setFocusedNodeId?: (id: string) => void;
    goToSource?: (filePath: string, position: NodePosition) => void;
}

interface IDiagramContext {
    hasDiagnostics: boolean;
    focusedNodeId?: string;
    setFocusedNodeId?: (id: string) => void;
    goToSource?: (filePath: string, position: NodePosition) => void;
}

const defaultState: any = {};
export const DiagramContext = createContext<IDiagramContext>(defaultState);

export function DesignDiagramContext(props: DiagramContextProps) {
    const {
        children,
        hasDiagnostics,
        focusedNodeId,
        setFocusedNodeId,
        goToSource
    } = props;

    let context: IDiagramContext = {
        hasDiagnostics,
        focusedNodeId,
        setFocusedNodeId,
        goToSource
    }

    return (
        <DiagramContext.Provider value={{ ...context }}>
            {children}
        </DiagramContext.Provider>
    );
}

export const useDiagramContext = () => React.useContext(DiagramContext);
