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

export class MediatorNodeModel extends NodeModel {
    readonly stNode: STNode;
    protected portIn: NodePortModel;
    protected portOut: NodePortModel;
    protected portRight: NodePortModel;
    readonly parentNode: STNode;
    readonly prevNodes: STNode[];

    constructor(stNode: STNode, parentNode?: STNode, prevNodes: STNode[] = []) {
        super({
            id: stNode.viewState?.id || getNodeIdFromModel(stNode),
            type: "mediator-node",
            locked: true,
        });
        this.stNode = stNode;
        this.parentNode = parentNode;
        this.prevNodes = prevNodes;
        this.addInPort("in");
        this.addOutPort("out");
        this.addRightPort("right");
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
        const p = new NodePortModel(true, label);
        return this.addPort(p);
    }

    addOutPort(label: string): NodePortModel {
        const p = new NodePortModel(false, label);
        return this.addPort(p);
    }

    addRightPort(label: string): NodePortModel {
        const p = new NodePortModel({
            in: false,
            name: "right",
            label: label,
            alignment: PortModelAlignment.RIGHT,
        });
        super.addPort(p);
        this.portRight = p;
        return p;
    }

    getInPort(): NodePortModel {
        return this.portIn;
    }

    getOutPort(): NodePortModel {
        return this.portOut;
    }

    getRightPort(): NodePortModel {
        return this.portRight;
    }

    getStNode(): STNode {
        return this.stNode;
    }

    getParentStNode(): STNode {
        return this.parentNode;
    }

    getPrevStNodes(): STNode[] {
        return this.prevNodes;
    }
}
