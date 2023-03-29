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

import React, { useEffect, useRef, useState } from 'react';
import { DiagramModel } from '@projectstorm/react-diagrams';
import CircularProgress from '@mui/material/CircularProgress';
import styled from '@emotion/styled';
import { DesignDiagramContext, DiagramContainer, DiagramHeader, PromptScreen } from './components/common';
import { ConnectorWizard } from './components/connector/ConnectorWizard';
import { Colors, ComponentModel, DagreLayout, EditLayerAPI, Location, Service, Views } from './resources';
import { createRenderPackageObject, generateCompositionModel } from './utils';
import { ControlsLayer, EditForm } from './editing';

import './resources/assets/font/fonts.css';

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
    min-height: 100vh;
    min-width: 100vw;
    position: relative;
`;

interface DiagramProps {
    isEditable: boolean;
    isChoreoProject: boolean;
    selectedNodeId?: string;
    editLayerAPI?: EditLayerAPI;
    getComponentModel(): Promise<Map<string, ComponentModel>>;
    showChoreoProjectOverview?: () => Promise<void>;
    deleteComponent?: (location: Location, deletePkg: boolean) => Promise<void>;
}

export function DesignDiagram(props: DiagramProps) {
    const {
        isChoreoProject,
        isEditable,
        selectedNodeId,
        getComponentModel,
        showChoreoProjectOverview = undefined,
        editLayerAPI = undefined,
        deleteComponent = undefined
    } = props;

    const [currentView, setCurrentView] = useState<Views>(Views.L1_SERVICES);
    const [layout, switchLayout] = useState<DagreLayout>(DagreLayout.TREE);
    const [projectPkgs, setProjectPkgs] = useState<Map<string, boolean>>(undefined);
    const [projectComponents, setProjectComponents] = useState<Map<string, ComponentModel>>(undefined);
    const [showEditForm, setShowEditForm] = useState(false);
    const [connectorTarget, setConnectorTarget] = useState<Service>(undefined);
    const defaultOrg = useRef<string>('');
    const previousScreen = useRef<Views>(undefined);
    const typeCompositionModel = useRef<DiagramModel>(undefined);

    const diagramBGColor = currentView === Views.CELL_VIEW ? Colors.CELL_DIAGRAM_BACKGROUND : Colors.DIAGRAM_BACKGROUND;

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
    }

    const getTypeComposition = (typeID: string) => {
        previousScreen.current = currentView;
        typeCompositionModel.current = generateCompositionModel(projectComponents, typeID);
        setCurrentView(Views.TYPE_COMPOSITION);
    }

    const refreshDiagram = async () => {
        await getComponentModel().then((response) => {
            const components: Map<string, ComponentModel> = new Map(Object.entries(response));
            if (components && components.size > 0) {
                defaultOrg.current = [...components][0][1].packageId.org;
            }
            setProjectPkgs(createRenderPackageObject(components.keys()));
            setProjectComponents(components);
        });
    }

    const onConnectorWizardClose = () => {
        setConnectorTarget(undefined);
    }

    // If the diagram should be rendered on edit mode, the editLayerAPI is a required prop as it contains the
    // utils required to handle the edit-mode features
    const editingEnabled: boolean = isEditable && editLayerAPI !== undefined;

    const ctx = {
        editingEnabled,
        isChoreoProject,
        currentView,
        refreshDiagram,
        getTypeComposition,
        setConnectorTarget,
        showChoreoProjectOverview,
        editLayerAPI,
        deleteComponent
    }

    return (
        <DesignDiagramContext {...ctx}>
            <Container backgroundColor={diagramBGColor}>
                {showEditForm &&
                    <EditForm visibility={true} updateVisibility={setShowEditForm} defaultOrg={defaultOrg.current} />}
                {projectComponents && projectComponents.size < 1 ? <PromptScreen setShowEditForm={setShowEditForm} /> :
                    projectComponents ?
                        <>
                            {editingEnabled && (currentView === Views.L1_SERVICES || currentView === Views.L2_SERVICES) &&
                                <ControlsLayer setShowEditForm={setShowEditForm} />
                            }
                            {connectorTarget &&
                                <ConnectorWizard service={connectorTarget} onClose={onConnectorWizardClose} />}
                            <DiagramHeader
                                currentView={currentView}
                                prevView={previousScreen.current}
                                layout={layout}
                                changeLayout={changeDiagramLayout}
                                projectPackages={projectPkgs}
                                switchView={setCurrentView}
                                updateProjectPkgs={setProjectPkgs}
                                onRefresh={refreshDiagram}
                            />
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
