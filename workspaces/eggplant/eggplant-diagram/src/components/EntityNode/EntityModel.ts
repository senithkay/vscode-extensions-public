/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { PortModelAlignment } from "@projectstorm/react-diagrams";
import { SharedNodeModel } from "../shared-node/shared-node";
import { EntityPortModel, getEntityPortName } from "../EntityPort/EntityPortModel";
import { Node } from "../../types/types";
import { WorkerPortModel } from "../Port/WorkerPortModel";


export class EntityModel extends SharedNodeModel {
    readonly entityObject: Node;

    constructor(entityName: string, entityObject: Node) {
        super("entityNode", entityName);
        this.entityObject = entityObject;

        this.addPort(new WorkerPortModel(getEntityPortName(entityName), PortModelAlignment.LEFT));

        entityObject.links.map((link) => {
            this.addPort(new WorkerPortModel(getEntityPortName(entityName, link.name), PortModelAlignment.RIGHT));
        });
    }
}
