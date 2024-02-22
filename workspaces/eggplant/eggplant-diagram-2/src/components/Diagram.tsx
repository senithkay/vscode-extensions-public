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
import { Flow } from "../utils/types";
import { traverseFlow, traverseNode } from "../utils/ast";

export interface DiagramProps {
    model: Flow;
}

export function Diagram(props: DiagramProps) {
    const { model } = props;

    const [diagramEngine] = useState<DiagramEngine>(generateEngine());
    const [diagramModel, setDiagramModel] = useState<DiagramModel | null>(null);

    useEffect(() => {
        if (diagramEngine) {
            const nodes = getNodes();
            drawDiagram(nodes);
        }
    }, []);

    const getNodes = () => {
        // run sizing visitor
        const sizingVisitor = new SizingVisitor();
        traverseFlow(model, sizingVisitor);
        // run position visitor
        const positionVisitor = new PositionVisitor();
        traverseFlow(model, positionVisitor);
        // run node visitor
        const nodeVisitor = new NodeFactoryVisitor();
        traverseFlow(model, nodeVisitor);
        const nodes = nodeVisitor.getNodes();
        console.log(">>> getNodes", nodes);
        return nodes;
    };

    const drawDiagram = (nodes: BaseNodeModel[]) => {
        const newDiagramModel = new DiagramModel();
        newDiagramModel.addAll(...nodes);
        // uncomment below to see the sample diagram. comment above line
        // sampleDiagram(model, newDiagramModel);

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
