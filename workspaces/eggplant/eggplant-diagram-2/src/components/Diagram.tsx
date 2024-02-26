/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState, useEffect } from "react";
import { DiagramEngine, DiagramModel } from "@projectstorm/react-diagrams";
import { CanvasWidget } from "@projectstorm/react-canvas-core";
import { SizingVisitor } from "../visitors/SizingVisitor";
import { PositionVisitor } from "../visitors/PositionVisitor";
import { generateEngine } from "../utils/diagram";
import { DiagramCanvas } from "./DiagramCanvas";
import { NodeFactoryVisitor } from "../visitors/NodeFactoryVisitor";
import { BaseNodeModel } from "./nodes/BaseNode/BaseNodeModel";
import { Flow, Node } from "../utils/types";
import { traverseFlow, traverseNode } from "../utils/ast";
import { NodeLinkModel } from "./NodeLink/NodeLinkModel";

export interface DiagramProps {
    model: Node;
}

export function Diagram(props: DiagramProps) {
    const { model } = props;

    const [diagramEngine] = useState<DiagramEngine>(generateEngine());
    const [diagramModel, setDiagramModel] = useState<DiagramModel | null>(null);

    useEffect(() => {
        if (diagramEngine) {
            const { nodes, links } = getDiagramData();
            drawDiagram(nodes, links);
        }
    }, []);

    const getDiagramData = () => {
        // run sizing visitor
        const sizingVisitor = new SizingVisitor();
        traverseNode(model, sizingVisitor);
        // run position visitor
        const positionVisitor = new PositionVisitor();
        traverseNode(model, positionVisitor);
        // run node visitor
        const nodeVisitor = new NodeFactoryVisitor();
        traverseNode(model, nodeVisitor);

        const nodes = nodeVisitor.getNodes();
        const links = nodeVisitor.getLinks();
        return { nodes, links };
    };

    const drawDiagram = (nodes: BaseNodeModel[], links: NodeLinkModel[]) => {
        const newDiagramModel = new DiagramModel();
        newDiagramModel.addAll(...nodes, ...links);
        diagramEngine.setModel(newDiagramModel);
        setDiagramModel(newDiagramModel);
    };

    return (
        <>
            {diagramEngine && diagramModel && (
                <DiagramCanvas>
                    <CanvasWidget engine={diagramEngine} />
                </DiagramCanvas>
            )}
        </>
    );
}
