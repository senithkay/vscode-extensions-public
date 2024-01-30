/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { DefaultLinkModel, DefaultPortModel, LinkModel, LinkModelGenerics } from "@projectstorm/react-diagrams";
import { NodeLinkModel } from "../NodeLink/NodeLinkModel";
import { AbstractModelFactory } from "@projectstorm/react-canvas-core";

export class NodePortModel extends DefaultPortModel {
    constructor(isIn = true, name = "", label = name) {
        super({
            type: "node-port",
            in: isIn,
            name: name,
            label: label,
        });
    }

    createLinkModel(factory?: AbstractModelFactory<LinkModel>): LinkModel {
        let link = super.createLinkModel();
        if (!link && factory) {
            return factory.generateModel({});
        }
        return link || new NodeLinkModel();
    }
}
