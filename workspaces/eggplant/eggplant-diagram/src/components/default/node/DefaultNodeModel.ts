/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as _ from "lodash";
import { NodeModel, NodeModelGenerics, PortModelAlignment } from "@projectstorm/react-diagrams-core";
import { DefaultPortModel } from "../port/DefaultPortModel";
import { BasePositionModelOptions, DeserializeEvent } from "@projectstorm/react-canvas-core";
import { Colors } from "../../../resources";
import { Node, NodeKinds, NodePort } from "../../../types";

export interface DefaultNodeModelOptions extends BasePositionModelOptions {
    name?: string;
    color?: string;
    node?: Node;
    kind?: NodeKinds;
}

export interface DefaultNodeModelGenerics extends NodeModelGenerics {
    OPTIONS: DefaultNodeModelOptions;
}

export class DefaultNodeModel extends NodeModel<DefaultNodeModelGenerics> {
    protected portsIn: DefaultPortModel[];
    protected portsOut: DefaultPortModel[];

    constructor(name: string, color: string);
    constructor(options?: DefaultNodeModelOptions);
    constructor(options: any = {}, color?: string) {
        if (options?.kind || options?.node) {
            super({
                type: "default",
                name: options.node?.name || options.name,
                color: Colors.PRIMARY_CONTAINER,
                kind: options.node?.templateId || options.kind || "CodeBlockNode",
                ...options,
            });
            this.portsIn = [];
            this.portsOut = [];
            return;
        }
        if (typeof options === "string") {
            options = {
                name: options,
                color: color,
            };
        }
        super({
            type: "default",
            name: "Untitled",
            color: "rgb(0,192,255)",
            ...options,
        });
        this.portsOut = [];
        this.portsIn = [];
    }

    doClone(lookupTable: {}, clone: any): void {
        clone.portsIn = [];
        clone.portsOut = [];
        super.doClone(lookupTable, clone);
    }

    removePort(port: DefaultPortModel): void {
        super.removePort(port);
        if (port.getOptions().in) {
            this.portsIn.splice(this.portsIn.indexOf(port), 1);
        } else {
            this.portsOut.splice(this.portsOut.indexOf(port), 1);
        }
    }

    addPort<T extends DefaultPortModel>(port: T): T {
        super.addPort(port);
        if (port.getOptions().in) {
            if (this.portsIn.indexOf(port) === -1) {
                this.portsIn.push(port);
            }
        } else {
            if (this.portsOut.indexOf(port) === -1) {
                this.portsOut.push(port);
            }
        }
        return port;
    }

    addInPort(label: string, nodePort?: NodePort, multiLink = false, after = true): DefaultPortModel {
        const p = new DefaultPortModel({
            in: true,
            name: label,
            label: label,
            alignment: PortModelAlignment.LEFT,
            port: nodePort,
            multiLink: multiLink,
        });
        if (!after) {
            this.portsIn.splice(0, 0, p);
        }
        return this.addPort(p);
    }

    addOutPort(label: string, nodePort?: NodePort, multiLink = false, after = true): DefaultPortModel {
        const p = new DefaultPortModel({
            in: false,
            name: label,
            label: label,
            alignment: PortModelAlignment.RIGHT,
            port: nodePort,
            multiLink: multiLink,
        });
        if (!after) {
            this.portsOut.splice(0, 0, p);
        }
        return this.addPort(p);
    }

    deserialize(event: DeserializeEvent<this>) {
        super.deserialize(event);
        this.options.name = event.data.name;
        this.options.color = event.data.color;
        this.portsIn = _.map(event.data.portsInOrder, (id) => {
            return this.getPortFromID(id);
        }) as DefaultPortModel[];
        this.portsOut = _.map(event.data.portsOutOrder, (id) => {
            return this.getPortFromID(id);
        }) as DefaultPortModel[];
    }

    serialize(): any {
        return {
            ...super.serialize(),
            name: this.options.name,
            color: this.options.color,
            portsInOrder: _.map(this.portsIn, (port) => {
                return port.getID();
            }),
            portsOutOrder: _.map(this.portsOut, (port) => {
                return port.getID();
            }),
            properties: this.options.node?.properties,
        };
    }

    getInPorts(): DefaultPortModel[] {
        return this.portsIn;
    }

    getOutPorts(): DefaultPortModel[] {
        return this.portsOut;
    }

    getName(): string {
        return this.options.name;
    }

    getNode(): Node {
        return this.options.node;
    }

    setNode(node: Node): void {
        this.options.node = node;
        this.options.name = node.name;
    }

    getKind(): NodeKinds {
        return this.options.kind;
    }
}
