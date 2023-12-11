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
    nodeModel.setPosition(node.canvasPosition.x, node.canvasPosition.y);
    // add node ports
    node.inputPorts?.forEach((inputPort) => {
        let port = nodeModel.addInPort(inputPort.id, inputPort);
        ports.push({ ...inputPort, parent: nodeId, in: true, model: port });
    });
    node.outputPorts?.forEach((outputPort) => {
        let port = nodeModel.addOutPort(outputPort.id, outputPort);
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

// export function getUpdatedModel(diagramModel: DiagramModel<DiagramModelGenerics>, node: DefaultNodeModel, flowModel: Flow): Flow {
//     const model: Flow = JSON.parse(JSON.stringify(flowModel));
//     // const flowModelNodes = model.nodes;
//     // create newNode of type Node wit the data of node recieved as input to the function
//     const inports: InputPort[] = [];
//     const outports: OutputPort[] = [];
//     node.getInPorts().forEach((port) => {
//         inports.push({
//             id: port.getID(),
//             type: port.getType(),
//             name: port.getName(),
//         });
//     });
//     node.getOutPorts().forEach((port) => {
//         outports.push({
//             id: port.getID(),
//             type: port.getType(),
//         });
//     });

//     const codePosition: CodeLocation = {
//         start: {
//             line: 0,
//             offset: 0,
//         },
//         end: {
//             line: 0,
//             offset: 0,
//         },
//     };

//     var newNode: Node = {
//         id: node.getID(),
//         name: node.getName(),
//         templateId: node.getType(),
//         inputPorts: inports,
//         outputPorts: outports,
//         codeLocation: codePosition,
//         canvasPosition: node.getPosition(),
//     };

//     // update the flowModelNodes with the newNode
//     model.nodes?.push(newNode);
//     return model;
// }

export function getUpdatedModelForLinks(flowModel: Flow, link: LinkModel): Flow {
    const model: Flow = flowModel;
    const flowModelNodes: Node[] = model.nodes;

    var sourcePort = link.getSourcePort();
    var targetPort = link.getTargetPort();
    // find the sourcePort from the flowModelNodes
    var sourcePortNode = flowModelNodes?.find((node) => node.id === sourcePort?.getParent()?.getID());
    // find the targetPort from the flowModelNodes
    var targetPortNode = flowModelNodes?.find((node) => node.id === targetPort?.getParent()?.getID());
    // find the port from the sourcePortNode
    const sourcePortFromNode: OutputPort = sourcePortNode?.outputPorts?.find((port) => port.id === sourcePort?.getID());
    // update the details of sourcePortFromNode with the detials of sourcePort
    sourcePortFromNode.receiver = targetPortNode?.name;
    // find the port from the targetPortNode
    const targetPortFromNode: InputPort = targetPortNode?.inputPorts?.find((port) => port.id === targetPort?.getID());
    // update the details of targetPortFromNode with the detials of targetPort
    targetPortFromNode.sender = sourcePortNode?.name;
    return model;
}

export function generateFlowModelFromDiagramModel(flowModel: Flow, diagramModel: DiagramModel<DiagramModelGenerics>): Flow {
    const defaultMsgType = "any"; // TODO: Get the type from the user
    const model: Flow = {
        id: flowModel.id,
        name: flowModel.name,
        nodes: [],
        balFilename: flowModel.balFilename,
    };
    // update the flowModel with data retrieved from the diagramModel
    const flowModelNodes = model.nodes;
    console.log(diagramModel.serialize());
    // update the canvasPosition of each node
    diagramModel.getNodes().forEach((node) => {
        const inPorts: InputPort[] = [];
        const outPorts: OutputPort[] = [];
        const defaultNode = node as DefaultNodeModel;
        defaultNode.getOptions().node;
        defaultNode.getInPorts().forEach((port) => {
            Object.values(port.getLinks()).forEach((link) => {
                const sourcePortID = link.getSourcePort()?.getID();
                diagramModel.getNodes().forEach((node) => {
                    //get the matching node for portID
                    const defaultNode: DefaultNodeModel = node as DefaultNodeModel;
                    defaultNode.getOutPorts().forEach((port) => {
                        const nodePort = port.getOptions().port;
                        if (port.getID() === sourcePortID) {
                            inPorts.push({
                                id: nodePort?.id || port.getID(),
                                type: nodePort?.type || defaultMsgType,
                                name: nodePort?.name || port.getName(),
                                sender: defaultNode.getName(),
                            });
                        }
                    });
                });
            });
        });
        defaultNode.getOutPorts().forEach((port) => {
            Object.values(port.getLinks()).forEach((link) => {
                const targetPortID = link.getTargetPort()?.getID();
                diagramModel.getNodes().forEach((node) => {
                    //get the matching node for portID
                    const defaultNode: DefaultNodeModel = node as DefaultNodeModel;
                    defaultNode.getInPorts().forEach((port) => {
                        const nodePort = port.getOptions().port;
                        if (port.getID() === targetPortID) {
                            outPorts.push({
                                id: port.getID(),
                                type: nodePort?.type || defaultMsgType,
                                name: nodePort?.name || port.getName(),
                                receiver: defaultNode.getName(),
                            });
                        }
                    });
                });
            });
        });

        let codePosition = defaultNode.getNode()?.codeLocation;
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

        var newNode: Node = {
            // id: node.getID(),
            name: defaultNode.getName(),
            templateId: defaultNode.getKind(),
            codeLocation: codePosition,
            canvasPosition: node.getPosition(),
            inputPorts: inPorts,
            outputPorts: outPorts,
        };

        flowModelNodes?.push(newNode);
    });
    return model;
}
