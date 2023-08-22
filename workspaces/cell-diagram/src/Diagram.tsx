/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import { DiagramEngine, DiagramModel } from "@projectstorm/react-diagrams";
import CircularProgress from "@mui/material/CircularProgress";
import { generateEngine, modelMapper } from "./utils";
import { DiagramControls, HeaderWidget, OverlayLayerModel, CellDiagramContext, PromptScreen } from "./components";
import { dagreEngine, Colors, NO_ENTITIES_DETECTED } from "./resources";
import { Container, DiagramContainer, useStyles } from "./utils/CanvasStyles";

import "./resources/assets/font/fonts.css";
import { NavigationWrapperCanvasWidget } from "@wso2-enterprise/ui-toolkit";
import { Component, Project } from "./types";

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

    const refreshDiagram = () => {
        getProjectModel().then((response) => {
            const components: Map<string, Component> = new Map(Object.entries(response.components));

            if (components.size) {
                const model = modelMapper(components);
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

    const switchCollapseMode = (shouldCollapse: boolean) => {
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
