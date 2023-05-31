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

import React, { useEffect, useState } from 'react';
import { ComponentModel, GetPersistERModelResponse } from '@wso2-enterprise/ballerina-languageclient';
import { DiagramEngine, DiagramModel } from '@projectstorm/react-diagrams';
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import CircularProgress from '@mui/material/CircularProgress';
import styled from '@emotion/styled';
import { CMEntity as Entity } from '@wso2-enterprise/ballerina-languageclient';
import { entityModeller, generateEngine } from './utils';
import { DiagramControls, PersistDiagramContext, PromptScreen } from './components';
import { ERRONEOUS_MODEL, NO_ENTITIES_DETECTED, dagreEngine } from './resources';
import './styles.css';

import './resources/assets/font/fonts.css';

interface PersistDiagramProps {
    getPersistModel: () => Promise<GetPersistERModelResponse>;
    selectedRecordName: string;
    showProblemPanel: () => void;
}

const PersistContainer = styled.div`
    align-items: center;
    display: flex;
    flex-direction: row;
    height: 100vh;
    justify-content: center;
    width: 100vw;
`;

export function PersistDiagram(props: PersistDiagramProps) {
    const { getPersistModel, selectedRecordName, showProblemPanel } = props;

    const [diagramEngine] = useState<DiagramEngine>(generateEngine);
    const [diagramModel, setDiagramModel] = useState<DiagramModel>(undefined);
    const [hasDiagnostics, setHasDiagnostics] = useState<boolean>(false);
    const [userMessage, setUserMessage] = useState<string>(undefined);

    useEffect(() => {
        refreshDiagram();
    }, [props]);

    const refreshDiagram = () => {
        getPersistModel().then(response => {
            const pkgModel: Map<string, ComponentModel> = new Map(Object.entries(response.persistERModel));
            const entities: Map<string, Entity> = new Map(Object.entries(pkgModel.get('entities')));
            setHasDiagnostics(response.diagnostics.length > 0);
            if (entities.size) {
                setUserMessage(undefined);
                const model = entityModeller(entities);
                diagramEngine.setModel(model);
                autoDistribute();
                setDiagramModel(model);
            } else if (response.diagnostics.length && !diagramModel) {
                setUserMessage(ERRONEOUS_MODEL);
            } else if (!response.diagnostics?.length) {
                setDiagramModel(undefined);
                setUserMessage(NO_ENTITIES_DETECTED);
            }
        });
    }

    const autoDistribute = () => {
        setTimeout(() => {
            dagreEngine.redistribute(diagramEngine.getModel());
            diagramEngine.zoomToFitNodes({});
        }, 30);
    };

    const selectedNodeId = selectedRecordName ? `$anon/.:0.0.0:${selectedRecordName}` : '';

    let ctx = {
        selectedNode: selectedNodeId,
        setHasDiagnostics,
        hasDiagnostics
    }

    return (
        <PersistContainer>
            <PersistDiagramContext {...ctx}>
                {diagramEngine && diagramEngine.getModel() && diagramModel ?
                    <>
                        <CanvasWidget engine={diagramEngine} className={'persist-diagram-container'} />
                        <DiagramControls
                            engine={diagramEngine}
                            refreshDiagram={refreshDiagram}
                            showProblemPanel={showProblemPanel}
                        />
                    </> :
                    userMessage ?
                        <PromptScreen userMessage={userMessage} showProblemPanel={hasDiagnostics ? showProblemPanel : undefined} /> :
                        <CircularProgress sx={{ color: '#5567D5' }} />
                }
            </PersistDiagramContext>
        </PersistContainer>
    );
}
