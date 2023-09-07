/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { PortModelAlignment } from "@projectstorm/react-diagrams";

import { Mediator } from "../model";
import { MediatorPortModel } from "../port/MediatorPortModel";
import { MediatorBaseNode } from "../base/base-node/base-node";

export const MEDIATOR_NODE = "MediatorNode";

export class MediatorNodeModel extends MediatorBaseNode {
    readonly mediator: Mediator;

    constructor(mediator: Mediator) {
        super(MEDIATOR_NODE, mediator.name);
        this.mediator = mediator;

        const mediatorName: string = mediator.name;

        this.addPort(new MediatorPortModel(mediatorName, PortModelAlignment.LEFT));
        this.addPort(new MediatorPortModel(mediatorName, PortModelAlignment.RIGHT));
        this.addPort(new MediatorPortModel(mediatorName, PortModelAlignment.TOP));
    }
}
