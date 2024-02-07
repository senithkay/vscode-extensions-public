/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useRef, useState } from "react";
import { DiagramEngine, DiagramModel, PathFindingLinkFactory } from "@projectstorm/react-diagrams";
import CircularProgress from "@mui/material/CircularProgress";
import { generateEngine, animateDiagram, getDiagramDataFromOrg } from "../utils";
import { DiagramControls, OverlayLayerModel, CellDiagramContext, PromptScreen } from "../components";
import { Colors, dagreEngine } from "../resources";
import { Container, DiagramContainer, useStyles } from "../utils/CanvasStyles";
import { NavigationWrapperCanvasWidget } from "@wso2-enterprise/ui-toolkit";
import { CustomTooltips, DiagramLayer, MoreVertMenuItem, ObservationSummary, Organization } from "../types";

export { DiagramLayer } from "../types";
export type { MoreVertMenuItem, Project } from "../types";

export interface OrgDiagramProps {
    organization: Organization;
    componentMenu?: MoreVertMenuItem[];
    showControls?: boolean;
    animation?: boolean;
    defaultDiagramLayer?: DiagramLayer;
    customTooltips?: CustomTooltips;
    onComponentDoubleClick?: (componentId: string) => void;
}

export function OrgDiagram(props: OrgDiagramProps) {
    const {
        organization,
        componentMenu,
        showControls = true,
        animation = true,
        defaultDiagramLayer = DiagramLayer.ARCHITECTURE,
        customTooltips,
        onComponentDoubleClick,
    } = props;

    const [diagramEngine] = useState<DiagramEngine>(generateEngine);
    const [diagramModel, setDiagramModel] = useState<DiagramModel | undefined>(undefined);
    const [selectedNodeId, setSelectedNodeId] = useState<string>("");
    const [focusedNodeId, setFocusedNodeId] = useState<string>("");
    const [userMessage, setUserMessage] = useState<string>("");
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isDiagramLoaded, setIsDiagramLoaded] = useState(false);

    const cellNodeWidth = useRef<number>(0); // INFO: use this reference to check if cell node width should change
    const observationSummary = useRef<ObservationSummary>(null);

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

        return () => {
            diagramEngine
                .getModel()
                ?.getNodes()
                .forEach((node) => {
                    node.clearListeners();
                });
        };
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
        const diagramData = getDiagramDataFromOrg(organization, diagramEngine);
        // create diagram model
        const model = new DiagramModel();
        // add preloader overlay layer
        model.addLayer(new OverlayLayerModel());
        // add node and links to diagram model
        const models = model.addAll(
            // nodes
            ...diagramData.nodes.projectNodes.values(),
            // links
            ...diagramData.links.projectLinks.values()
        );

        // draw diagram with all nodes and links
        diagramEngine.setModel(model);
        setDiagramModel(model);

        setTimeout(() => {
            dagreEngine.options = {
                graph: {
                    rankdir: 'LR',
                    ranksep: 120,
                    edgesep: 180,
                    nodesep: 150,
                    acyclicer: 'greedy',
                    ranker: 'network-simplex',
                },
                includeLinks: true,
            };
            dagreEngine.redistribute(model);
            
            if (diagramEngine.getCanvas()?.getBoundingClientRect()) {
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

    const ctx = {
        selectedNodeId,
        focusedNodeId,
        componentMenu,
        zoomLevel,
        defaultDiagramLayer,
        setSelectedNodeId,
        setFocusedNodeId,
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
