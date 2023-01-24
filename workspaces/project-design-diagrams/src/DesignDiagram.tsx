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
import { Colors, ComponentModel, Location, Service, Views } from './resources';
import { createRenderPackageObject, generateCompositionModel } from './utils';
import { ProjectDesignRPC } from './utils/rpc/project-design-rpc';
import { ControlsLayer, EditForm } from './editing';

import './resources/assets/font/fonts.css';

const Container = styled.div`
    align-items: center;
    position: relative;
    display: flex;
    flex-direction: column;
    font-family: GilmerRegular;
    justify-content: center;
    min-height: 85vh;
    min-width: 100vw;
`;

interface DiagramProps {
    editingEnabled?: boolean;
    go2source: (location: Location) => void;
}

export function DesignDiagram(props: DiagramProps) {
    const rpcInstance = ProjectDesignRPC.getInstance();
    const { go2source, editingEnabled = true } = props;

    const [currentView, setCurrentView] = useState<Views>(Views.L1_SERVICES);
    const [projectPkgs, setProjectPkgs] = useState<Map<string, boolean>>(undefined);
    const [projectComponents, setProjectComponents] = useState<Map<string, ComponentModel>>(undefined);
    const [showEditForm, setShowEditForm] = useState(false);
    const [targetService, setTargetService] = useState<Service>(undefined);
    const [isChoreoProject, setIsChoreoProject] = useState<boolean>(false);
    const defaultOrg = useRef<string>('');
    const previousScreen = useRef<Views>(undefined);
    const typeCompositionModel = useRef<DiagramModel>(undefined);

    useEffect(() => {
        rpcInstance.isChoreoProject().then((response) => {
            setIsChoreoProject(response);
        });

        refreshDiagramResources();
    }, [props])

    const getTypeComposition = (typeID: string) => {
        previousScreen.current = currentView;
        typeCompositionModel.current = generateCompositionModel(projectComponents, typeID);
        setCurrentView(Views.TYPE_COMPOSITION);
    }

    const refreshDiagramResources = () => {
        rpcInstance.fetchComponentModels().then((response) => {
            const components: Map<string, ComponentModel> = new Map(Object.entries(response));
            if (components && components.size > 0) {
                defaultOrg.current = [...components][0][1].packageId.org;
            }
            setProjectPkgs(createRenderPackageObject(components.keys()));
            setProjectComponents(components);
        })
    }

    const onComponentAddClick = async () => {
        if (isChoreoProject) {
            rpcInstance.executeCommand('wso2.choreo.component.create').catch((error: Error) => {
                rpcInstance.showErrorMessage(error.message);
            })
        } else {
            setShowEditForm(true);
        }
    }

    const onConnectorWizardClose = () => {
        setTargetService(undefined);
    }

    const ctx = {
        getTypeComposition,
        currentView,
        go2source,
        editingEnabled,
        setTargetService,
        isChoreoProject
    }

    return (
        <DesignDiagramContext {...ctx}>
            <Container>
                {showEditForm &&
                    <EditForm visibility={true} updateVisibility={setShowEditForm} defaultOrg={defaultOrg.current} />}
                {editingEnabled && projectComponents && projectComponents.size < 1 ?
                    <PromptScreen onComponentAdd={onComponentAddClick} /> :
                    projectComponents ?
                        <>
                            {currentView === Views.L1_SERVICES && editingEnabled &&
                                <ControlsLayer onComponentAddClick={onComponentAddClick} />
                            }
                            {editingEnabled && targetService &&
                                <ConnectorWizard service={targetService} onClose={onConnectorWizardClose} />}
                            <DiagramHeader
                                currentView={currentView}
                                prevView={previousScreen.current}
                                projectPackages={projectPkgs}
                                switchView={setCurrentView}
                                updateProjectPkgs={setProjectPkgs}
                                onRefresh={refreshDiagramResources}
                            />
                            <DiagramContainer
                                currentView={currentView}
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
