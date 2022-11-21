/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the 'License'); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DagreEngine, DiagramEngine, DiagramModel } from '@projectstorm/react-diagrams';
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import { toJpeg } from 'html-to-image';
import { DiagramControls } from './DiagramControls';
import { DagreLayout, Views } from '../../../resources';
import { createEntitiesEngine, createServicesEngine } from '../../../utils';
import { Container, Canvas } from './styles/styles';
import './styles/styles.css';

interface DiagramCanvasProps {
    model: DiagramModel;
    currentView: Views;
    type: Views;
    layout: DagreLayout;
}

// Note: Dagre distribution spaces correctly only if the particular diagram screen is visible
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

export function DiagramCanvasWidget(props: DiagramCanvasProps) {
    const { model, currentView, layout, type } = props;

    const [diagramEngine] = useState<DiagramEngine>(type === Views.TYPE ||
        type === Views.TYPE_COMPOSITION ? createEntitiesEngine : createServicesEngine);
    const [diagramModel, setDiagramModel] = useState<DiagramModel>(undefined);
    const diagramRef = useRef<HTMLDivElement>(null);

    // Reset the model and redistribute if the model/layout changes
    useEffect(() => {
        if (diagramEngine.getModel()) {
            if (currentView === type) {
                diagramEngine.setModel(model);
                autoDistribute();
            } else {
                setDiagramModel(undefined);
            }
        }
    }, [model, layout])

    // Initial distribution of the nodes when the screen is on display (refer note above)
    useEffect(() => {
        if (!diagramModel && currentView === type) {
            diagramEngine.setModel(model);
            setDiagramModel(model);
            autoDistribute();
        }
    }, [currentView])

    const autoDistribute = () => {
        setTimeout(() => {
            if (dagreEngine.options.graph.ranker !== layout) {
                dagreEngine.options.graph.ranker = layout;
            }
            dagreEngine.redistribute(diagramEngine.getModel());
            diagramEngine.repaintCanvas();
        }, 30);
    };

    const onZoom = (zoomIn: boolean) => {
        let delta: number = zoomIn ? +5 : -5;
        diagramEngine.getModel().setZoomLevel(diagramEngine.getModel().getZoomLevel() + delta);
        diagramEngine.repaintCanvas();
    }

    const zoomToFit = () => {
        diagramEngine.zoomToFitNodes({});
    }

    const downloadDiagram = useCallback(() => {
        if (diagramRef.current === null) {
            return;
        }

        toJpeg(diagramRef.current, { cacheBust: true, quality: 0.95 })
            .then((dataUrl) => {
                const link = document.createElement('a');
                link.download = 'project-diagram.jpeg';
                link.href = dataUrl;
                link.click();
            })
            .catch((err) => {
                console.log(err);
            })
    }, [diagramRef.current])

    return (
        <Container>
            {diagramEngine && diagramEngine.getModel() &&
                <Canvas ref={diagramRef}>
                    <CanvasWidget engine={diagramEngine} className={'diagram-container'} />
                </Canvas>
            }

            <DiagramControls
                zoomToFit={zoomToFit}
                onZoom={onZoom}
                onDownload={downloadDiagram}
            />
        </Container>
    );
}
