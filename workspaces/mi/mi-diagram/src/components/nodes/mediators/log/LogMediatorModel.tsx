/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { PortModelAlignment } from "@projectstorm/react-diagrams";
import { BaseNodeModel } from "../../../base/base-node/base-node";
import { MediatorPortModel } from "../../../port/MediatorPortModel";
import { Log, STNode } from "@wso2-enterprise/mi-syntax-tree/lib";

export const LOG_NODE = "LogNode";

export class LogMediatorNodeModel extends BaseNodeModel {
    readonly id: string;
    readonly mediatorName: string;
    readonly level: string;

    constructor(node: Log, nodePosition: number, documentUri: string, parentNode?: STNode) {
        const id = `${node.tag}${node.start}${node.end}`;
        super(LOG_NODE, id, nodePosition, documentUri, node, parentNode);

        this.id = id;
        this.level = node.level;

        this.addPort(new MediatorPortModel(this.id, PortModelAlignment.LEFT));
        this.addPort(new MediatorPortModel(this.id, PortModelAlignment.RIGHT));
        this.addPort(new MediatorPortModel(this.id, PortModelAlignment.TOP));
    }
}
