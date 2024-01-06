/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { DiagramModel } from "@projectstorm/react-diagrams";
import { DefaultNodeModel } from "../components/default";
import { DEFAULT_TYPE } from "../resources/constants";
import { Endpoint, Flow, HttpMethod, Node, NodeKinds, TransformNodeProperties } from "../types";
import { getPortId } from "./generator";
import { toTitleCase } from "./commons";

// get custom default node factory
export function getDefaultNodeModel(model: DiagramModel, type: NodeKinds, endpoint?: Endpoint, action?: HttpMethod) {
    let actionName = endpoint && action ? toTitleCase(endpoint.name + action.toUpperCase()) : undefined;
    let name = generateNodeName(model, type, actionName);
    let nodeModel = new DefaultNodeModel({ name: name, kind: type });

    let emptyNode: Node = {
        name: name,
        templateId: "CodeBlockNode",
        inputPorts: [],
        outputPorts: [],
        codeLocation: {
            start: {
                line: 0,
                offset: 0,
            },
            end: {
                line: 0,
                offset: 0,
            },
        },
        canvasPosition: {
            x: 0,
            y: 0,
        },
    };

    const inPortId = getPortId(name, true, 1);
    const outPortId = getPortId(name, false, 1);

    switch (type) {
        case "StartNode":
            nodeModel.addOutPort(outPortId);
            emptyNode.templateId = "StartNode";
            emptyNode.metadata = {
                outputs: [
                    {
                        name: "outVar",
                        type: "()",
                    },
                ],
            };
            break;
        case "HttpRequestNode":
            nodeModel.addInPort(inPortId);
            nodeModel.addOutPort(outPortId);
            emptyNode.templateId = "HttpRequestNode";
            emptyNode.properties = {
                path: "",
                action: action,
                outputType: "json",
                endpoint: endpoint,
            };
            break;
        case "HttpResponseNode": // response node
            nodeModel.addInPort(inPortId);
            emptyNode.templateId = "HttpResponseNode";
            break;
        case "SwitchNode":
            nodeModel.addInPort(inPortId, {
                id: inPortId,
                type: DEFAULT_TYPE,
            });
            nodeModel.addOutPort(outPortId, {
                id: outPortId,
                type: DEFAULT_TYPE,
            });
            const defaultPortId = getPortId(name, false, "default");
            nodeModel.addOutPort(defaultPortId, {
                id: defaultPortId,
                type: DEFAULT_TYPE,
            });
            emptyNode.templateId = "SwitchNode";
            emptyNode.properties = {
                cases: [
                    {
                        expression: { expression: "true" },
                        nodes: [outPortId],
                    },
                ],
                defaultCase: {
                    nodes: [defaultPortId],
                },
            };
            break;
        case "NewPayloadNode":
            nodeModel.addOutPort(outPortId);
            // add additional metadata for code block node
            emptyNode.properties = {
                codeBlock: {
                    expression: `${DEFAULT_TYPE} payload = {};`,
                },
            };
            emptyNode.metadata = {
                outputs: [
                    {
                        name: "payload",
                        type: DEFAULT_TYPE,
                    },
                ],
            };
            break;
        case "CodeBlockNode":
            nodeModel.addInPort(inPortId);
            nodeModel.addOutPort(outPortId);
            // add additional metadata for code block node
            emptyNode.properties = {
                codeBlock: {
                    expression: `${DEFAULT_TYPE} payload = {};`,
                },
            };
            emptyNode.metadata = {
                inputs: [
                    {
                        name: "inVar",
                        type: DEFAULT_TYPE,
                    },
                ],
                outputs: [
                    {
                        name: "payload",
                        type: DEFAULT_TYPE,
                    },
                ],
            };
            break;
        case "TransformNode":
            nodeModel.addInPort(inPortId);
            nodeModel.addOutPort(outPortId);
            // add additional metadata for code block node
            emptyNode.properties = {
                expression: { expression: "" },
                outputType: DEFAULT_TYPE,
            } as TransformNodeProperties;
            emptyNode.metadata = {
                inputs: [
                    {
                        name: "inVar1",
                        type: DEFAULT_TYPE,
                    },
                    {
                        name: "inVar2",
                        type: DEFAULT_TYPE,
                    },
                ],
                outputs: [
                    {
                        name: "payload",
                        type: DEFAULT_TYPE,
                    },
                ],
            };
            break;
        default:
            nodeModel.addInPort(inPortId);
            nodeModel.addOutPort(outPortId);
            break;
    }

    nodeModel.setNode(emptyNode);

    return nodeModel;
}

export function getStartNodeModel() {
    let name = "StartNode";
    let nodeModel = new DefaultNodeModel({ name: name, kind: "StartNode" });

    let emptyNode: Node = {
        name: name,
        templateId: "StartNode",
        inputPorts: [],
        outputPorts: [],
        metadata: {
            outputs: [
                {
                    name: "outVar",
                    type: "()",
                },
            ],
        },
        codeLocation: {
            start: {
                line: 0,
                offset: 0,
            },
            end: {
                line: 0,
                offset: 0,
            },
        },
        canvasPosition: {
            x: 0,
            y: 0,
        },
    };

    const outPortId = getPortId(name, false, 1);
    nodeModel.addOutPort(outPortId);
    nodeModel.setNode(emptyNode);
    return nodeModel;
}

export function addStartNode(flowModel: Flow, model: DiagramModel) {
    if (!flowModel.nodes?.some((node) => node.templateId === "StartNode")) {
        let nodeModel = getStartNodeModel();
        nodeModel.setPosition(1000, 1000);
        model.addNode(nodeModel);
        return true;
    }
    return false;
}

// only one start and response node can be added to the canvas
export function isSingleNode(type: NodeKinds) {
    return type === "StartNode" || type === "HttpResponseNode";
}

export function generateNodeName(model: DiagramModel, type: NodeKinds, name?: string, suffix?: string) {
    let count = 1;
    let nodeName = `${name || type}${suffix ? `_${suffix}` : ""}`;
    while (model.getNodes().some((node) => (node as DefaultNodeModel).getName() === nodeName)) {
        nodeName = `${name || type}${suffix ? `_${suffix}` : ""}_${count}`;
        count++;
    }
    return toTitleCase(nodeName);
}

export function getNodeByName(model: DiagramModel, name: string) {
    return model.getNodes().find((node) => (node as DefaultNodeModel).getName() === name);
}
