/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import createEngine, { DiagramModel, DefaultNodeModel, DefaultLinkModel } from "@projectstorm/react-diagrams";
import React from "react";
import { CanvasWidget } from "@projectstorm/react-canvas-core";
import { Container, DiagramContainer } from './utils/CanvasStyles';
import { Project } from "@wso2-enterprise/ballerina-languageclient";

interface SimpleDiagramProps {
    project: Project;
}

export function SimpleDiagram(props: SimpleDiagramProps) {
    const { project } = props;
    console.log("~~ project ~~");
    console.log(JSON.stringify(project));

    //1) setup the diagram engine
    var engine = createEngine();

    //2) setup the diagram model
    var model = new DiagramModel();

    //3-A) create a default node
    var node1 = new DefaultNodeModel({
        name: "Node 1",
        color: "rgb(0,192,255)",
    });
    node1.setPosition(100, 100);
    let port1 = node1.addOutPort("Out");

    //3-B) create another default node
    var node2 = new DefaultNodeModel("Node 2", "rgb(192,255,0)");
    let port2 = node2.addInPort("In");
    node2.setPosition(400, 100);

    // link the ports
    let link1 = port1.link<DefaultLinkModel>(port2);
    link1.getOptions().testName = "Test";
    link1.addLabel("Hello World!");

    //4) add the models to the root graph
    model.addAll(node1, node2, link1);

    //5) load model into engine
    engine.setModel(model);

    //6) render the diagram!
    return (
        <Container>
                <DiagramContainer onClick={()=>{}}>
                    <CanvasWidget engine={engine} />
                </DiagramContainer>
        </Container>
    );
}
