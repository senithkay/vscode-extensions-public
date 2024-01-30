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
import { APIResource, Sequence, traversNode } from "@wso2-enterprise/mi-syntax-tree/src";
import { SizingVisitor } from "../visitors/SizingVisitor";
import { PositionVisitor } from "../visitors/PositionVisitor";
import { NodeVisitor } from "../visitors/NodeVisitor";
import { generateEngine } from "../utils/diagram";
import { DiagramCanvas } from "./DiagramCanvas";

export interface DiagramProps {
    model: APIResource | Sequence;
}

export function Diagram(props: DiagramProps) {
    const { model } = props;

    const [diagramEngine] = useState<DiagramEngine>(generateEngine());
    const [diagramModel, setDiagramModel] = useState<DiagramModel | null>(null);

    useEffect(() => {
        if (diagramEngine) {
            drawDiagram();
        }
    }, []);

    // run sizing visitor
    const sizingVisitor = new SizingVisitor();
    traversNode(model, sizingVisitor);
    // run position visitor
    const positionVisitor = new PositionVisitor();
    traversNode(model, positionVisitor);
    // run node visitor
    const nodeVisitor = new NodeVisitor();
    traversNode(model, nodeVisitor);
    const nodes = nodeVisitor.getNodes();
    console.log("nodes", nodes);

    // add node edges
    // setup react diagram engine
    // render diagram

    const drawDiagram = () => {
        const model = new DiagramModel();

        //TODO: add nodes to diagram model

        diagramEngine.setModel(model);
        setDiagramModel(model);
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
