/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import { DiagramEngine, DiagramModel } from "@projectstorm/react-diagrams";
import { CanvasWidget } from "@projectstorm/react-canvas-core";
import { generateEngine, registerListeners } from "../utils/diagram";
import { DiagramCanvas } from "./DiagramCanvas";
import { traverseParticipant } from "../utils/traverse-utils";
import { ElementFactoryVisitor } from "../visitors/ElementFactoryVisitor";
import { OverlayLayerModel } from "./OverlayLayer";
import { DiagramContextProvider, DiagramContextState } from "./DiagramContext";
import { Flow, NodeModel } from "../utils/types";
import { PositionVisitor } from "../visitors/PositionVisitor";
import _ from "lodash";
import { SizingVisitor } from "../visitors/SizingVisitor";
import { NodeLinkModel } from "./NodeLink";

export interface DiagramProps {
    model: Flow;
}

export function Diagram(props: DiagramProps) {
    const { model: flow } = props;
    const [diagramEngine] = useState<DiagramEngine>(generateEngine());
    const [diagramModel, setDiagramModel] = useState<DiagramModel | null>(null);

    useEffect(() => {
        if (diagramEngine) {
            const { nodes, links } = getDiagramData();
            drawDiagram(nodes, links);
        }
    }, [flow]);

    const getDiagramData = () => {
        // get entry participant
        const entryParticipant = flow.participants?.find(
            (participant) =>
                flow.location.startLine.line === participant.location.startLine.line &&
                flow.location.startLine.offset === participant.location.startLine.offset &&
                flow.location.endLine.line === participant.location.endLine.line &&
                flow.location.endLine.offset === participant.location.endLine.offset,
        );
        console.log(">> Entry", entryParticipant);
        if (!entryParticipant) {
            console.error("Entry participant not found");
            return { nodes: [], links: [] };
        }

        const sizingVisitor = new SizingVisitor();
        traverseParticipant(entryParticipant, sizingVisitor, flow);
        const positionVisitor = new PositionVisitor(flow);
        traverseParticipant(entryParticipant, positionVisitor, flow);
        const elementVisitor = new ElementFactoryVisitor(flow);
        traverseParticipant(entryParticipant, elementVisitor, flow);

        const nodes = elementVisitor.getNodes();
        const links = elementVisitor.getLinks();

        console.log(">> updated flow", flow);

        // const nodes: NodeModel[] = [];
        // const links: NodeLinkModel[] = [];

        return { nodes, links } as {
            nodes: NodeModel[];
            links: NodeLinkModel[];
        };
    };

    const drawDiagram = (nodes: NodeModel[], links: NodeLinkModel[]) => {
        const newDiagramModel = new DiagramModel();
        newDiagramModel.addLayer(new OverlayLayerModel());
        newDiagramModel.addAll(...nodes, ...links);

        diagramEngine.setModel(newDiagramModel);
        setDiagramModel(newDiagramModel);
        registerListeners(diagramEngine);

        console.log(">> diagramEngine", diagramEngine);

        setTimeout(() => {
            diagramEngine.setModel(newDiagramModel);
            // remove loader overlay layer
            const overlayLayer = diagramEngine
                .getModel()
                .getLayers()
                .find((layer) => layer instanceof OverlayLayerModel);
            if (overlayLayer) {
                diagramEngine.getModel().removeLayer(overlayLayer);
            }

            // const hasPreviousPosition = hasDiagramZoomAndPosition();
            // if (hasPreviousPosition) {
            // reset canvas position to previous position
            //     loadDiagramZoomAndPosition(diagramEngine);
            // } else {
            // change canvas position to first node
            diagramEngine.zoomToFitNodes({
                maxZoom: 1,
            });
            // }
            diagramEngine.repaintCanvas();
            // update the diagram model state
            setDiagramModel(newDiagramModel);
        }, 1000);
    };

    const context: DiagramContextState = {
        flow: flow,
    };

    return (
        <>
            {diagramEngine && diagramModel && (
                <DiagramContextProvider value={context}>
                    <DiagramCanvas>
                        <CanvasWidget engine={diagramEngine} />
                    </DiagramCanvas>
                </DiagramContextProvider>
            )}
        </>
    );
}
