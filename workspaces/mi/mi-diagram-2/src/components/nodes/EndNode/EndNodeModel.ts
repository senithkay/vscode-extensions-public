/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { NodeModel, PortModelAlignment } from "@projectstorm/react-diagrams";
import { NodePortModel } from "../../NodePort/NodePortModel";
import { NodeTypes } from "../../../resources/constants";

export class EndNodeModel extends NodeModel {
    protected port: NodePortModel;

    constructor() {
        super({
            type: NodeTypes.END_NODE,
            locked: true,
        });
        this.addInPort("in");
    }

    addInPort(label: string): NodePortModel {
        const port = new NodePortModel({
            in: true,
            name: "in",
            label: label,
            alignment: PortModelAlignment.TOP,
        });
        super.addPort(port);
        this.port = port;
        return port;
    }

    getInPort(): NodePortModel {
        return this.port;
    }
}
