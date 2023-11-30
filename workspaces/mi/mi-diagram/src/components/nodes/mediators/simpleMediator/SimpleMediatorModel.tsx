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
import { STNode } from "@wso2-enterprise/mi-syntax-tree/lib/src";

export const SIMPLE_NODE = "SimpleNode";

interface SimpleMediatorNodeModelProps {
    node: STNode;
    name: string,
    description: string,
    documentUri: string;
    isInOutSequence: boolean;
    parentNode?: STNode;
}
export class SimpleMediatorNodeModel extends BaseNodeModel {
    readonly id: string;
    readonly mediatorName: string;
    readonly mediatorDescription: string;

    constructor(props: SimpleMediatorNodeModelProps) {
        const { node, documentUri, isInOutSequence, parentNode } = props;
        const id = `${node.tag}${node.range.start.line}.${node.range.start.character}:${node.range.end.line}.${node.range.end.character}`;
        super(SIMPLE_NODE, id, documentUri, isInOutSequence, node, parentNode);

        this.id = id;
        this.mediatorName = props.name;
        this.mediatorDescription = props.description;
        this.width = 70;
        this.height = 70;

        this.addPort(new MediatorPortModel(this.id, PortModelAlignment.LEFT));
        this.addPort(new MediatorPortModel(this.id, PortModelAlignment.RIGHT));
        this.addPort(new MediatorPortModel(this.id, PortModelAlignment.TOP));
    }
}
