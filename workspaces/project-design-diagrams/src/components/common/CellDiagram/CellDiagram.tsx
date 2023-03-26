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

import React, { useContext, useEffect, useState } from 'react';
import {
    CellContainer,
    CellContainerControls,
    CellContainerWrapper,
    CellDiagramWrapper
} from "../DiagramContainer/style";
import { Gateways } from "../../gateway/Gateways/Gateways";
import { DiagramCanvasWidget } from "../DiagramCanvas/CanvasWidget";
import { DagreLayout, Views } from "../../../resources";
import { DiagramModel } from "@projectstorm/react-diagrams";
import { DiagramContext } from "../DiagramContext/DiagramContext";
import { CanvasWrapper } from "../../../../lib/components/common/DiagramContainer/style";
import { cellDiagramZoomToFit, createServicesEngine, positionGatewayNodes } from "../../../utils";
import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import { DiagramControls } from "../DiagramCanvas/DiagramControls";

export interface Coordinate {
    x: number;
    y: number;
}

interface CellDiagramProps {
    currentView: Views;
    layout: DagreLayout;
    cellModel: DiagramModel;
}

export function CellDiagram(props: CellDiagramProps) {
    const { currentView, layout, cellModel } = props;
    const { isConsoleView } = useContext(DiagramContext);

    const [diagramEngine] = useState<DiagramEngine>(createServicesEngine);
    const [viewWidth, setViewWidth] = useState(window.innerWidth);
    const [viewHeight, setViewHeight] = useState(window.innerHeight);

    useEffect(() => {
        const handleResize = () => {
            setViewWidth(window.innerWidth);
            setViewHeight(window.innerHeight);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const redrawDiagram = () => {
        positionGatewayNodes(diagramEngine);
        diagramEngine.repaintCanvas();
    };

    const onZoom = (zoomIn: boolean) => {
        let delta: number = zoomIn ? +5 : -5;
        diagramEngine.getModel().setZoomLevel(diagramEngine.getModel().getZoomLevel() + delta);
        redrawDiagram();
    };

    const zoomToFit = () => {
        diagramEngine.zoomToFitNodes({ maxZoom: 1 });
        cellDiagramZoomToFit(diagramEngine);
    };

    const canvasW = (viewWidth - 100);
    const canvasH = (viewHeight - 90);
    const offset = 200;
    const vertices: Coordinate[] = [
        { x: offset, y: 0 },
        { x: canvasW - offset, y: 0 },
        { x: canvasW, y: offset },
        { x: canvasW, y: canvasH - offset },
        { x: canvasW - offset, y: canvasH },
        { x: offset, y: canvasH },
        { x: 0, y: canvasH - offset },
        { x: 0, y: offset }
    ];
    return (
        <CellDiagramWrapper>
            <CellContainerWrapper isConsoleView={isConsoleView}>
                <Gateways/>
                <CellContainer vertices={vertices}>
                    <CanvasWrapper vertices={vertices}>
                        <DiagramCanvasWidget
                            engine={diagramEngine}
                            type={Views.CELL_VIEW}
                            model={cellModel}
                            {...{currentView, layout}}
                        />
                    </CanvasWrapper>
                </CellContainer>
            </CellContainerWrapper>
            <CellContainerControls>
                <DiagramControls
                    showDownloadButton={false}
                    zoomToFit={zoomToFit}
                    onZoom={onZoom}
                />
            </CellContainerControls>
        </CellDiagramWrapper>
    );
}
