/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { NodeModel, PortModelAlignment } from "@projectstorm/react-diagrams";
import { v4 as uuidv4 } from "uuid";
import { STNode } from "@wso2-enterprise/mi-syntax-tree/src";
import { NodePortModel } from "../../NodePort/NodePortModel";

export class StartNodeModel extends NodeModel {
    readonly stNode: STNode;
    protected port: NodePortModel;

    constructor(stNode: STNode) {
        super({
            id: stNode.viewState?.id || uuidv4(),
            type: "start-node",
        });
        this.stNode = stNode;
        this.addOutPort("out");
    }

    addOutPort(label: string): NodePortModel {
        const port = new NodePortModel({
            in: false,
            name: "out",
            label: label,
            alignment: PortModelAlignment.BOTTOM,
        });
        super.addPort(port);
        this.port = port;
        return port;
    }

    getOutPort(): NodePortModel {
        return this.port;
    }
}
