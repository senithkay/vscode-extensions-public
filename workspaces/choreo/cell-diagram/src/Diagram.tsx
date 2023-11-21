/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useRef, useState } from "react";
import { DiagramEngine, DiagramModel } from "@projectstorm/react-diagrams";
import CircularProgress from "@mui/material/CircularProgress";
import { generateEngine, getComponentDiagramWidth, getDiagramDataFromProject, manualDistribute, calculateCellWidth, isRenderInsideCell, animateDiagram } from "./utils";
import { DiagramControls, OverlayLayerModel, CellDiagramContext, PromptScreen, ConnectionModel, MenuItemDef } from "./components";
import { Colors, DIAGRAM_END, MAIN_CELL, NO_CELL_NODE } from "./resources";
import { Container, DiagramContainer, useStyles } from "./utils/CanvasStyles";

import "./resources/assets/font/fonts.css";
import { NavigationWrapperCanvasWidget } from "@wso2-enterprise/ui-toolkit";
import { Project } from "./types";
import { CellModel } from "./components/Cell/CellNode/CellModel";

export interface CellDiagramProps {
    project: Project;
    // custom component menu
    componentMenu?: MenuItemDef[];
    showControls?: boolean;
    animation?: boolean;
    // custom event handler
    onComponentDoubleClick?: (componentId: string) => void;
}

export function CellDiagram(props: CellDiagramProps) {
    const { project, componentMenu, showControls = true, animation = true, onComponentDoubleClick } = props;

    const [diagramEngine] = useState<DiagramEngine>(generateEngine);
    const [diagramModel, setDiagramModel] = useState<DiagramModel | undefined>(undefined);
    const [selectedNodeId, setSelectedNodeId] = useState<string>("");
    const [hasDiagnostics, setHasDiagnostics] = useState<boolean>(false);
    const [focusedNodeId, setFocusedNodeId] = useState<string>("");
    const [userMessage, setUserMessage] = useState<string>("");
    const [observationVersion, setObservationVersion] = useState<string | undefined>(undefined);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isDiagramLoaded, setIsDiagramLoaded] = useState(false);

    const cellNodeWidth = useRef<number>(0); // INFO: use this reference to check if cell node width should change

    const styles = useStyles();

    useEffect(() => {
        if (diagramEngine) {
            drawDiagram();
        }
    }, [props]);

    useEffect(() => {
        if (diagramEngine && animation && isDiagramLoaded) {
            animateDiagram();
            diagramEngine.repaintCanvas();
        }
    }, [isDiagramLoaded, diagramEngine]);

    useEffect(() => {
        const listener = diagramEngine.getModel()?.registerListener({
            zoomUpdated: (event: any) => {
                setZoomLevel(event.zoom);
            },
        });
        return () => {
            diagramEngine.getModel()?.deregisterListener(listener);
        };
    }, [diagramEngine]);

    useEffect(() => {
        if (diagramEngine.getCanvas()) {
            document.addEventListener("keydown", handleEscapePress);
        }
        return () => {
            document.removeEventListener("keydown", handleEscapePress);
        };
    }, [diagramModel, diagramEngine.getCanvas()]);

    function handleEscapePress(event: KeyboardEvent) {
        if (event.key === "Escape" && selectedNodeId) {
            setSelectedNodeId("");
        }
    }

    // draw diagram
    const drawDiagram = () => {
        // get diagram data (nodes, links, gateways) from project
        const diagramData = getDiagramDataFromProject(project);
        // auto distribute component nodes, component links, empty nodes and cell links
        // get component diagram boundaries
        // calculate component diagram width
        const componentDiagramWidth = getComponentDiagramWidth(diagramData);
        cellNodeWidth.current = componentDiagramWidth;
        // get cell node
        const cellNode = new CellModel(
            MAIN_CELL,
            componentDiagramWidth,
            diagramData.gateways,
            Array.from((diagramData.nodes.connectorNodes as Map<string, ConnectionModel>).values()),
            Array.from((diagramData.nodes.connectionNodes as Map<string, ConnectionModel>).values())
        );
        // create diagram model
        const model = new DiagramModel();
        // add preloader overlay layer
        model.addLayer(new OverlayLayerModel());
        // add node and links to diagram model
        const models = model.addAll(
            // nodes
            cellNode,
            ...diagramData.nodes.componentNodes.values(),
            ...diagramData.nodes.connectionNodes.values(),
            ...diagramData.nodes.connectorNodes.values(),
            ...diagramData.nodes.emptyNodes.values(),
            ...diagramData.nodes.externalNodes.values(),
            // links
            ...diagramData.links.connectionLinks.values(),
            ...diagramData.links.connectorLinks.values(),
            ...diagramData.links.externalLinks.values(),
            ...diagramData.links.componentLinks.values(),
            ...diagramData.links.cellLinks.values()
        );

        models.forEach((item) => {
            if (isRenderInsideCell(item)) {
                item.registerListener({
                    positionChanged: () => {
                        refreshDiagram();
                    },
                });
            }
        });
        // initially render end of diagram
        model.setOffset(DIAGRAM_END * 4, DIAGRAM_END * 4);
        // draw diagram with all nodes and links
        diagramEngine.setModel(model);
        setDiagramModel(model);

        setTimeout(() => {
            // manual distribute - update empty node, external node and connector node position based on cell node position
            manualDistribute(model);
            if (diagramEngine.getCanvas().getBoundingClientRect) {
                // zoom to fit nodes and center diagram
                diagramEngine.zoomToFitNodes({ margin: 40, maxZoom: 1 });
            }
            // remove preloader overlay layer
            const overlayLayer = diagramEngine
                .getModel()
                .getLayers()
                .find((layer) => layer instanceof OverlayLayerModel);
            if (overlayLayer) {
                diagramEngine.getModel().removeLayer(overlayLayer);
            }
            // update diagram
            diagramEngine.setModel(model);
            diagramEngine.repaintCanvas();
            // After all diagram setup is complete
            setIsDiagramLoaded(true);
        }, 1000);
    };

    // refresh diagram
    const refreshDiagram = () => {
        // calculate component diagram width
        const model = diagramEngine.getModel();
        const cellWidth = calculateCellWidth(model);
        // TODO: check if cell node width should change
        const cellNode = model.getNode(MAIN_CELL);
        // change cell node width
        if (!cellNode) {
            setUserMessage(NO_CELL_NODE); // TODO: handle error properly
            return;
        }
        cellNode.width = cellWidth;
        cellNode.updateDimensions({ width: cellWidth, height: cellWidth });

        setTimeout(() => {
            // manual distribute - update empty node, external node and connector node position based on cell node position
            manualDistribute(model);
            // update diagram
            diagramEngine.setModel(model);
            diagramEngine.repaintCanvas();
            // update cell node width
            cellNodeWidth.current = cellWidth;
        }, 8);
    };

    const ctx = {
        selectedNodeId,
        hasDiagnostics,
        focusedNodeId,
        observationVersion,
        componentMenu,
        zoomLevel,
        setSelectedNodeId,
        setHasDiagnostics,
        setFocusedNodeId,
        setObservationVersion,
        onComponentDoubleClick,
    };

    const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (focusedNodeId && event.target === diagramEngine.getCanvas()) {
            setFocusedNodeId("");
        }
    };

    return (
        <Container>
            <CellDiagramContext {...ctx}>
                <DiagramContainer onClick={handleCanvasClick}>
                    {diagramEngine?.getModel() && diagramModel ? (
                        <>
                            <NavigationWrapperCanvasWidget
                                diagramEngine={diagramEngine}
                                className={styles.canvas}
                                focusedNode={diagramEngine?.getModel()?.getNode(focusedNodeId)}
                            />
                            {showControls && <DiagramControls engine={diagramEngine} animation={animation} />}
                        </>
                    ) : userMessage ? (
                        <PromptScreen userMessage={userMessage} />
                    ) : (
                        <CircularProgress sx={{ color: Colors.PRIMARY }} />
                    )}
                </DiagramContainer>
            </CellDiagramContext>
        </Container>
    );
}
