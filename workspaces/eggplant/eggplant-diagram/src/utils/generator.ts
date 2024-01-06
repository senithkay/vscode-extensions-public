/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { DiagramModel, DiagramModelGenerics, LinkModel } from "@projectstorm/react-diagrams";
import { DefaultLinkModel, DefaultNodeModel } from "../components/default";
import { ExtendedPort, Flow, InputPort, Node, OutputPort, SwitchNodeProperties } from "../types";
import { DEFAULT_TYPE } from "../resources";
import { getEncodedNodeMetadata, getNodeMetadata } from "@wso2-enterprise/eggplant-core";

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
    // add in ports
    node.inputPorts?.forEach((inputPort, index) => {
        let portId = getPortId(inputPort.name, true, index);
        let port = nodeModel.addInPort(portId, inputPort);
        ports.push({ ...inputPort, parent: nodeId, in: true, model: port });
    });
    // add out ports
    if (node.templateId === "SwitchNode" && false) { // HACK: Switch node flow need to revisit
        // cases will be added as node ports
        const nodeProperties = node.properties as SwitchNodeProperties;
        // get output port type from inputPort type
        let inputType = node.inputPorts?.[0]?.type || DEFAULT_TYPE;
        if (inputType === "None") {
            // TODO: Remove this once BE is fixed
            inputType = DEFAULT_TYPE;
        }
        nodeProperties.cases?.forEach((caseItem, index) => {
            const caseId = getCaseId(index + 1);
            let port = nodeModel.addOutPort(caseId, {
                id: caseId,
                type: inputType,
                name: caseId,
            });
            ports.push({ id: caseId, type: inputType, parent: nodeId, in: false, model: port });
        });
        // default case will be added as node port
        const defaultCaseId = getCaseId("Default");
        let port = nodeModel.addOutPort(defaultCaseId, {
            id: defaultCaseId,
            type: inputType,
            name: defaultCaseId,
        });
        ports.push({ id: defaultCaseId, type: inputType, parent: nodeId, in: false, model: port });
    } else {
        // output ports will be added as node ports
        node.outputPorts?.forEach((outputPort, index) => {
            if (node.templateId === "StartNode" && index > 0) {
                return; // skip adding multiple ports for switch node
            }
            let portId = getPortId(outputPort.name, false, index);
            let port = nodeModel.addOutPort(portId, outputPort);
            ports.push({ ...outputPort, parent: nodeId, in: false, model: port });
        });
        // add default ports if none
        if (node.metadata && getNodeMetadata(node)) {
            // enrich node with metadata
            const defaultPorts = addDefaultPortsFromMetadata(node, nodeModel, nodeId);
            if (defaultPorts?.length > 0) {
                ports.push(...defaultPorts);
            }
        } else {
            const defaultPorts = addDefaultPorts(node, nodeModel, nodeId);
            if (defaultPorts?.length > 0) {
                ports.push(...defaultPorts);
            }
        }
    }

    return { model: nodeModel, ports: ports };
}

// add default ports without checking for metadata
function addDefaultPorts(node: Node, nodeModel: DefaultNodeModel, nodeId: string) {
    let ports: ExtendedPort[] = [];
    switch (node.templateId) {
        case "StartNode":
            if (node.outputPorts?.length === 0) {
                const portId = getPortId(node.name, false, 1);
                const port = nodeModel.addOutPort(portId, {
                    id: portId,
                    type: DEFAULT_TYPE,
                    name: portId,
                });
                ports.push({ id: portId, type: DEFAULT_TYPE, name: portId, parent: nodeId, in: false, model: port });
            }
            break;
        case "HttpResponseNode":
            if (node.inputPorts?.length === 0) {
                const portId = getPortId(node.name, true, 1);
                const port = nodeModel.addInPort(portId, undefined);
                ports.push({ id: portId, type: DEFAULT_TYPE, name: portId, parent: nodeId, in: true, model: port });
            }
            break;
        case "SwitchNode":
            const nodeProperties = node.properties as SwitchNodeProperties;
            if (node.inputPorts?.length === 0) {
                const portId = getPortId(node.name, true, 1);
                const port = nodeModel.addInPort(portId, {
                    id: portId,
                    type: DEFAULT_TYPE,
                    name: portId,
                });
                ports.push({ id: portId, type: DEFAULT_TYPE, name: portId, parent: nodeId, in: true, model: port });
            }
            if (node.outputPorts?.length === 0 && nodeProperties.cases?.length > 0) {
                nodeProperties.cases.forEach((caseItem, index) => {
                    const portId = caseItem.nodes[0] || getPortId(node.name, false, index + 1);
                    const port = nodeModel.addOutPort(portId, undefined);
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
                const port = nodeModel.addOutPort(portId, {
                    id: portId,
                    type: DEFAULT_TYPE,
                    name: portId,
                });
                ports.push({ id: portId, type: DEFAULT_TYPE, name: portId, parent: nodeId, in: false, model: port });
            } else if (node.outputPorts?.length < nodeProperties.cases?.length + 1) {
                nodeProperties.cases.forEach((caseItem, index) => {
                    const portId = caseItem.nodes[0] || getPortId(node.name, false, index + 1);
                    if (node.outputPorts?.some((port) => port.id === portId)) {
                        return;
                    }
                    const port = nodeModel.addOutPort(portId, undefined);
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
                const port = nodeModel.addOutPort(portId, undefined);
                ports.push({ id: portId, type: DEFAULT_TYPE, name: portId, parent: nodeId, in: false, model: port });
            }
            break;
        case "CodeBlockNode":
            if (node.inputPorts?.length === 0) {
                const portId = getPortId(node.name, true, 1);
                let port = nodeModel.addInPort(portId, {
                    id: portId,
                    type: DEFAULT_TYPE,
                    name: portId,
                });
                ports.push({ id: portId, type: DEFAULT_TYPE, name: portId, parent: nodeId, in: true, model: port });
            }
            if (node.outputPorts?.length === 0) {
                let portId = getPortId(node.name, false, 1);
                let port = nodeModel.addOutPort(portId, {
                    id: portId,
                    type: DEFAULT_TYPE,
                    name: portId,
                });
                ports.push({ id: portId, type: DEFAULT_TYPE, name: portId, parent: nodeId, in: false, model: port });
            }
            break;
        case "TransformNode":
            const defaultInputType = "string";
            if (node.inputPorts?.length === 0) {
                const portId = getPortId(node.name, true, 1);
                let port = nodeModel.addInPort(portId, {
                    id: portId,
                    type: defaultInputType,
                    name: portId,
                });
                ports.push({ id: portId, type: defaultInputType, name: portId, parent: nodeId, in: true, model: port });
            }
            if (node.outputPorts?.length === 0) {
                let portId = getPortId(node.name, false, 1);
                let port = nodeModel.addOutPort(portId, {
                    id: portId,
                    type: defaultInputType,
                    name: portId,
                });
                ports.push({
                    id: portId,
                    type: defaultInputType,
                    name: portId,
                    parent: nodeId,
                    in: false,
                    model: port,
                });
            }
            break;
        default:
            if (node.inputPorts?.length === 0) {
                const portId = getPortId(node.name, true, 1);
                let port = nodeModel.addInPort(portId, {
                    id: portId,
                    type: DEFAULT_TYPE,
                    name: portId,
                });
                ports.push({ id: portId, type: DEFAULT_TYPE, name: portId, parent: nodeId, in: true, model: port });
            }
            if (node.outputPorts?.length === 0) {
                let portId = getPortId(node.name, false, 1);
                let port = nodeModel.addOutPort(portId, {
                    id: portId,
                    type: DEFAULT_TYPE,
                    name: portId,
                });
                ports.push({ id: portId, type: DEFAULT_TYPE, name: portId, parent: nodeId, in: false, model: port });
            }
            break;
    }

    return ports;
}

// Add default ports only if metadata input/output type present
function addDefaultPortsFromMetadata(node: Node, nodeModel: DefaultNodeModel, nodeId: string) {
    const nodeMetadata = getNodeMetadata(node);
    let ports: ExtendedPort[] = [];

    switch (node.templateId) {
        case "StartNode":
            if (node.outputPorts?.length === 0 && nodeMetadata?.outputs?.length > 0) {
                nodeMetadata.outputs.forEach((input) => {
                    const portId = getPortId(node.name, false, input.name);
                    let port = nodeModel.addOutPort(portId, {
                        id: portId,
                        type: input.type,
                        name: input.name,
                    });
                    ports.push({
                        id: portId,
                        type: input.type,
                        name: input.name,
                        parent: nodeId,
                        in: false,
                        model: port,
                    });
                });
            }
            break;
        case "CodeBlockNode":
        case "TransformNode":
            if (node.inputPorts?.length === 0 && nodeMetadata?.inputs?.length > 0) {
                nodeMetadata.inputs.forEach((input, index) => {
                    const portId = getPortId(node.name, true, input.name);
                    let port = nodeModel.addInPort(portId, {
                        id: portId,
                        type: input.type,
                        name: input.name,
                    });
                    ports.push({
                        id: portId,
                        type: input.type,
                        name: input.name,
                        parent: nodeId,
                        in: true,
                        model: port,
                    });
                });
            }
            if (node.outputPorts?.length === 0 && nodeMetadata?.outputs?.length > 0) {
                nodeMetadata.outputs.forEach((input, index) => {
                    const portId = getPortId(node.name, false, input.name);
                    let port = nodeModel.addOutPort(portId, {
                        id: portId,
                        type: input.type,
                        name: input.name,
                    });
                    ports.push({
                        id: portId,
                        type: input.type,
                        name: input.name,
                        parent: nodeId,
                        in: false,
                        model: port,
                    });
                });
            }
            break;
        case "NewPayloadNode":
            if (node.outputPorts?.length === 0 && nodeMetadata?.outputs?.length > 0) {
                nodeMetadata.outputs.forEach((input, index) => {
                    const portId = getPortId(node.name, false, input.name);
                    let port = nodeModel.addOutPort(portId, {
                        id: portId,
                        type: input.type,
                        name: input.name,
                    });
                    ports.push({
                        id: portId,
                        type: input.type,
                        name: input.name,
                        parent: nodeId,
                        in: false,
                        model: port,
                    });
                });
            }
            break;
        default:
    }

    return ports;
}

function getLinkModels(node: Node, ports: ExtendedPort[]) {
    let links: LinkModel[] = [];
    let nodeId = getNodeIdentifier(node);

    if (node.templateId === "SwitchNode" && false) {
        node.outputPorts?.forEach((outputPort) => {
            let outPort: ExtendedPort;
            // get the matching case port
            const nodeProperties = node.properties as SwitchNodeProperties;
            nodeProperties.cases?.forEach((caseItem, index) => {
                if (caseItem.nodes.includes(outputPort.id)) {
                    const casePortName = getCaseId(index + 1);
                    outPort = getCasePortFromFlowPorts(ports, casePortName);
                }
            });
            if (!outPort && nodeProperties.defaultCase.nodes.includes(outputPort.id)) {
                const defaultCasePortName = getCaseId("Default");
                outPort = getCasePortFromFlowPorts(ports, defaultCasePortName);
            }
            let inPort = getPortFromFlowPorts(ports, outputPort.receiver, true, nodeId);
            if (!(inPort && inPort.model)) {
                return;
            }
            let link = inPort.model.link(outPort.model) as DefaultLinkModel;
            if (link && outputPort.receiver) {
                link.setReceiver(outputPort.receiver);
                console.log(">>> link updated", link);
            }

            links.push(link);
        });
    } else {
        node.outputPorts?.forEach((outputPort) => {
            let outP = getPortFromFlowPorts(ports, nodeId, false, outputPort.receiver);
            if (!outP?.model) {
                return;
            }
            let inP = getPortFromFlowPorts(ports, outputPort.receiver, true, nodeId);
            if (!inP?.model) {
                return;
            }
            let link = outP.model.link(inP.model);
            links.push(link);
        });
        // node.inputPorts?.forEach((inputPort) => {
        //     let inPort = getPortFromFlowPorts(ports, nodeId, true, inputPort.sender);
        //     if (!inPort?.model) {
        //         return;
        //     }
        //     let outPort = getPortFromFlowPorts(ports, inputPort.sender, false, nodeId);
        //     if (!outPort?.model) {
        //         return;
        //     }
        //     let link = outPort.model.link(inPort.model);
        //     links.push(link);
        // });
    }
    return links;
}

function getNodeIdentifier(node: Node) {
    return node.name;
}

export function getPortId(nodeId: string, inPort: boolean, portId: string | number) {
    return `${inPort ? "inVar" : "outVar"}${portId.toString()}`;
}

export function getCaseId(id: "Default" | number) {
    return `outCase${id.toString()}`;
}

function getPortFromFlowPorts(ports: ExtendedPort[], parent: string, inPort: boolean, linkNodeId: string) {
    if (!inPort && parent === "StartNode") {
        return ports.find((port) => port.parent === parent && port.in === false);
    }

    return ports.find(
        (port) =>
            port.parent === parent &&
            port.in === inPort &&
            ((inPort && port.sender === linkNodeId) || (!inPort && port.receiver === linkNodeId))
    );
}

function getCasePortFromFlowPorts(ports: ExtendedPort[], caseName: string) {
    return ports.find((port) => port.id === caseName);
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
        fileSourceRange: flowModel.fileSourceRange,
    };
    // update the flowModel with data retrieved from the diagramModel
    const flowModelNodes = model.nodes;

    console.log(">>> diagramModel", diagramModel.serialize());

    // update the canvasPosition of each node
    diagramModel.getNodes().forEach((dnode, index) => {
        const nodeModel = dnode as DefaultNodeModel;
        const node = nodeModel.getNode();
        // get input and output ports
        const inPorts: InputPort[] = [];
        const outPorts: OutputPort[] = [];
        nodeModel.getInPorts().forEach((inPort) => {
            const receiverPortModel = inPort.getOptions().port;
            Object.values(inPort.getLinks()).forEach((link) => {
                const sourcePortID = link.getSourcePort()?.getID();
                diagramModel.getNodes().forEach((subNode) => {
                    //get the matching node for portID
                    const defaultNode = subNode as DefaultNodeModel;
                    defaultNode.getOutPorts().forEach((outPort) => {
                        const senderPortModel = outPort.getOptions().port;
                        if (outPort.getID() === sourcePortID) {
                            inPorts.push({
                                id: index.toString(),
                                type: senderPortModel?.type || DEFAULT_TYPE, // Use sender port type if available
                                name: receiverPortModel?.name || inPort.getName(),
                                sender: defaultNode.getName(),
                            });
                        }
                    });
                });
            });
        });
        if (nodeModel.getKind() === "SwitchNode" && false) { // HACK: Switch node flow need to revisit
            nodeModel.getOutPorts().forEach((outPort, index) => {
                const senderPortModel = outPort.getOptions().port;
                Object.values(outPort.getLinks()).forEach((link) => {
                    outPorts.push({
                        id: index.toString(),
                        type: senderPortModel?.type || DEFAULT_TYPE,
                        name: senderPortModel?.name || outPort.getName(),
                        receiver: (link as DefaultLinkModel).getOptions().receiver,
                    });
                });
            });
        } else {
            nodeModel.getOutPorts().forEach((outPort, index) => {
                const senderPortModel = outPort.getOptions().port;
                Object.values(outPort.getLinks()).forEach((link) => {
                    const targetPortID = link.getTargetPort()?.getID();
                    diagramModel.getNodes().forEach((subNode) => {
                        //get the matching node for portID
                        const defaultNode = subNode as DefaultNodeModel;
                        defaultNode.getInPorts().forEach((inPort) => {
                            if (inPort.getID() === targetPortID) {
                                outPorts.push({
                                    id: index.toString(),
                                    type: senderPortModel?.type || DEFAULT_TYPE,
                                    name: senderPortModel?.name || outPort.getName(),
                                    receiver: defaultNode.getName(),
                                });
                            }
                        });
                    });
                });
            });
        }

        if (nodeModel.getKind() === "SwitchNode" && false) { // HACK: Switch node flow need to revisit
            // updates the switch node properties with the unique outPorts
            // port names are used as unique identifiers for switch node cases
            const switchNodeProperties = nodeModel.getNode().properties as SwitchNodeProperties;
            switchNodeProperties.cases?.forEach((caseItem, index) => {
                const casePortName = getCaseId(index + 1);
                caseItem.nodes = outPorts
                    .map((outPort) => {
                        if (outPort.name === casePortName) {
                            return outPort.id;
                        }
                    })
                    .filter((node) => node !== undefined);
            });
            const defaultCasePortName = getCaseId("Default");
            switchNodeProperties.defaultCase.nodes = outPorts
                .map((outPort) => {
                    if (outPort.name === defaultCasePortName) {
                        return outPort.id;
                    }
                })
                .filter((node) => node !== undefined);
        }
        if (nodeModel.getKind() === "SwitchNode") {
            // each case will have a unique outPort
            const switchNodeProperties = nodeModel.getNode().properties as SwitchNodeProperties;
            switchNodeProperties.cases?.forEach((caseItem, index) => {
                const port = outPorts.at(index);
                if (port) {
                    caseItem.nodes = [port.id];
                }
            });
            if(outPorts.length > switchNodeProperties.cases.length) {
                const port = outPorts.at(switchNodeProperties.cases.length);
                if (port) {
                    switchNodeProperties.defaultCase.nodes = [port.id];
                }
            }
        }

        // get codeLocation
        let codePosition = node?.codeLocation;
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
            name: nodeModel.getName(),
            templateId: nodeModel.getKind(),
            codeLocation: codePosition,
            canvasPosition: {
                x: Math.floor(nodeModel.getX()),
                y: Math.floor(nodeModel.getY()),
            },
            inputPorts: inPorts,
            outputPorts: outPorts,
        };
        // add properties if any
        if (node.properties) {
            newNode.properties = node.properties;
        }
        // replace metadata if any
        if (node.metadata) {
            newNode.metadata = getEncodedNodeMetadata(node);
        }
        flowModelNodes?.push(newNode);
    });
    return model;
}
