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

import React, { createContext, ReactNode, useEffect, useState } from 'react';
import { ComponentModel, ComponentModelDiagnostics, EditLayerAPI, Service, Views } from '../../../resources';

interface DiagramContextProps {
    children?: ReactNode;
    currentView: Views;
    editingEnabled: boolean;
    isChoreoProject: boolean;
    projectComponents: Map<string, ComponentModel>;
    projectDiagnostics: ComponentModelDiagnostics[];
    refreshDiagram: () => void;
    showChoreoProjectOverview: (() => Promise<void>) | undefined;
    getTypeComposition: (entityID: string) => void;
    setConnectorTarget: (service: Service) => void;
    editLayerAPI: EditLayerAPI | undefined;
}

interface IDiagramContext {
    editingEnabled: boolean;
    isChoreoProject: boolean;
    currentView: Views;
    componentDiagnostics: string[];
    refreshDiagram: () => void;
    showChoreoProjectOverview: (() => Promise<void>) | undefined;
    getTypeComposition: (entityID: string) => void;
    editLayerAPI?: EditLayerAPI;
    newComponentID?: string;
    newLinkNodes?: LinkedNodes;
    setNewComponentID?: (name: string | undefined) => void;
    setNewLinkNodes?: (nodes: LinkedNodes) => void;
    setConnectorTarget?: (service: Service) => void;
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
        isChoreoProject,
        editLayerAPI,
        refreshDiagram,
        getTypeComposition,
        showChoreoProjectOverview,
        setConnectorTarget,
        projectComponents,
        projectDiagnostics
    } = props;
    const [newComponentID, setNewComponentID] = useState<string | undefined>(undefined);
    const [newLinkNodes, setNewLinkNodes] = useState<LinkedNodes>({ source: undefined, target: undefined });
    const [componentDiagnostics, updateComponentDiagnostics] = useState<string[]>([]);

    let context: IDiagramContext = {
        currentView,
        editingEnabled,
        isChoreoProject,
        componentDiagnostics,
        refreshDiagram,
        getTypeComposition,
        showChoreoProjectOverview
    }

    if (editingEnabled) {
        context = {
            ...context,
            editLayerAPI,
            newComponentID,
            setNewComponentID,
            newLinkNodes,
            setNewLinkNodes,
            setConnectorTarget
        }
    }

    useEffect(() => {
        if (projectComponents) {
            if (!editingEnabled && projectDiagnostics.length > 0) {
                updateComponentDiagnostics(projectDiagnostics.map(entry => entry.name));
            } else if (editingEnabled) {
                const errorComponents: string[] = [];
                errorComponents.push(...projectDiagnostics.map(entry => entry.name));
                projectComponents.forEach((component) => {
                    if (component.hasCompilationErrors && !errorComponents.includes(component.packageId.name)) {
                        errorComponents.push(`${component.packageId.name} Package`);
                    }
                });
                updateComponentDiagnostics(errorComponents);
            }
        }
    }, [projectComponents]);

    return (
        <DiagramContext.Provider value={{ ...context }}>
            {children}
        </DiagramContext.Provider>
    );
}

export const useDiagramContext = () => React.useContext(DiagramContext);
