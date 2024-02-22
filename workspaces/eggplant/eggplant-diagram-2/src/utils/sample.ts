/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { BaseNodeModel } from "../components/nodes/BaseNode/BaseNodeModel";
import { createPortsLink } from "./diagram";
import { DiagramModel } from "@projectstorm/react-diagrams-core";
import { Flow } from "./types";

// Test data
export function sampleDiagram(model: Flow, diagramModel: DiagramModel) {
    var nodeList = model.nodes;

    let x = 100;
    let y = 100;
    let gapY = 110;
    let conY = 100;

    // create nodes
    var nodestart = new BaseNodeModel(nodeList[0]);
    nodestart.setPosition(x + 60 - 12, y);

    var node1 = new BaseNodeModel(nodeList[1]);
    node1.setPosition(x + 60 - 12, (y += gapY));

    // var node2 = new BaseNodeModel(nodeList[1]); // condition node
    // node2.setPosition(x + 60 - 28, (y += gapY));

    // var node3 = new BaseNodeModel(nodeList[2]);
    // node3.setPosition(x + conY, (y += gapY + 50));

    // var node5 = new MediatorNodeModel(mediatorList[6]);
    // node5.setPosition(x - conY, y);
    // var node5 = new EmptyNodeModel();
    // node5.setPosition(x - conY + 40, y);

    // var node4 = new BaseNodeModel(nodeList[12]);
    // node4.setPosition(x + conY, (y += gapY));

    // var nodeempty = new EmptyNodeModel();
    // nodeempty.setPosition(x + 60 - 4, (y += gapY));

    // create links
    let linkstart = createPortsLink(nodestart.getOutPort(), node1.getInPort(), {
        onAddClick: () => console.log(">>> onAddClick"),
    });
    // var link1 = createNodesLink(node1, node2);

    // var link2 = createPortsLink(node2.getOutPort(), node3.getInPort(), { label: "onAccept" });
    // var link3 = createPortsLink(node3.getOutPort(), node4.getInPort());
    // var linkend = createNodesLink(node4, nodeempty);

    // var link4 = createLink(node2.getOutPort(), node5.getInPort(), { label: "onReject", brokenLine: true });
    // var link4 = createNodesLink(node2, node5, { label: "onReject", brokenLine: true });
    // var linkend2 = createNodesLink(node5, nodeempty, { brokenLine: true });

    diagramModel.addAll(
        nodestart,
        node1,
        // node2,
        // node3,
        // node4,
        // node5,
        // nodeempty,
        linkstart,
        // link1,
        // link2,
        // link3,
        // link4,
        // linkend,
        // linkend2
    );

    console.log(">>> diagramModel", diagramModel);
}
