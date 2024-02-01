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
import { DiagramEngine, DiagramModel } from "@projectstorm/react-diagrams-core";
import { CallNodeModel } from "../components/nodes/CallNode/CallNodeModel";

// Test data
export function sampleDiagram(model: APIResource | Sequence, diagramModel: DiagramModel, engine: DiagramEngine) {
    var mediatorList = (model as APIResource).inSequence.mediatorList;
    console.log("mediatorList", mediatorList);

    let x = 100;
    let y = 100;
    let gapY = 110;
    let conY = 100;

    // create nodes
    var nodestart = new StartNodeModel((model as APIResource).inSequence);
    nodestart.setPosition(x + 60 - 12, y);

    var node1 = new MediatorNodeModel(mediatorList[0]);
    node1.setPosition(x, (y += gapY));

    var node2 = new ConditionNodeModel(mediatorList[1]); // condition node
    node2.setPosition(x + 60 - 28, (y += gapY));

    var node3 = new CallNodeModel(mediatorList[2]);
    node3.setPosition(x + conY, (y += gapY + 50));

    var node5 = new MediatorNodeModel(mediatorList[6]);
    node5.setPosition(x - conY, y);

    var node4 = new CallNodeModel(mediatorList[12], mediatorList[5]);
    node4.setPosition(x + conY, (y += gapY));

    var nodeend = new EndNodeModel();
    nodeend.setPosition(x + 60 - 12, (y += gapY + 10));

    // create links
    let linkstart = createLink(nodestart.getOutPort(), node1.getInPort(), {
        onAddClick: () => console.log("onAddClick"),
    });
    var link1 = createLink(node1.getOutPort(), node2.getInPort());
    var link2 = createLink(node2.getOutPort(), node3.getInPort(), { label: "onAccept" });
    var link3 = createLink(node3.getOutPort(), node4.getInPort());
    var link4 = createLink(node2.getOutPort(), node5.getInPort(), { label: "onReject" });
    var linkend = createLink(node4.getOutPort(), nodeend.getInPort(), { showAddButton: false });
    var linkend2 = createLink(node5.getOutPort(), nodeend.getInPort(), { showAddButton: true });

    diagramModel.addAll(
        nodestart,
        node1,
        node2,
        node3,
        node4,
        node5,
        nodeend,
        linkstart,
        link1,
        link2,
        link3,
        link4,
        linkend,
        linkend2
    );

    console.log("diagramModel", diagramModel);
}
