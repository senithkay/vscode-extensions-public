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
import { DagreEngine } from '@projectstorm/react-diagrams-routing';
import CircularProgress from '@mui/material/CircularProgress';
import styled from '@emotion/styled';
import { entityModeller } from '@wso2-enterprise/project-design-diagrams/lib/utils/model-mapper/entityModelMapper';
import { EntityLinkFactory, EntityFactory, EntityPortFactory } from '@wso2-enterprise/project-design-diagrams/lib/components/entity-relationship/';
import createEngine, { DiagramEngine, DiagramModel } from '@projectstorm/react-diagrams';
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import './styles.css';

interface PersistDiagramProps {
    getPersistModel: () => Promise<GetPersistERModelResponse>;
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
    const { getPersistModel } = props;

    const [diagramEngine, setDiagramEngine] = useState<DiagramEngine>(undefined);

    useEffect(() => {
        getPersistModel().then((response) => {
            const modelMap: Map<string, ComponentModel> = new Map(Object.entries(response));
            const pkgMap: Map<string, boolean> = new Map([["persistERModel", true]]);
            const model: DiagramModel = entityModeller(modelMap, pkgMap);
            const engine: DiagramEngine = createEngine({
                registerDefaultPanAndZoomCanvasAction: true,
                registerDefaultZoomCanvasAction: false
            });
            engine.getLinkFactories().registerFactory(new EntityLinkFactory());
            engine.getPortFactories().registerFactory(new EntityPortFactory());
            engine.getNodeFactories().registerFactory(new EntityFactory());
            engine.setModel(model);
            setDiagramEngine(engine);
            autoDistribute(model);
        });
    }, [props]);

    const autoDistribute = (model: DiagramModel) => {
        setTimeout(() => {
            let dagreEngine = new DagreEngine({
                graph: {
                    rankdir: 'LR',
                    ranksep: 175,
                    edgesep: 20,
                    nodesep: 60,
                    ranker: 'longest-path',
                    marginx: 40,
                    marginy: 40
                }
            });
            dagreEngine.redistribute(model);
        }, 30);
    };

    return (
        <PersistContainer>
            {diagramEngine ?
                <CanvasWidget engine={diagramEngine} className={'diagram-container'} /> :
                <CircularProgress sx={{ color: '#5567D5' }} />
            }
        </PersistContainer>
    );
}
