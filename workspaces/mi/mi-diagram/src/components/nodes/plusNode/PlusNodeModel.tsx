/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { PortModelAlignment } from "@projectstorm/react-diagrams";
import { BaseNodeModel } from "../../base/base-node/base-node";
import { MediatorPortModel } from "../../port/MediatorPortModel";
export const PLUS_NODE = "PlusNode";

export class PlusNodeModel extends BaseNodeModel {
    readonly id: string;

    constructor(id: string, documentUri: string, isInOutSequence: boolean) {
        super(PLUS_NODE, id, documentUri, isInOutSequence);

        this.id = id;
        this.width = 30;
        this.height = 30;

        this.addPort(new MediatorPortModel(this.id, PortModelAlignment.LEFT));
        this.addPort(new MediatorPortModel(this.id, PortModelAlignment.RIGHT));
        this.addPort(new MediatorPortModel(this.id, PortModelAlignment.TOP));
    }
}
