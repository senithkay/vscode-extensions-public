/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

import React, { createContext, ReactNode, useState } from 'react';
import { CMEntryPoint as EntryPoint, CMLocation as Location, CMService as Service } from '@wso2-enterprise/ballerina-languageclient';
import { EntryNodeModel, ServiceNodeModel } from '../../service-interaction';
import { ConsoleView, EditLayerAPI, Views } from '../../../resources';

interface DiagramContextProps {
    children?: ReactNode;
    currentView: Views;
    editingEnabled: boolean;
    isChoreoProject: boolean;
    hasDiagnostics: boolean;
    workspaceFolders: number;
    setCurrentView: (view: Views) => void;
    refreshDiagram: () => void;
    showChoreoProjectOverview: (() => Promise<void>) | undefined;
    getTypeComposition: (entityID: string) => void;
    setConnectorTarget?: (source: EntryPoint | Service) => void;
    editLayerAPI: EditLayerAPI | undefined;
    deleteComponent: (location: Location, deletePkg: boolean) => Promise<void>;
    consoleView: ConsoleView;
    addComponent?: () => void;
}

interface IDiagramContext {
    editingEnabled: boolean;
    isChoreoProject: boolean;
    consoleView: ConsoleView;
    currentView: Views;
    hasDiagnostics: boolean;
    isMultiRootWs: boolean;
    refreshDiagram: () => void;
    setIsMultiRootWs: (status: boolean) => void;
    setCurrentView: (view: Views) => void;
    getTypeComposition: (entityID: string) => void;
    editLayerAPI?: EditLayerAPI;
    newComponentID?: string;
    newLinkNodes?: LinkedNodes;
    setNewComponentID?: (name: string | undefined) => void;
    setNewLinkNodes?: (nodes: LinkedNodes) => void;
    setConnectorTarget?: (source: EntryPoint | Service) => void;
    deleteComponent?: (location: Location, deletePkg: boolean) => Promise<void> | undefined;
    addComponent?: () => void;
}

interface LinkedNodes {
    source: ServiceNodeModel | EntryNodeModel;
    target: ServiceNodeModel;
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
        workspaceFolders,
        consoleView,
        editLayerAPI,
        setCurrentView,
        refreshDiagram,
        getTypeComposition,
        setConnectorTarget,
        deleteComponent,
        addComponent
    } = props;
    const [newComponentID, setNewComponentID] = useState<string | undefined>(undefined);
    const [newLinkNodes, setNewLinkNodes] = useState<LinkedNodes>({ source: undefined, target: undefined });
    const [isMultiRootWs, setIsMultiRootWs] = useState<boolean>(workspaceFolders > 1 ? true : undefined);

    let context: IDiagramContext = {
        currentView,
        editingEnabled,
        isChoreoProject,
        consoleView,
        hasDiagnostics,
        isMultiRootWs,
        setCurrentView,
        setIsMultiRootWs,
        refreshDiagram,
        getTypeComposition,
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
