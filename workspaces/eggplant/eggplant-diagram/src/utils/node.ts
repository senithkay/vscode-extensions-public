/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { DefaultNodeModel } from "../components/default";
import { DEFAULT_TYPE, NODE_TYPE } from "../resources/constants";
import { Node } from "../types";
import { getPortId } from "./generator";

// get custom default node factory
export function getNodeModel(type: string, suffix?: string) {
    let name = type;
    const isSingleNode = type === NODE_TYPE.START || type === NODE_TYPE.RETURN;
    if (suffix !== undefined && !isSingleNode) {
        name = type + "_" + suffix;
    }
    let nodeModel = new DefaultNodeModel({ name: name, kind: type });

    let emptyNode: Node = {
        name: name,
        templateId: NODE_TYPE.CODE_BLOCK,
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
        case NODE_TYPE.START:
            nodeModel.addOutPort(outPortId);
            emptyNode.templateId = NODE_TYPE.START;
            break;
        case NODE_TYPE.RETURN:
            nodeModel.addInPort(inPortId);
            emptyNode.templateId = NODE_TYPE.RETURN;
            break;
        case NODE_TYPE.SWITCH:
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
            emptyNode.templateId = NODE_TYPE.SWITCH;
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

export function isFixedNode(type: string) {
    return type === NODE_TYPE.START || type === NODE_TYPE.RETURN;
}
