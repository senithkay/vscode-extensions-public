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

export const ADVANCED_NODE = "AdvancedNode";

interface SubSequence {
    name: string;
    nodes: BaseNodeModel[];
    width?: number;
    height?: number;
}

interface AdvancedMediatorNodeModelProps {
    node: STNode;
    name: string,
    description: string,
    documentUri: string;
    isInOutSequence: boolean;
    subSequences: SubSequence[];
    parentNode?: STNode;
}
export class AdvancedMediatorNodeModel extends BaseNodeModel {
    readonly id: string;
    readonly mediatorName: string;
    readonly mediatorDescription: string;
    readonly subSequences: SubSequence[] = [];

    constructor(props: AdvancedMediatorNodeModelProps) {
        const { node, documentUri, isInOutSequence, subSequences, parentNode } = props;
        const id = `${node.tag}${node.range.start.line}${node.range.start.character}${node.range.end.line}${node.range.end.character}`;
        super(ADVANCED_NODE, id, documentUri, isInOutSequence, node, parentNode);

        this.id = id;
        this.mediatorName = props.name;
        this.mediatorDescription = props.description;
        this.subSequences = subSequences;

        this.addPort(new MediatorPortModel(this.id, PortModelAlignment.LEFT));
        this.addPort(new MediatorPortModel(this.id, PortModelAlignment.RIGHT));
        this.addPort(new MediatorPortModel(this.id, PortModelAlignment.TOP));
        this.addPort(new MediatorPortModel(this.id, PortModelAlignment.BOTTOM));
    }
}
