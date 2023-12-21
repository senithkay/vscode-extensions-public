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
import {
    CodeNodeProperties,
    ExtendedPort,
    Flow,
    HttpRequestNodeProperties,
    InputPort,
    Node,
    OutputPort,
    SwitchNodeProperties,
} from "../types";
import { DEFAULT_TYPE } from "../resources";
import { isFixedNode } from "./node";

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
    const fixedNode = isFixedNode(node.templateId);
    // add node ports
    let portCount = 1;
    node.inputPorts?.forEach((inputPort) => {
        const portId = inputPort.id || getPortId(node.name, true, portCount++);
        if (ports.some((port) => port.id === portId)) {
            return;
        }
        let port = nodeModel.addInPort(portId, inputPort, fixedNode);
        ports.push({ ...inputPort, parent: nodeId, in: true, model: port });
    });
    portCount = 1;
    node.outputPorts?.forEach((outputPort) => {
        const portId = outputPort.id || getPortId(node.name, false, portCount++);
        if (ports.some((port) => port.id === portId)) {
            return;
        }
        let port = nodeModel.addOutPort(portId, outputPort, fixedNode);
        ports.push({ ...outputPort, parent: nodeId, in: false, model: port });
    });
    // add default ports if none
    const defaultPorts = addDefaultNodes(node, nodeModel, nodeId, fixedNode);
    ports.push(...defaultPorts);

    return { model: nodeModel, ports: ports };
}

function addDefaultNodes(node: Node, nodeModel: DefaultNodeModel, nodeId: string, fixedNode: boolean) {
    let ports: ExtendedPort[] = [];
    switch (node.templateId) {
        case "StartNode":
            if (node.outputPorts?.length === 0) {
                const portId = getPortId(node.name, false, 1);
                const port = nodeModel.addOutPort(
                    portId,
                    {
                        id: portId,
                        type: DEFAULT_TYPE,
                        name: portId,
                    },
                    fixedNode
                );
                ports.push({ id: portId, type: DEFAULT_TYPE, name: portId, parent: nodeId, in: false, model: port });
            }
            break;
        case "HttpResponseNode":
            if (node.inputPorts?.length === 0) {
                const portId = getPortId(node.name, true, 1);
                const port = nodeModel.addInPort(portId, undefined, fixedNode);
                ports.push({ id: portId, type: DEFAULT_TYPE, name: portId, parent: nodeId, in: true, model: port });
            }
            break;
        case "SwitchNode":
            const nodeProperties = node.properties as SwitchNodeProperties;
            if (node.inputPorts?.length === 0) {
                const portId = getPortId(node.name, true, 1);
                const port = nodeModel.addInPort(
                    portId,
                    {
                        id: portId,
                        type: DEFAULT_TYPE,
                        name: portId,
                    },
                    fixedNode
                );
                ports.push({ id: portId, type: DEFAULT_TYPE, name: portId, parent: nodeId, in: true, model: port });
            }
            if (node.outputPorts?.length === 0 && nodeProperties.cases?.length > 0) {
                nodeProperties.cases.forEach((caseItem, index) => {
                    const portId = caseItem.nodes[0] || getPortId(node.name, false, index + 1);
                    const port = nodeModel.addOutPort(portId, undefined, fixedNode);
                    ports.push({
                        id: portId,
                        type: DEFAULT_TYPE,
                        name: portId,
                        parent: nodeId,
                        in: false,
                        model: port,
                    });
                });
                const portId = nodeProperties.defaultCase.nodes[0] || getPortId(node.name, false, "default");
                const port = nodeModel.addOutPort(
                    portId,
                    {
                        id: portId,
                        type: DEFAULT_TYPE,
                        name: portId,
                    },
                    fixedNode
                );
                ports.push({ id: portId, type: DEFAULT_TYPE, name: portId, parent: nodeId, in: false, model: port });
            } else if (node.outputPorts?.length < nodeProperties.cases?.length + 1) {
                nodeProperties.cases.forEach((caseItem, index) => {
                    const portId = caseItem.nodes[0] || getPortId(node.name, false, index + 1);
                    if (node.outputPorts?.some((port) => port.id === portId)) {
                        return;
                    }
                    const port = nodeModel.addOutPort(portId, undefined, fixedNode);
                    ports.push({
                        id: portId,
                        type: DEFAULT_TYPE,
                        name: portId,
                        parent: nodeId,
                        in: false,
                        model: port,
                    });
                });
                const portId = nodeProperties.defaultCase.nodes[0] || getPortId(node.name, false, "default");
                if (node.outputPorts?.some((port) => port.id === portId)) {
                    return;
                }
                const port = nodeModel.addOutPort(portId, undefined, fixedNode);
                ports.push({ id: portId, type: DEFAULT_TYPE, name: portId, parent: nodeId, in: false, model: port });
            }
            break;
        case "CodeBlockNode":
            if (node.inputPorts?.length === 0) {
                const portId = getPortId(node.name, true, 1);
                let port = nodeModel.addInPort(
                    portId,
                    {
                        id: portId,
                        type: DEFAULT_TYPE,
                        name: portId,
                    },
                    fixedNode
                );
                ports.push({ id: portId, type: DEFAULT_TYPE, name: portId, parent: nodeId, in: true, model: port });
            }
            if (node.outputPorts?.length === 0) {
                let portId = getPortId(node.name, false, 1);
                let port = nodeModel.addOutPort(
                    portId,
                    {
                        id: portId,
                        type: DEFAULT_TYPE,
                        name: portId,
                    },
                    fixedNode
                );
                ports.push({ id: portId, type: DEFAULT_TYPE, name: portId, parent: nodeId, in: false, model: port });
                const codeNodeProperties: CodeNodeProperties = {
                    ...node.properties,
                    codeBlock: {
                        expression: "",
                    },
                    returnVar: "payload",
                };
                node.properties = codeNodeProperties;
                nodeModel.setNode(node);
            }
            break;
        case "TransformNode":
            const defaultInputType = "string";
            if (node.inputPorts?.length === 0) {
                const portId = getPortId(node.name, true, 1);
                let port = nodeModel.addInPort(
                    portId,
                    {
                        id: portId,
                        type: defaultInputType,
                        name: portId,
                    },
                    fixedNode
                );
                ports.push({ id: portId, type: defaultInputType, name: portId, parent: nodeId, in: true, model: port });
            }
            if (node.outputPorts?.length === 0) {
                let portId = getPortId(node.name, false, 1);
                let port = nodeModel.addOutPort(
                    portId,
                    {
                        id: portId,
                        type: defaultInputType,
                        name: portId,
                    },
                    fixedNode
                );
                ports.push({
                    id: portId,
                    type: defaultInputType,
                    name: portId,
                    parent: nodeId,
                    in: false,
                    model: port,
                });
                const codeNodeProperties: CodeNodeProperties = {
                    ...node.properties,
                    codeBlock: {
                        expression: "",
                    },
                };
                node.properties = codeNodeProperties;
                nodeModel.setNode(node);
            }
            break;
        case "HttpRequestNode":
            const httpNodeProperties: HttpRequestNodeProperties = {
                ...node.properties,
                basePath: "",
                path: "",
                action: "GET",
                headers: [],
                endpointName: "",
                type: "",
            };
            node.properties = httpNodeProperties;
            nodeModel.setNode(node);
        default:
            if (node.inputPorts?.length === 0) {
                const portId = getPortId(node.name, true, 1);
                let port = nodeModel.addInPort(
                    portId,
                    {
                        id: portId,
                        type: DEFAULT_TYPE,
                        name: portId,
                    },
                    fixedNode
                );
                ports.push({ id: portId, type: DEFAULT_TYPE, name: portId, parent: nodeId, in: true, model: port });
            }
            if (node.outputPorts?.length === 0) {
                let portId = getPortId(node.name, false, 1);
                let port = nodeModel.addOutPort(
                    portId,
                    {
                        id: portId,
                        type: DEFAULT_TYPE,
                        name: portId,
                    },
                    fixedNode
                );
                ports.push({ id: portId, type: DEFAULT_TYPE, name: portId, parent: nodeId, in: false, model: port });
            }
            break;
    }

    return ports;
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

export function getPortId(nodeId: string, inPort: boolean, portId: string | number) {
    return `${inPort ? "in" : "out"}_${portId.toString()}`;
}

function getPortFromFlowPorts(ports: ExtendedPort[], parent: string, inPort: boolean, linkNodeId: string) {
    return ports.find(
        (port) =>
            port.parent === parent &&
            port.in === inPort &&
            ((inPort && port.sender === linkNodeId) || (!inPort && port.receiver === linkNodeId))
    );
}

export function generateFlowModelFromDiagramModel(
    flowModel: Flow,
    diagramModel: DiagramModel<DiagramModelGenerics>
): Flow {
    const model: Flow = {
        id: flowModel.id,
        name: flowModel.name,
        nodes: [],
        fileName: flowModel.fileName,
        bodyCodeLocation: flowModel.bodyCodeLocation,
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
        defaultNode.getInPorts().forEach((inPort) => {
            const receiverPortModel = inPort.getOptions().port;
            Object.values(inPort.getLinks()).forEach((link) => {
                const sourcePortID = link.getSourcePort()?.getID();
                diagramModel.getNodes().forEach((node) => {
                    //get the matching node for portID
                    const defaultNode = node as DefaultNodeModel;
                    defaultNode.getOutPorts().forEach((outPort) => {
                        const senderPortModel = outPort.getOptions().port;
                        if (outPort.getID() === sourcePortID) {
                            inPorts.push({
                                id: receiverPortModel?.id || inPort.getName() || inPort.getID(),
                                type: senderPortModel?.type || DEFAULT_TYPE,
                                name: senderPortModel?.name || outPort.getName(),
                                sender: defaultNode.getName(),
                            });
                        }
                    });
                });
            });
        });
        defaultNode.getOutPorts().forEach((outPort) => {
            const senderPortModel = outPort.getOptions().port;
            Object.values(outPort.getLinks()).forEach((link) => {
                const targetPortID = link.getTargetPort()?.getID();
                diagramModel.getNodes().forEach((node) => {
                    //get the matching node for portID
                    const defaultNode = node as DefaultNodeModel;
                    defaultNode.getInPorts().forEach((inPort) => {
                        const receiverPortMode = inPort.getOptions().port;
                        if (inPort.getID() === targetPortID) {
                            outPorts.push({
                                id: senderPortModel?.id || outPort.getName() || outPort.getID(),
                                type: receiverPortMode?.type || DEFAULT_TYPE,
                                name: receiverPortMode?.name || inPort.getName(),
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
                x: Math.floor(defaultNode.getX()),
                y: Math.floor(defaultNode.getY()),
            },
            inputPorts: inPorts,
            outputPorts: outPorts,
        };
        // add properties if any
        if (nodeModel.properties) {
            newNode.properties = nodeModel.properties;
        }
        flowModelNodes?.push(newNode);
    });
    return model;
}
