/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { DefaultNodeModel } from "../components/default";
import { DEFAULT_TYPE } from "../resources/constants";
import { HttpMethod, Node, NodeKinds } from "../types";
import { getPortId } from "./generator";

// get custom default node factory
export function getDefaultNodeModel(type: NodeKinds, action?: HttpMethod, suffix?: string) {
    let name = generateNodeName(type, action, suffix);
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
                        name: "out",
                        type: DEFAULT_TYPE,
                    },
                ],
            };
            break;
        case "HttpRequestNode":
            nodeModel.addInPort(inPortId);
            nodeModel.addInPort(outPortId);
            emptyNode.templateId = "HttpRequestNode";
            emptyNode.properties = {
                path: "",
                action: action, 
                outputType: DEFAULT_TYPE,
                endpoint: {
                    baseUrl: "",
                    name: "httpEp",
                },
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
        case "CodeBlockNode":
            // add additional metadata for code block node
            emptyNode.properties = {
                codeBlock: {
                    expression: "",
                },
            };
            emptyNode.metadata = {
                inputs: [
                    {
                        name: "in",
                        type: DEFAULT_TYPE,
                    },
                ],
                outputs: [
                    {
                        name: "out",
                        type: DEFAULT_TYPE,
                    },
                ],
            };
        default:
            nodeModel.addInPort(inPortId);
            nodeModel.addOutPort(outPortId);
            break;
    }

    nodeModel.setNode(emptyNode);

    return nodeModel;
}

export function generateNodeName(type: NodeKinds, action?: HttpMethod, suffix?: string) {
    let name = type.toString();
    if (type === "HttpRequestNode" && action) {
        name = action.toUpperCase() + "RequestNode";
    }
    if (suffix !== undefined && !isSingleNode(type)) {
        name = name + "_" + suffix;
    }
    return name;
}

// only one start and response node can be added to the canvas
export function isSingleNode(type: NodeKinds) {
    return type === "StartNode" || type === "HttpResponseNode";
}
