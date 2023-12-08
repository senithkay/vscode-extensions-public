/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { DiagramModel, LinkModel } from "@projectstorm/react-diagrams";
import { DefaultNodeModel } from "../components/default";
import { Colors } from "../resources";
import { ExtendedPort, Flow, Node } from "../types";

export function generateDiagramModelFromFlowModel(diagramModel: DiagramModel, flowModel: Flow) {
    let flowPorts: ExtendedPort[] = [];
    // add nodes
    flowModel.nodes?.forEach((node) => {
        let nodeModel = getNodeModel(node);
        if (!nodeModel || !nodeModel.model) {
            return;
        }
        diagramModel.addNode(nodeModel.model);
        // keep track of ports
        flowPorts.push(...nodeModel.ports);
    });
    // add links
    flowModel.nodes?.forEach((node) => {
        let linkModels = getLinkModels(node, flowPorts);
        if (!linkModels || linkModels.length === 0) {
            return;
        }
        linkModels.forEach((linkModel) => {
            diagramModel.addLink(linkModel);
        });
    });
    return diagramModel;
}

interface GenNodeModel {
    model: DefaultNodeModel;
    ports: ExtendedPort[];
}

function getNodeModel(node: Node): GenNodeModel {
    let ports: ExtendedPort[] = [];
    let nodeId = getNodeIdentifier(node);
    let nodeModel = new DefaultNodeModel(nodeId, Colors.PRIMARY_CONTAINER); // TODO: Write a factory to get node based on kind (templateId)
    nodeModel.setPosition(node.canvasPosition.x, node.canvasPosition.y);
    // add node ports
    node.inputPorts?.forEach((inputPort) => {
        let port = nodeModel.addInPort(inputPort.id);
        ports.push({ ...inputPort, parent: nodeId, in: true, model: port });
    });
    node.outputPorts?.forEach((outputPort) => {
        let port = nodeModel.addOutPort(outputPort.id);
        ports.push({ ...outputPort, parent: nodeId, in: false, model: port });
    });

    return { model: nodeModel, ports: ports };
}

function getLinkModels(node: Node, ports: ExtendedPort[]) {
    let links: LinkModel[] = [];
    let nodeId = getNodeIdentifier(node);
    node.inputPorts?.forEach((inputPort) => {
        let inPort = getPortFromFlowPorts(ports, nodeId, true, inputPort.sender);
        if (!inPort?.model) {
            return;
        }
        let outPort = getPortFromFlowPorts(ports, inputPort.sender, false, nodeId);
        if (!outPort?.model) {
            return;
        }
        let link = outPort.model.link(inPort.model);
        links.push(link);
    });
    return links;
}

function getNodeIdentifier(node: Node) {
    return node.name;
}

function getPortIdentifier(nodeId: string, inPort: boolean, portId: string, linkNodeId?: string) {
    return `${nodeId}:${inPort ? "in" : "out"}:${portId}:${linkNodeId}`;
}

function getPortFromFlowPorts(ports: ExtendedPort[], parent: string, inPort: boolean, linkNodeId: string) {
    return ports.find(
        (port) => port.parent === parent && port.in === inPort && ((inPort && port.sender === linkNodeId) || (!inPort && port.receiver === linkNodeId))
    );
}
