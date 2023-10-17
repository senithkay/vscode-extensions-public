/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
    ComponentModel,
    CMEntryPoint as EntryPoint,
    CMLocation as Location,
    GetComponentModelResponse,
    CMService as Service,
    ComponentModelDeprecated
} from '@wso2-enterprise/ballerina-languageclient';
import { DiagramModel } from '@projectstorm/react-diagrams';
import CircularProgress from '@mui/material/CircularProgress';
import styled from '@emotion/styled';
import { DesignDiagramContext, DiagramContainer, DiagramHeader, PromptScreen } from './components/common';
import { ConnectorWizard } from './components/connector/ConnectorWizard';
import { Colors, ConsoleView, DagreLayout, EditLayerAPI, Views } from './resources';
import { createRenderPackageObject, generateCompositionModel } from './utils';
import { EditForm } from './editing';

import './resources/assets/font/fonts.css';
import { isVersionBelow, transformToV4Models } from "./utils/utils";

interface ContainerStyleProps {
    backgroundColor?: string;
}

const Container: React.FC<any> = styled.div`
    align-items: center;
    background: ${(props: ContainerStyleProps) => `${props.backgroundColor}`};
    display: flex;
    flex-direction: column;
    font-family: GilmerRegular;
    justify-content: center;
    height: 100%;
    width: 100%;
`;

interface DiagramProps {
    isEditable: boolean;
    isChoreoProject: boolean;
    isCellView?: boolean;
    selectedNodeId?: string;
    getComponentModel(): Promise<GetComponentModelResponse>;
    showChoreoProjectOverview?: () => Promise<void>;
    deleteComponent?: (location: Location, deletePkg: boolean) => Promise<void>;
    editLayerAPI?: EditLayerAPI;
    consoleView?: ConsoleView;
    addComponent?: () => void;
}

export function DesignDiagram(props: DiagramProps) {
    const {
        isChoreoProject,
        isEditable,
        selectedNodeId,
        getComponentModel,
        showChoreoProjectOverview = undefined,
        editLayerAPI = undefined,
        consoleView = undefined,
        deleteComponent = undefined,
        addComponent = undefined,
        isCellView = false,
    } = props;

    const currentViewDefaultValue = (consoleView === ConsoleView.COMPONENTS ||
        consoleView === ConsoleView.PROJECT_HOME || isCellView) ? Views.CELL_VIEW : Views.L1_SERVICES;
    const [currentView, setCurrentView] = useState<Views>(currentViewDefaultValue);
    const [layout, switchLayout] = useState<DagreLayout>(DagreLayout.TREE);
    const [projectPkgs, setProjectPkgs] = useState<Map<string, boolean>>(undefined);
    const [projectComponents, setProjectComponents] = useState<Map<string, ComponentModel>>(undefined);
    const [showEditForm, setShowEditForm] = useState(false);
    const [connectorTarget, setConnectorTarget] = useState<Service | EntryPoint>(undefined);
    const defaultOrg = useRef<string>('');
    const hasDiagnostics = useRef<boolean>(false);
    const previousScreen = useRef<Views>(undefined);
    const typeCompositionModel = useRef<DiagramModel>(undefined);
    const [focusedNodeId, setFocusedNodeId] = useState<string>(undefined);

    let diagramBGColor;
    if (consoleView) {
        diagramBGColor = Colors.CONSOLE_CELL_DIAGRAM_BACKGROUND;
    } else if (currentView === Views.CELL_VIEW) {
        diagramBGColor = Colors.CELL_DIAGRAM_BACKGROUND;
    } else {
        diagramBGColor = Colors.DIAGRAM_BACKGROUND;
    }

    useEffect(() => {
        refreshDiagram();
    }, [props]);

    useEffect(() => {
        // Navigate to the type composition view if a type is already selected
        if (selectedNodeId && selectedNodeId.trim() !== "" && projectComponents && projectComponents.size > 0) {
            getTypeComposition(selectedNodeId);
        }
    }, [projectComponents]);

    const changeDiagramLayout = () => {
        switchLayout(layout === DagreLayout.GRAPH ? DagreLayout.TREE : DagreLayout.GRAPH);
    };

    const getTypeComposition = (typeID: string) => {
        previousScreen.current = currentView;
        typeCompositionModel.current = generateCompositionModel(projectComponents, typeID);
        setCurrentView(Views.TYPE_COMPOSITION);
    };

    const refreshDiagram = async () => {
        await getComponentModel().then((response) => {
            const components: Map<string, ComponentModel | ComponentModelDeprecated> =
                new Map(Object.entries(response.componentModels));
            if (components && components.size > 0) {
                const component = [...components][0][1] as any;
                defaultOrg.current = component?.modelVersion ? component?.orgName : component?.packageId?.org;
            }
            if (!hasDiagnostics.current && response.diagnostics.length && editLayerAPI) {
                editLayerAPI.showDiagnosticsWarning();
            }
            hasDiagnostics.current = response.diagnostics.length > 0;
            setProjectPkgs(createRenderPackageObject(components.keys()));

            let projectComponents: Map<string, ComponentModel>;
            if (isVersionBelow(components, 0.4)) {
                projectComponents = transformToV4Models(components as Map<string, ComponentModelDeprecated>);
            } else {
                projectComponents = components as Map<string, ComponentModel>;
            }
            setProjectComponents(projectComponents);
            setFocusedNodeId(undefined);
        });
    };

    const onConnectorWizardClose = () => {
        setConnectorTarget(undefined);
    };

    // If the diagram should be rendered on edit mode, the editLayerAPI is a required prop as it contains the
    // utils required to handle the edit-mode features
    const editingEnabled: boolean = isEditable && editLayerAPI !== undefined;

    const ctx = {
        editingEnabled,
        isChoreoProject,
        consoleView,
        currentView,
        hasDiagnostics: hasDiagnostics.current,
        workspaceFolders: projectPkgs?.size,
        setCurrentView,
        refreshDiagram,
        getTypeComposition,
        setConnectorTarget,
        showChoreoProjectOverview,
        editLayerAPI,
        deleteComponent,
        addComponent,
        focusedNodeId,
        setFocusedNodeId
    };

    return (
        <DesignDiagramContext {...ctx}>
            <Container backgroundColor={diagramBGColor}>
                {showEditForm &&
                    <EditForm visibility={true} updateVisibility={setShowEditForm} defaultOrg={defaultOrg.current} />}
                {projectComponents && !consoleView && projectComponents.size < 1 ?
                    <PromptScreen setShowEditForm={setShowEditForm} /> :
                    projectComponents ?
                        <>
                            {connectorTarget &&
                                <ConnectorWizard source={connectorTarget} onClose={onConnectorWizardClose} />}
                            {!(consoleView) && (
                                <DiagramHeader
                                    prevView={previousScreen.current}
                                    layout={layout}
                                    changeLayout={changeDiagramLayout}
                                    projectPackages={projectPkgs}
                                    updateProjectPkgs={setProjectPkgs}
                                    setShowEditForm={setShowEditForm}
                                />
                            )}
                            <DiagramContainer
                                currentView={currentView}
                                layout={layout}
                                workspacePackages={projectPkgs}
                                workspaceComponents={projectComponents}
                                typeCompositionModel={typeCompositionModel.current}
                            />
                        </> :
                        <CircularProgress sx={{ color: Colors.PRIMARY }} />
                }
            </Container>
        </DesignDiagramContext>
    );
}
