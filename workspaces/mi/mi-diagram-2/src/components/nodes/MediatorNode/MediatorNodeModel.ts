/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { NodeModel, DefaultPortModel } from "@projectstorm/react-diagrams";
import { v4 as uuidv4 } from 'uuid';
import { STNode } from "@wso2-enterprise/mi-syntax-tree/src";
import { NodePortModel } from "../../NodePort/NodePortModel";

export class MediatorNodeModel extends NodeModel {
    readonly stNode: STNode;
    protected portsIn: NodePortModel[];
    protected portsOut: NodePortModel[];

    constructor(stNode: STNode) {
        super({
            id: stNode.viewState?.id || uuidv4(),
            type: "mediator-node",
            locked: true,
        });
        this.stNode = stNode;
        this.portsIn = [];
        this.portsOut = [];
        this.addInPort("in");
        this.addOutPort("out");
    }

    addPort<T extends NodePortModel>(port: T): T {
        super.addPort(port);
        if (port.getOptions().in) {
            if (this.portsIn?.indexOf(port) === -1) {
                this.portsIn.push(port);
            }
        } else {
            if (this.portsOut?.indexOf(port) === -1) {
                this.portsOut.push(port);
            }
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

    getInPorts(): NodePortModel[] {
        return this.portsIn;
    }

    getOutPorts(): NodePortModel[] {
        return this.portsOut;
    }
}
