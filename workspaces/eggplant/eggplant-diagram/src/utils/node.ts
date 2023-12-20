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
import { Node, NodeKinds } from "../types";
import { getPortId } from "./generator";

// get custom default node factory
export function getNodeModel(type: NodeKinds, suffix?: string) {
    let name = type.toString();
    const isSingleNode = type === "StartNode" || type === "EndNode";
    if (suffix !== undefined && !isSingleNode) {
        name = type + "_" + suffix;
    }
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
        codeBlock: "",
    };

    const inPortId = getPortId(name, true, 1);
    const outPortId = getPortId(name, false, 1);

    switch (type) {
        case "StartNode":
            nodeModel.addOutPort(outPortId);
            emptyNode.templateId = "StartNode";
            break;
        case "EndNode":
            nodeModel.addInPort(inPortId);
            emptyNode.templateId = "EndNode";
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
                        expression: "true",
                        nodes: [outPortId],
                    },
                ],
                defaultCase: {
                    nodes: [defaultPortId],
                },
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

export function isFixedNode(type: NodeKinds) {
    return type === "StartNode" || type === "EndNode";
}
