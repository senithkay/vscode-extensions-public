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
import { ElementLocation, Service } from '@wso2-enterprise/ballerina-languageclient';
import { ConsoleView, EditLayerAPI, Views } from '../../../resources';

interface DiagramContextProps {
    children?: ReactNode;
    currentView: Views;
    editingEnabled: boolean;
    isChoreoProject: boolean;
    hasDiagnostics: boolean;
    setCurrentView: (view: Views) => void;
    refreshDiagram: () => void;
    showChoreoProjectOverview: (() => Promise<void>) | undefined;
    getTypeComposition: (entityID: string) => void;
    setConnectorTarget: (service: Service) => void;
    editLayerAPI: EditLayerAPI | undefined;
    deleteComponent: (location: ElementLocation, deletePkg: boolean) => Promise<void>;
    consoleView: ConsoleView;
    addComponent?: () => void;
}

interface IDiagramContext {
    editingEnabled: boolean;
    isChoreoProject: boolean;
    consoleView: ConsoleView;
    currentView: Views;
    hasDiagnostics: boolean;
    refreshDiagram: () => void;
    setCurrentView: (view: Views) => void;
    showChoreoProjectOverview: (() => Promise<void>) | undefined;
    getTypeComposition: (entityID: string) => void;
    editLayerAPI?: EditLayerAPI;
    newComponentID?: string;
    newLinkNodes?: LinkedNodes;
    setNewComponentID?: (name: string | undefined) => void;
    setNewLinkNodes?: (nodes: LinkedNodes) => void;
    setConnectorTarget?: (service: Service) => void;
    deleteComponent?: (location: Location, deletePkg: boolean) => Promise<void> | undefined;
    addComponent?: () => void;
}

interface LinkedNodes {
    source: Service | undefined;
    target: Service | undefined;
}

const defaultState: any = {};
export const DiagramContext = createContext<IDiagramContext>(defaultState);

export function DesignDiagramContext(props: DiagramContextProps) {
    const {
        children,
        currentView,
        editingEnabled,
        hasDiagnostics,
        isChoreoProject,
        consoleView,
        editLayerAPI,
        setCurrentView,
        refreshDiagram,
        getTypeComposition,
        showChoreoProjectOverview,
        setConnectorTarget,
        deleteComponent,
        addComponent
    } = props;
    const [newComponentID, setNewComponentID] = useState<string | undefined>(undefined);
    const [newLinkNodes, setNewLinkNodes] = useState<LinkedNodes>({ source: undefined, target: undefined });

    let context: IDiagramContext = {
        currentView,
        editingEnabled,
        isChoreoProject,
        consoleView,
        hasDiagnostics,
        setCurrentView,
        refreshDiagram,
        getTypeComposition,
        showChoreoProjectOverview,
        addComponent
    }

    if (editingEnabled) {
        context = {
            ...context,
            editLayerAPI,
            newComponentID,
            consoleView,
            setNewComponentID,
            newLinkNodes,
            setNewLinkNodes,
            setConnectorTarget,
            deleteComponent,
            addComponent
        }
    }

    return (
        <DiagramContext.Provider value={{ ...context }}>
            {children}
        </DiagramContext.Provider>
    );
}

export const useDiagramContext = () => React.useContext(DiagramContext);
