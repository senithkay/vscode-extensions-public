/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { PortModelAlignment } from "@projectstorm/react-diagrams";
import { APIResource, NamedSequence, STNode } from "@wso2-enterprise/mi-syntax-tree/src";
import { NodePortModel } from "../../NodePort/NodePortModel";
import { NodeTypes } from "../../../resources/constants";
import { BaseNodeModel } from "../BaseNodeModel";

export class PlusNodeModel extends BaseNodeModel {
    protected model: APIResource | NamedSequence;

    constructor(stNode: STNode, mediatorName: string, documentUri: string) {
        super(NodeTypes.PLUS_NODE, mediatorName, documentUri, stNode);
    }

    addPort<T extends NodePortModel>(port: T): T {
        super.addPort(port);
        if (port.getOptions().in) {
            this.portIn = port;
        } else {
            this.portOut = port;
        }
        return port;
    }

    addInPort(label: string): NodePortModel {
        const port = new NodePortModel({
            in: true,
            name: "in",
            label: label,
            alignment: PortModelAlignment.TOP,
        });
        super.addPort(port);
        this.portIn = port;
        return port;
    }
}
