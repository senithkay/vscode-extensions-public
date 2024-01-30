import * as React from "react";
import { css } from '@emotion/react';
import createEngine, {
    DefaultLinkModel,
    DefaultNodeModel,
    DiagramModel
} from '@projectstorm/react-diagrams';

import {
    CanvasWidget
} from '@projectstorm/react-canvas-core';
import { APIResource, Sequence, traversNode } from "@wso2-enterprise/mi-syntax-tree/src";
import { SizingVisitor } from "../visitors/SizingVisitor";
import { PositionVisitor } from "../visitors/PositionVisitor";
import { NodeFactoryVisitor } from "../visitors/NodeFactoryVisitor";

interface DiagramProps {
    model: APIResource | Sequence;
}


export const Diagram: React.FC<DiagramProps> = (props: DiagramProps) => {
    // 1) Visit model and calculate sizing 
    traversNode(props.model, new SizingVisitor());
    // 2) Visit model and calculate positions
    traversNode(props.model, new PositionVisitor)
    // 3) Initialize Diagram engine
    const engine = createEngine();
    const model = new DiagramModel();
    // 4) Create Diagram Nodes 
    const nodefactory = new NodeFactoryVisitor();
    traversNode(props.model, nodefactory);
    const nodes = nodefactory.getNodes();
    // 5) Create Links 
    // 6) Populate Diagram engine 
    // 7) Render the diagram!


    // Connect the nodes with links.
    // for (let i = 0; i < 4; i++) {
    //     let link = new DefaultLinkModel();
    //     link.setSourcePort(nodes[i].addOutPort(''));
    //     link.setTargetPort(nodes[i + 1].addInPort(''));
    //     model.addAll(link);
    // }

    // Add nodes to the model
    model.addAll(...nodes);

    // Load the model into the engine
    engine.setModel(model);

    return (
        <div style={{ height: '100vh' }}>
            <style>{`
                .canvas-widget{
                    height: 100vh;
                }
            `}</style>
            <CanvasWidget engine={engine} className="canvas-widget" />
        </div>
    );
}
