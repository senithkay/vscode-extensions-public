/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { LinkModel, PortModel, PortModelAlignment, PortModelGenerics, PortModelOptions } from "@projectstorm/react-diagrams-core";
import { DefaultLinkModel } from "../link/DefaultLinkModel";
import { AbstractModelFactory, DeserializeEvent } from "@projectstorm/react-canvas-core";
import { NodePort } from "../../../types";

export interface DefaultPortModelOptions extends PortModelOptions {
    label?: string;
    in?: boolean;
    type?: string;
    port?: NodePort;
}

export interface DefaultPortModelGenerics extends PortModelGenerics {
    OPTIONS: DefaultPortModelOptions;
}

export class DefaultPortModel extends PortModel<DefaultPortModelGenerics> {
    constructor(isIn: boolean, name?: string, label?: string);
    constructor(options: DefaultPortModelOptions);
    constructor(options: DefaultPortModelOptions | boolean, name?: string, label?: string) {
        if (!!name) {
            options = {
                in: !!options,
                name: name,
                label: label,
            };
        }
        options = options as DefaultPortModelOptions;
        super({
            label: options.label || options.name,
            alignment: options.in ? PortModelAlignment.LEFT : PortModelAlignment.RIGHT,
            type: "default",
            ...options,
        });
    }

    deserialize(event: DeserializeEvent<this>) {
        super.deserialize(event);
        this.options.in = event.data.in;
        this.options.label = event.data.label;
    }

    serialize() {
        return {
            ...super.serialize(),
            in: this.options.in,
            label: this.options.label,
        };
    }

    link<T extends LinkModel>(port: PortModel, factory?: AbstractModelFactory<T>): T {
        let link = this.createLinkModel(factory);
        link.setSourcePort(this);
        link.setTargetPort(port);
        return link as T;
    }

    canLinkToPort(port: PortModel): boolean {
        if (port instanceof DefaultPortModel) {
            return this.options.in !== port.getOptions().in;
        }
        return true;
    }

    createLinkModel(factory?: AbstractModelFactory<LinkModel>): LinkModel {
        let link = super.createLinkModel();
        if (!link && factory) {
            return factory.generateModel({});
        }
        return link || new DefaultLinkModel();
    }
}
