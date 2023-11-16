/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { LinkModel, NodeModel, NodeModelGenerics, PortModel } from '@projectstorm/react-diagrams';
import { MediatorBaseLinkModel as BaseLinkModel } from '../base-link/base-link';
import { DiagramEngine, NodeProps } from "@projectstorm/react-diagrams-core";
import { STNode } from '@wso2-enterprise/mi-syntax-tree/lib/src';
import { Range } from '@wso2-enterprise/mi-core/src/types';

export interface BaseNodeProps extends NodeProps {
    node: BaseNodeModel;
    diagramEngine: DiagramEngine;
    width: number;
    height: number;
}

export class BaseNodeModel extends NodeModel<NodeModelGenerics> {
    private readonly parentNode?: STNode;
    private readonly node?: STNode;
    private readonly nodePosition: Range;
    private readonly documentUri: string;

    constructor(type: string, id: string, nodePosition: Range, documentUri: string, node?: STNode, parentNode?: STNode) {
        super({
            type: type,
            id: id
        });
        this.node = node;
        this.parentNode = parentNode;
        this.nodePosition = nodePosition;
        this.documentUri = documentUri;
    }

    handleHover = (ports: PortModel[], task: string) => {
        if (ports.length > 0) {
            ports.forEach((port) => {
                const portLinks: Map<string, LinkModel> = new Map(Object.entries(port.links));
                portLinks.forEach((link) => {
                    if (link.getSourcePort().getID() === port.getID()) {
                        link.fireEvent({}, task);
                    }
                })
            })
        }
    }

    isNodeSelected = (selectedLink: BaseLinkModel, portIdentifier: string): boolean => {
        if (selectedLink) {
            if (selectedLink.getSourcePort().getNode().getID() === this.getID()) {
                let sourcePortID: string = selectedLink.getSourcePort().getID();
                return sourcePortID.slice(sourcePortID.indexOf('-') + 1) === portIdentifier;
            } else if (selectedLink.getTargetPort().getNode().getID() === this.getID()) {
                let targetPortID: string = selectedLink.getTargetPort().getID();
                return targetPortID.slice(targetPortID.indexOf('-') + 1) === portIdentifier;
            }
        }
        return false;
    }

    getPortByAllignment(allignment: string): PortModel | undefined {
        return this.ports[`${allignment}-${this.getID()}`];
    }

    getParentNode(): STNode | undefined {
        return this.parentNode;
    }

    getNode(): STNode {
        return this.node;
    }

    getRange(): Range {
        return this.nodePosition;
    }

    getDocumentUri(): string {
        return this.documentUri;
    }
}
