/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { APIResource, Sequence } from "@wso2-enterprise/mi-syntax-tree/src";
import { ConditionNodeModel } from "../components/nodes/ConditionNode/ConditionNodeModel";
import { EndNodeModel } from "../components/nodes/EndNode/EndNodeModel";
import { MediatorNodeModel } from "../components/nodes/MediatorNode/MediatorNodeModel";
import { StartNodeModel } from "../components/nodes/StartNode/StartNodeModel";
import { createLink } from "./diagram";
import { DiagramModel } from "@projectstorm/react-diagrams-core";
import { EndpointNodeModel } from "../components/nodes/EndpointNode/EndpointNodeModel";

// Test data
export function sampleDiagram(model: APIResource | Sequence, diagramModel: DiagramModel) {
    var mediatorList = (model as APIResource).inSequence.mediatorList;
    console.log("mediatorList", mediatorList);

    // create nodes
    var nodestart = new StartNodeModel((model as APIResource).inSequence);
    nodestart.setPosition(100 + 60 - 12, 100);

    var node1 = new MediatorNodeModel(mediatorList[0]);
    node1.setPosition(100, 180);

    var node2 = new ConditionNodeModel(mediatorList[1]); // condition node
    node2.setPosition(100 + 60 - 28, 280);

    var node3 = new MediatorNodeModel(mediatorList[2]);
    node3.setPosition(100, 400);

    var nodeep = new EndpointNodeModel(mediatorList[3]); // endpoint node
    nodeep.setPosition(400, 400); 

    var nodeend = new EndNodeModel();
    nodeend.setPosition(100 + 60 - 12, 500);

    // create links
    let linkstart = createLink(nodestart.getOutPort(), node1.getInPort());
    var link1 = createLink(node1.getOutPort(), node2.getInPort());
    var link2 = createLink(node2.getOutPort(), node3.getInPort());
    var linkep = createLink(node3.getRightPort(), nodeep.getInPort()); // endpoint link
    var linkend = createLink(node3.getOutPort(), nodeend.getInPort());

    diagramModel.addAll(nodestart, node1, node2, node3, nodeend, nodeep, linkstart, link1, link2, linkep, linkend);

    console.log("diagramModel", diagramModel);
}
