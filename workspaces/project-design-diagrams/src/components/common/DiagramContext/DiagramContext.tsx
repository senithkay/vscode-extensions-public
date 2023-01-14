/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
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

import React, { createContext, ReactNode, useState } from 'react';
import { Location, Service, Views } from '../../../resources';

interface DiagramContextProps {
    children?: ReactNode;
    getTypeComposition: (entityID: string) => void;
    go2source: (location: Location) => void;
    currentView: Views;
    editingEnabled: boolean;
    setTargetService: (service: Service) => void;
}

interface IDiagramContext {
    getTypeComposition: (entityID: string) => void;
    go2source: (location: Location) => void;
    currentView: Views;
    setNewComponentID: (name: string) => void;
    newComponentID: string;
    editingEnabled: boolean;
    newLinkNodes: LinkedNodes;
    setNewLinkNodes: (nodes: LinkedNodes) => void;
    setTargetService: (service: Service) => void;
}

interface LinkedNodes {
    source: Service,
    target: Service
}

const defaultState: any = {};
export const DiagramContext = createContext<IDiagramContext>(defaultState);

export function DesignDiagramContext(props: DiagramContextProps) {
    const [newComponentID, setNewComponentID] = useState<string>(undefined);
    const [newLinkNodes, setNewLinkNodes] = useState<LinkedNodes>({ source: undefined, target: undefined });

    const { getTypeComposition, currentView, go2source, editingEnabled, children, setTargetService } = props;

    const Ctx = {
        getTypeComposition,
        go2source,
        currentView,
        setNewComponentID,
        newComponentID,
        editingEnabled,
        newLinkNodes,
        setNewLinkNodes,
        setTargetService
    }

    return (
        <DiagramContext.Provider value={{ ...Ctx }}>
            {children}
        </DiagramContext.Provider>
    );
}
