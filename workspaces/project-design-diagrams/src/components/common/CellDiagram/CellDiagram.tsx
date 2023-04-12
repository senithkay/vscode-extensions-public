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
    CellDiagramWrapper,
    CanvasWrapper
} from "../DiagramContainer/style";
import { Gateways } from "../../gateway/Gateways/Gateways";
import { DiagramCanvasWidget } from "../DiagramCanvas/CanvasWidget";
import { DagreLayout, Views } from "../../../resources";
import { DiagramModel } from "@projectstorm/react-diagrams";
import { DiagramContext } from "../DiagramContext/DiagramContext";
import { cellDiagramZoomToFit, createServicesEngine, positionGatewayNodes } from "../../../utils";
import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import { DiagramControls } from "../DiagramCanvas/ControlLayer";
import { ConsoleView } from "../../../resources/model";
import { PromptScreen } from "../NewPromptScreen/PromptScreen";

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
    const { consoleView } = useContext(DiagramContext);

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

    let canvasWOffset = 102;
    if (consoleView === ConsoleView.COMPONENTS) {
        canvasWOffset = 375;
    } else if (consoleView === ConsoleView.PROJECT_HOME) {
        canvasWOffset = 850;
    }
    const canvasW = (viewWidth - canvasWOffset);
    const canvasH = (viewHeight - (consoleView ? 400 : 200));
    const offset = consoleView ? 150 : 200;
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

    const borderPath = `path("M ${vertices[0].x + 10} ${vertices[0].y} L ${vertices[1].x - 10} ${vertices[1].y} C ${vertices[1].x - 5} ${vertices[1].y} ${vertices[1].x + 3} ${vertices[1].y + 3} ${vertices[1].x + 7} ${vertices[1].y + 7} L ${vertices[2].x - 8} ${vertices[2].y - 7} C ${vertices[2].x - 3} ${vertices[2].y - 3} ${vertices[2].x} ${vertices[2].y + 4} ${vertices[2].x} ${vertices[2].y + 10} L ${vertices[3].x} ${vertices[3].y + 75} C ${vertices[3].x} ${vertices[3].y + 80} ${vertices[3].x - 4} ${vertices[3].y + 88} ${vertices[3].x - 7} ${vertices[3].y + 92} L ${vertices[4].x + 4} ${vertices[4].y + 82} C ${vertices[4].x + 7} ${vertices[4].y + 77} ${vertices[4].x + 4} ${vertices[4].y + 81} ${vertices[4].x - 4} ${vertices[4].y + 84} L ${vertices[5].x + 10} ${vertices[5].y + 84} C ${vertices[5].x + 4} ${vertices[5].y + 85}  ${vertices[5].x - 4}  ${vertices[5].y + 81}  ${vertices[5].x - 7} ${vertices[5].y + 77}  L ${vertices[6].x + 7} ${vertices[6].y + 92} C ${vertices[6].x + 1} ${vertices[6].y + 88} ${vertices[6].x} ${vertices[6].y + 66} ${vertices[6].x} ${vertices[6].y + 65} L ${vertices[7].x} ${vertices[7].y + 10} C ${vertices[7].x} ${vertices[7].y + 4} ${vertices[7].x + 3} ${vertices[7].y - 4} ${vertices[7].x + 7} ${vertices[7].y - 6} L ${vertices[7].x + 9} ${vertices[7].y - 8} C ${vertices[0].x + 2} ${vertices[0].y + 3} ${vertices[0].x + 1} ${vertices[0].y} ${vertices[0].x + 10} ${vertices[0].y} Z")`;
    const innerBorderPath = `path("M ${vertices[0].x + 9} ${vertices[0].y + 1} L ${vertices[1].x - 9} ${vertices[1].y + 1} C ${vertices[1].x - 3} ${vertices[1].y + 2} ${vertices[1].x + 1} ${vertices[1].y + 3} ${vertices[1].x + 7} ${vertices[1].y + 8} L ${vertices[2].x - 7} ${vertices[2].y - 5} C ${vertices[2].x - 6} ${vertices[2].y - 2} ${vertices[2].x - 1} ${vertices[2].y + 1} ${vertices[2].x - 1} ${vertices[2].y + 8} L ${vertices[3].x - 1} ${vertices[3].y + 74} C ${vertices[3].x - 1} ${vertices[3].y + 79} ${vertices[3].x - 3} ${vertices[3].y + 85} ${vertices[3].x - 7} ${vertices[3].y + 90} L ${vertices[4].x + 8} ${vertices[4].y + 77} C ${vertices[4].x + 8} ${vertices[4].y + 79} ${vertices[4].x - 6} ${vertices[4].y + 83} ${vertices[4].x - 4} ${vertices[4].y + 83} L ${vertices[5].x + 9} ${vertices[5].y + 83} C ${vertices[5].x + 1} ${vertices[5].y + 83}  ${vertices[5].x - 5}  ${vertices[5].y + 79}  ${vertices[5].x - 8} ${vertices[5].y + 75}  L ${vertices[6].x + 6} ${vertices[6].y + 90} C ${vertices[6].x + 2} ${vertices[6].y + 81} ${vertices[6].x} ${vertices[6].y + 64} ${vertices[6].x + 1} ${vertices[6].y + 63} L ${vertices[7].x + 1} ${vertices[7].y + 8} C ${vertices[7].x + 1} ${vertices[7].y + 1} ${vertices[7].x + 5} ${vertices[7].y - 3} ${vertices[7].x + 8} ${vertices[7].y - 6} L ${vertices[0].x + 12} ${vertices[0].y - 6} C ${vertices[0].x - 10} ${vertices[0].y + 15} ${vertices[0].x + 7} ${vertices[0].y + 1} ${vertices[0].x + 9} ${vertices[0].y + 1} Z")`;

    return (
        <CellDiagramWrapper isConsoleView={consoleView}>
            <CellContainerWrapper isConsoleView={consoleView}>
                <Gateways/>
                {cellModel && consoleView && (cellModel.getNodes().length < 1) && (
                    <PromptScreen/>
                )}
                <CellContainer path={borderPath} vertices={vertices}>
                    <CanvasWrapper path={innerBorderPath} vertices={vertices}>
                        <DiagramCanvasWidget
                            engine={diagramEngine}
                            type={Views.CELL_VIEW}
                            model={cellModel}
                            {...{currentView, layout}}
                        />
                    </CanvasWrapper>
                </CellContainer>
            </CellContainerWrapper>
            <CellContainerControls isConsoleView={consoleView} canvasHeight={canvasH}>
                <DiagramControls
                    showDownloadButton={false}
                    zoomToFit={zoomToFit}
                    onZoom={onZoom}
                />
            </CellContainerControls>
        </CellDiagramWrapper>
    );
}
