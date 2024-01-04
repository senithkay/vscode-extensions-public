/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { PortModelAlignment } from "@projectstorm/react-diagrams";
import { BaseNodeModel, SequenceType } from "../../../base/base-node/base-node";
import { MediatorPortModel } from "../../../port/MediatorPortModel";
import { STNode } from "@wso2-enterprise/mi-syntax-tree/lib/src";

export const SIMPLE_ENDPOINT = "SimpleEndpoint";

interface SubSequence {
    name: string;
    nodes: BaseNodeModel[];
    width?: number;
    height?: number;
}

interface SimpleEndpointNodeModelProps {
    node: STNode;
    name: string,
    description: string,
    documentUri: string;
    sequenceType: SequenceType;
    parentNode?: STNode;
    dropSequence?: boolean;
    subSequences: SubSequence[];
}
export class SimpleEndpointNodeModel extends BaseNodeModel {
    readonly id: string;
    readonly endpointName: string;
    readonly endpointDescription: string;
    readonly subSequences: SubSequence[] = [];

    constructor(props: SimpleEndpointNodeModelProps) {
        const { node, documentUri, sequenceType,subSequences, parentNode, dropSequence } = props;
        const id = `${node.tag}${node.range.start.line}.${node.range.start.character}:${node.range.end.line}.${node.range.end.character}`;
        super(SIMPLE_ENDPOINT, id, documentUri, sequenceType, node, parentNode, dropSequence);

        this.id = id;
        this.endpointName = props.name;
        this.endpointDescription = props.description;
        this.subSequences = subSequences;
        this.width = 70;
        this.height = 100;

        this.addPort(new MediatorPortModel(this.id, PortModelAlignment.LEFT));
        this.addPort(new MediatorPortModel(this.id, PortModelAlignment.RIGHT));
        this.addPort(new MediatorPortModel(this.id, PortModelAlignment.TOP));
        this.addPort(new MediatorPortModel(this.id, PortModelAlignment.BOTTOM));
    }
}
