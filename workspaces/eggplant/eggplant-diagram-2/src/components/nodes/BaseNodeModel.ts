/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { NodeModel } from "@projectstorm/react-diagrams";
import { getNodeIdFromModel } from "../../utils/node";
import { NodePortModel } from "../NodePort/NodePortModel";
import { NodeTypes } from "../../resources/constants";

export class BaseNodeModel extends NodeModel {
    readonly any: any;
    protected portIn: NodePortModel;
    protected portOut: NodePortModel;
    protected parentNode: any;
    protected prevNodes: any[];

    constructor(type: NodeTypes, any: any, parentNode?: any, prevNodes: any[] = []) {
        super({
            id: any.viewState?.id || getNodeIdFromModel(any),
            type: type,
            locked: true,
        });
        this.any = any;
        this.parentNode = parentNode;
        this.prevNodes = prevNodes;
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
        const p = new NodePortModel(true, label);
        return this.addPort(p);
    }

    addOutPort(label: string): NodePortModel {
        const p = new NodePortModel(false, label);
        return this.addPort(p);
    }

    getInPort(): NodePortModel {
        return this.portIn;
    }

    getOutPort(): NodePortModel {
        return this.portOut;
    }

    getany(): any {
        return this.any;
    }

    getParentany(): any {
        return this.parentNode;
    }

    getPrevanys(): any[] {
        return this.prevNodes;
    }
}
