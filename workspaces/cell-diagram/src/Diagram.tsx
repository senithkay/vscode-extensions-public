/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import { DiagramEngine, DiagramModel, PortModelAlignment } from "@projectstorm/react-diagrams";
import CircularProgress from "@mui/material/CircularProgress";
import { generateEngine, modelMapper } from "./utils";
import { DiagramControls, HeaderWidget, OverlayLayerModel, CellDiagramContext, PromptScreen, CellModel } from "./components";
import { dagreEngine, Colors, NO_ENTITIES_DETECTED, MAIN_CELL } from "./resources";
import { Container, DiagramContainer, useStyles } from "./utils/CanvasStyles";

import "./resources/assets/font/fonts.css";
import { NavigationWrapperCanvasWidget } from "@wso2-enterprise/ui-toolkit";
import { Component, Project } from "./types";
import { CellBounds } from "./components/Cell/CellNode/CellModel";

interface CellDiagramProps {
    getProjectModel: () => Promise<Project>;
}

export function CellDiagram(props: CellDiagramProps) {
    const { getProjectModel } = props;

    const [diagramEngine] = useState<DiagramEngine>(generateEngine);
    const [diagramModel, setDiagramModel] = useState<DiagramModel | undefined>(undefined);
    const [selectedNodeId, setSelectedNodeId] = useState<string>("");
    const [hasDiagnostics, setHasDiagnostics] = useState<boolean>(false);
    const [userMessage, setUserMessage] = useState<string>("");
    const [collapsedMode, setIsCollapsedMode] = useState<boolean>(false);
    const [focusedNodeId, setFocusedNodeId] = useState<string>("");

    const styles = useStyles();

    useEffect(() => {
        refreshDiagram();
    }, [props]);

    useEffect(() => {
        if (diagramEngine.getCanvas()) {
            function handleEscapePress(event: KeyboardEvent) {
                if (event.key === "Escape" && selectedNodeId) {
                    setSelectedNodeId("");
                }
            }
            document.addEventListener("keydown", handleEscapePress);
        }
    }, [diagramModel, diagramEngine.getCanvas()]);

    diagramEngine?.registerListener({
        canvasReady: () => {
            console.log("canvasReady");
            if (diagramModel) {
                console.log("dagreEngine.options.graph.height", dagreEngine.options.graph.height);
                console.log("dagreEngine.options.graph.width", dagreEngine.options.graph.width);
            }
        },
    });

    const refreshDiagram = () => {
        getProjectModel().then((project) => {
            if (project?.components?.length > 0) {
                const model = modelMapper(project);
                model.addLayer(new OverlayLayerModel());
                diagramEngine.setModel(model);
                setDiagramModel(model);
                autoDistribute(model);
            } else {
                setUserMessage(NO_ENTITIES_DETECTED);
            }
        });
    };

    const autoDistribute = (model: DiagramModel) => {
        setTimeout(() => {
            dagreEngine.redistribute(diagramEngine.getModel());
            diagramEngine.zoomToFitNodes({ margin: 10, maxZoom: 1 });

            // re arrange external connector nodes - align with cell bottom ports
            model.getNodes().forEach((node) => {
                if (node.getID() === MAIN_CELL) {
                    for (const key in node.getPorts()) {
                        if (Object.prototype.hasOwnProperty.call(node.getPorts(), key)) {
                            const port = node.getPorts()[key];
                            const portData = port.getID().split("-");
                            if (portData.length > 3 && portData[2] === CellBounds.SouthBound && portData[0] === PortModelAlignment.BOTTOM) {
                                const portPosition = port.getPosition().clone();
                                portPosition.x = portPosition.x - 40;
                                portPosition.y = portPosition.y + 200;
                                model.getNode(portData[3]).setPosition(portPosition);
                            }
                        }
                    }
                }
            });
            // remove preloader
            const overlayLayer = diagramEngine
                .getModel()
                .getLayers()
                .find((layer) => layer instanceof OverlayLayerModel);
            if (overlayLayer) {
                diagramEngine.getModel().removeLayer(overlayLayer);
            }

            diagramEngine.setModel(model);
        }, 30);
    };

    const _switchCollapseMode = (shouldCollapse: boolean) => {
        setIsCollapsedMode(shouldCollapse);
        if (diagramModel) {
            autoDistribute(diagramModel);
        }
    };

    let ctx = {
        collapsedMode,
        selectedNodeId,
        setSelectedNodeId,
        setHasDiagnostics,
        hasDiagnostics,
        focusedNodeId,
        setFocusedNodeId,
    };

    const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (focusedNodeId && event.target === diagramEngine.getCanvas()) {
            setFocusedNodeId("");
        }
    };

    return (
        <Container>
            <CellDiagramContext {...ctx}>
                <HeaderWidget />
                <DiagramContainer onClick={handleCanvasClick}>
                    {diagramEngine?.getModel() && diagramModel ? (
                        <>
                            <NavigationWrapperCanvasWidget
                                diagramEngine={diagramEngine}
                                className={styles.canvas}
                                focusedNode={diagramEngine?.getModel()?.getNode(focusedNodeId)}
                            />
                            <DiagramControls engine={diagramEngine} refreshDiagram={refreshDiagram} showProblemPanel={() => {}} />
                        </>
                    ) : userMessage ? (
                        <PromptScreen userMessage={userMessage} showProblemPanel={() => {}} />
                    ) : (
                        <CircularProgress sx={{ color: Colors.PRIMARY }} />
                    )}
                </DiagramContainer>
            </CellDiagramContext>
        </Container>
    );
}
