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
import { generateEngine } from "../utils/diagram";
import { DiagramCanvas } from "./DiagramCanvas";
import { NodeFactoryVisitor } from "../visitors/NodeFactoryVisitor";
import { MediatorNodeModel } from "./nodes/MediatorNode/MediatorNodeModel";
import { NodeLinkModel } from "./NodeLink/NodeLinkModel";

export interface DiagramProps {
    model: APIResource | Sequence;
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
        traversNode(model, sizingVisitor);
        // run position visitor
        const positionVisitor = new PositionVisitor();
        traversNode(model, positionVisitor);
        // run node visitor
        const nodeVisitor = new NodeFactoryVisitor();
        traversNode(model, nodeVisitor);
        const nodes = nodeVisitor.getNodes();
        console.log("nodes", nodes);
        return nodes;
    };

    const drawDiagram = (nodes: MediatorNodeModel[]) => {
        const newDiagramModel = new DiagramModel();

        newDiagramModel.addAll(...nodes);

        // Start sample code
        // var mediatorList = (model as APIResource).inSequence.mediatorList;
        // console.log("mediatorList", mediatorList);
        // // create nodes
        // var node1 = new MediatorNodeModel(mediatorList[0]);
        // node1.setPosition(100, 100);
        // var updatedMediator = mediatorList[2];
        // updatedMediator.viewState.id = "abc-node";
        // var node2 = new MediatorNodeModel(updatedMediator);
        // node2.setPosition(100, 300);

        // // create links
        // let port1 = node1.getOutPorts().at(0);
        // let port2 = node2.getInPorts().at(0);
        // let link1 = new NodeLinkModel();
        // link1.setSourcePort(port1);
        // link1.setTargetPort(port2);
        // port1.addLink(link1);

        // newDiagramModel.addAll(node1, node2, link1);
        // End sample code

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
