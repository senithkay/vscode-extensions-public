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
import { NodeTypes } from "../../../resources/constants";

export class StartNodeModel extends NodeModel {
    readonly stNode: STNode;
    protected portIn: NodePortModel;
    protected portOut: NodePortModel;
    protected parentNode: STNode;
    protected prevNodes: STNode[];

    constructor(stNode: STNode, parentNode?: STNode, prevNodes: STNode[] = []) {
        super({
            id: stNode.viewState?.id || getNodeIdFromModel(stNode, "start"),
            type: NodeTypes.START_NODE,
            locked: true,
        });
        this.stNode = stNode;
        this.addInPort("in");
        this.addOutPort("out");
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

    addOutPort(label: string): NodePortModel {
        const port = new NodePortModel({
            in: true,
            name: "out",
            label: label,
            alignment: PortModelAlignment.BOTTOM,
        });
        super.addPort(port);
        this.portOut = port;
        return port;
    }

    getInPort(): NodePortModel {
        return this.portIn;
    }

    getOutPort(): NodePortModel {
        return this.portOut;
    }

    getStNode(): STNode {
        return this.stNode;
    }

    getParentNode(): STNode {
        return this.parentNode;
    }

    getPrevNodes(): STNode[] {
        return this.prevNodes;
    }
}
