/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { DefaultNodeModel } from "../components/default";
import { NODE_TYPE } from "../resources/constants";
import { Node } from "../types";

// get custom default node factory
export function getNode(type: string, suffix?: string) {
    const name = type + "_" + suffix;
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

    switch (type) {
        case NODE_TYPE.START:
            nodeModel.addOutPort("out");
            emptyNode.templateId = NODE_TYPE.START;
            break;
        case NODE_TYPE.END:
            nodeModel.addInPort("in");
            emptyNode.templateId = NODE_TYPE.END;
            break;
        case NODE_TYPE.SWITCH:
            nodeModel.addInPort("in");
            nodeModel.addOutPort("out-1");
            nodeModel.addOutPort("out-2");
            emptyNode.templateId = NODE_TYPE.SWITCH;
            break;
        default:
            nodeModel.addInPort("in");
            nodeModel.addOutPort("out");
            break;
    }

    nodeModel.setNode(emptyNode);

    return nodeModel;
}
