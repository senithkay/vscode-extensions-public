/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import React, { createContext, ReactNode } from 'react';

interface DiagramContextProps {
    selectedNodeId: string;
    hasDiagnostics: boolean;
    setHasDiagnostics: (hasDiagnostics: boolean) => void;
    setSelectedNodeId: (id: string) => void;
    children: ReactNode;
}

interface IDiagramContext {
    selectedNodeId: string;
    hasDiagnostics: boolean;
    setHasDiagnostics: (hasDiagnostics: boolean) => void;
    setSelectedNodeId: (id: string) => void;
}

const defaultState: any = {};
export const DiagramContext = createContext<IDiagramContext>(defaultState);

export function PersistDiagramContext(props: DiagramContextProps) {
    const { selectedNodeId, setSelectedNodeId, setHasDiagnostics, hasDiagnostics, children } = props;

    let context: IDiagramContext = {
        selectedNodeId,
        hasDiagnostics,
        setHasDiagnostics,
        setSelectedNodeId
    }

    return (
        <DiagramContext.Provider value={{ ...context }}>
            {children}
        </DiagramContext.Provider>
    );
}

export const useDiagramContext = () => React.useContext(DiagramContext);
