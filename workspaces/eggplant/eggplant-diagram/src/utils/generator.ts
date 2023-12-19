/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { DiagramModel, DiagramModelGenerics, LinkModel } from "@projectstorm/react-diagrams";
import { DefaultNodeModel } from "../components/default";
import { ExtendedPort, Flow, InputPort, Node, OutputPort } from "../types";
import { NODE_TYPE } from "../resources";

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
    let nodeModel = new DefaultNodeModel({ node }); // TODO: Write a factory to get node based on kind (templateId)
    if (node.canvasPosition) {
        nodeModel.setPosition(node.canvasPosition.x, node.canvasPosition.y);
    }
    // add node ports
    let portCount = 1;
    node.inputPorts?.forEach((inputPort) => {
        const portId = inputPort.id || `in-${portCount++}`;
        let port = nodeModel.addInPort(portId, inputPort);
        ports.push({ ...inputPort, parent: nodeId, in: true, model: port });
    });
    portCount = 1;
    node.outputPorts?.forEach((outputPort) => {
        const portId = outputPort.id || `out-${portCount++}`;
        let port = nodeModel.addOutPort(portId, outputPort);
        ports.push({ ...outputPort, parent: nodeId, in: false, model: port });
    });
    // add default ports if none
    if (node.inputPorts?.length === 0) {
        let port = nodeModel.addInPort("in-1");
        ports.push({ id: "in-1", type: "any", name: "in-1", parent: nodeId, in: true, model: port });
    }
    if (node.outputPorts?.length === 0) {
        let port = nodeModel.addOutPort("out-1");
        ports.push({ id: "out-1", type: "any", name: "out-1", parent: nodeId, in: false, model: port });
        if (node.templateId === NODE_TYPE.SWITCH) {
            port = nodeModel.addOutPort("out-2");
            ports.push({ id: "out-2", type: "any", name: "out-2", parent: nodeId, in: false, model: port });
        }
    }

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

export function generateFlowModelFromDiagramModel(flowModel: Flow, diagramModel: DiagramModel<DiagramModelGenerics>): Flow {
    const defaultMsgType = "any"; // TODO: Get the type from the user
    const model: Flow = {
        id: flowModel.id,
        name: flowModel.name,
        nodes: [],
        fileName: flowModel.fileName,
    };
    // update the flowModel with data retrieved from the diagramModel
    const flowModelNodes = model.nodes;
    // update the canvasPosition of each node
    diagramModel.getNodes().forEach((node) => {
        const defaultNode = node as DefaultNodeModel;
        const nodeModel = defaultNode.getNode();
        // get input and output ports
        const inPorts: InputPort[] = [];
        const outPorts: OutputPort[] = [];
        defaultNode.getInPorts().forEach((port) => {
            const receiverPortModel = port.getOptions().port;
            Object.values(port.getLinks()).forEach((link) => {
                const sourcePortID = link.getSourcePort()?.getID();
                diagramModel.getNodes().forEach((node) => {
                    //get the matching node for portID
                    const defaultNode = node as DefaultNodeModel;
                    defaultNode.getOutPorts().forEach((port) => {
                        const senderPortModel = port.getOptions().port;
                        if (port.getID() === sourcePortID) {
                            inPorts.push({
                                id: receiverPortModel?.id || port.getID(),
                                type: senderPortModel?.type || defaultMsgType,
                                name: senderPortModel?.name || port.getName(),
                                sender: defaultNode.getName(),
                            });
                        }
                    });
                });
            });
        });
        defaultNode.getOutPorts().forEach((port) => {
            const senderPortModel = port.getOptions().port;
            Object.values(port.getLinks()).forEach((link) => {
                const targetPortID = link.getTargetPort()?.getID();
                diagramModel.getNodes().forEach((node) => {
                    //get the matching node for portID
                    const defaultNode = node as DefaultNodeModel;
                    defaultNode.getInPorts().forEach((port) => {
                        const receiverPortMode = port.getOptions().port;
                        if (port.getID() === targetPortID) {
                            outPorts.push({
                                id: senderPortModel?.id || port.getID(),
                                type: receiverPortMode?.type || defaultMsgType,
                                name: receiverPortMode?.name || port.getName(),
                                receiver: defaultNode.getName(),
                            });
                        }
                    });
                });
            });
        });
        // get codeLocation
        let codePosition = nodeModel?.codeLocation;
        if (!codePosition) {
            codePosition = {
                start: {
                    line: 0,
                    offset: 0,
                },
                end: {
                    line: 0,
                    offset: 0,
                },
            };
        }
        // create node
        let newNode: Node = {
            name: defaultNode.getName(),
            templateId: defaultNode.getKind(),
            codeLocation: codePosition,
            canvasPosition: {
                x: defaultNode.getX(),
                y: defaultNode.getY(),
            },
            inputPorts: inPorts,
            outputPorts: outPorts,
            codeBlock: nodeModel?.codeBlock || "",
        };
        // add properties if any
        if (nodeModel.properties) {
            newNode.properties = nodeModel.properties;
        }
        flowModelNodes?.push(newNode);
    });
    return model;
}
