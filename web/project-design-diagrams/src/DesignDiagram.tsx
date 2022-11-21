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
import { DesignDiagramContext, DiagramContainer, DiagramHeader } from './components/common';
import { ComponentModel, DagreLayout, Views } from './resources';
import { createRenderPackageObject, generateCompositionModel } from './utils';
import './resources/assets/font/fonts.css';

const background = require('./resources/assets/PatternBg.svg') as string;

const Container = styled.div`
    align-items: center;
    background-image: url('${background}');
	background-repeat: repeat;
    display: flex;
    flex-direction: column;
    font-family: GilmerRegular;
    justify-content: center;
    min-height: 100vh;
    min-width: 100vw;
    overflow-x: auto;
`;

interface DiagramProps {
    fetchProjectResources: () => Promise<Map<string, ComponentModel>>
}

export function DesignDiagram(props: DiagramProps) {
    const { fetchProjectResources } = props;

    const [currentView, setCurrentView] = useState<Views>(Views.L1_SERVICES);
    const [layout, switchLayout] = useState<DagreLayout>(DagreLayout.GRAPH);
    const [projectPkgs, setProjectPkgs] = useState<Map<string, boolean>>(undefined);
    const [projectComponents, setProjectComponents] = useState<Map<string, ComponentModel>>(undefined);
    const previousScreen = useRef<Views>(undefined);
    const typeCompositionModel = useRef<DiagramModel>(undefined);

    useEffect(() => {
        refreshDiagramResources();
    }, [props])

    const changeDiagramLayout = () => {
        switchLayout(layout === DagreLayout.GRAPH ? DagreLayout.TREE : DagreLayout.GRAPH);
    }

    const getTypeComposition = (typeID: string) => {
        previousScreen.current = currentView;
        typeCompositionModel.current = generateCompositionModel(projectComponents, typeID);
        setCurrentView(Views.TYPE_COMPOSITION);
    }

    const refreshDiagramResources = () => {
        fetchProjectResources().then((response) => {
            const components: Map<string, ComponentModel> = new Map(Object.entries(response));
            setProjectPkgs(createRenderPackageObject(components.keys()));
            setProjectComponents(components);
        })
    }

    return (
        <DesignDiagramContext {...{getTypeComposition, currentView}}>
            <Container>
                {currentView && projectPkgs ?
                    <>
                        <DiagramHeader
                            currentView={currentView}
                            layout={layout}
                            prevView={previousScreen.current}
                            projectPackages={projectPkgs}
                            changeLayout={changeDiagramLayout}
                            switchView={setCurrentView}
                            updateProjectPkgs={setProjectPkgs}
                            onRefresh={refreshDiagramResources}
                        />
                        {projectComponents &&
                            <DiagramContainer
                                currentView={currentView}
                                workspacePackages={projectPkgs}
                                workspaceComponents={projectComponents}
                                typeCompositionModel={typeCompositionModel.current}
                                layout={layout}
                            />
                        }
                    </> :
                    <CircularProgress />
                }
            </Container>
        </DesignDiagramContext>
    );
}
