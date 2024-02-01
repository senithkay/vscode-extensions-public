/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { NodeModel, PortModelAlignment } from "@projectstorm/react-diagrams";
import { STNode } from "@wso2-enterprise/mi-syntax-tree/src";
import { NodePortModel } from "../../NodePort/NodePortModel";
import { getNodeIdFromModel } from "../../../utils/node";

export class EndpointNodeModel extends NodeModel {
    readonly stNode: STNode;
    protected port: NodePortModel;

    constructor(stNode: STNode) {
        super({
            id: stNode.viewState?.id || getNodeIdFromModel(stNode, "endpoint"),
            type: "endpoint-node",
            locked: true,
        });
        this.stNode = stNode;
        this.addInPort("in");
    }

    addInPort(label: string): NodePortModel {
        const port = new NodePortModel({
            in: true,
            name: "in",
            label: label,
            alignment: PortModelAlignment.LEFT,
        });
        super.addPort(port);
        this.port = port;
        return port;
    }

    getInPort(): NodePortModel {
        return this.port;
    }
}
