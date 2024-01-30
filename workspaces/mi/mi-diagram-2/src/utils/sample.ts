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

// Test data
export function sampleDiagram(model: APIResource | Sequence, diagramModel: DiagramModel) {
    var mediatorList = (model as APIResource).inSequence.mediatorList;
    console.log("mediatorList", mediatorList);

    // create nodes
    var nodestart = new StartNodeModel((model as APIResource).inSequence);
    nodestart.setPosition(100 + 60 - 12, 100);

    var node1 = new MediatorNodeModel(mediatorList[0]);
    node1.setPosition(100, 180);

    var node3 = new ConditionNodeModel(mediatorList[1]);
    node3.setPosition(100 + 60 - 28, 280);

    var updatedMediator = mediatorList[2];
    updatedMediator.viewState.id = "abc-node";

    var node2 = new MediatorNodeModel(updatedMediator);
    node2.setPosition(100, 400);

    var nodeend = new EndNodeModel();
    nodeend.setPosition(100 + 60 - 12, 500);

    // create links
    let portstart = nodestart.getOutPort();
    let port0 = node1.getInPorts().at(0);
    let linkstart = createLink(portstart, port0);

    let port1 = node1.getOutPorts().at(0);
    let port4 = node3.getInPorts().at(0);
    let link1 = createLink(port1, port4);

    let port5 = node3.getOutPorts().at(0);
    let port2 = node2.getInPorts().at(0);
    let link2 = createLink(port5, port2);

    let port3 = node2.getOutPorts().at(0);
    let portend = nodeend.getInPort();
    let linkend = createLink(port3, portend);

    diagramModel.addAll(nodestart, node1, node2, node3, nodeend, linkstart, link1, link2, linkend);
}
