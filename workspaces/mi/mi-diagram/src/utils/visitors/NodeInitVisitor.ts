/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import {
    Log,
    STNode,
    NamedSequence,
    Visitor,
} from '@wso2-enterprise/mi-syntax-tree/lib/src';
import { LogMediatorNodeModel } from '../../components/nodes/mediators/log/LogMediatorModel';
import { mapNode } from './ModelMapper';
import { BaseNodeModel } from '../../components/base/base-node/base-node';

export class NodeInitVisitor implements Visitor {
    private currentSequence: BaseNodeModel[];
    private inSequenceNodes: BaseNodeModel[] = [];
    private outSequenceNodes: BaseNodeModel[] = [];
    private parents: STNode[] = [];
    private documentUri: string;

    constructor(documentUri: string) {
        this.documentUri = documentUri;
    };

    beginVisitLog(node: Log) {
        // TODO: Fix this
        const nodeRange = {
            start: {
                line: node.start,
                character: node.start
            },
            end: {
                line: node.end,
                character: node.end
            }
        }
        this.currentSequence.push(
            new LogMediatorNodeModel(
                mapNode(node as any),
                nodeRange,
                this.documentUri,
                this.parents[this.parents.length - 1]
            )
        );
    }

    beginVisitInSequence(node: NamedSequence): void {
        this.currentSequence = this.inSequenceNodes;
        this.parents.push(node);
    }

    endVisitInSequence(): void {
        this.parents.pop();
    }

    beginVisitOutSequence(node: NamedSequence): void {
        this.currentSequence = this.outSequenceNodes;
        this.parents.push(node);
    }

    endVisitOutSequence(): void {
        this.parents.pop();
    }

    getInSequenceNodes(): BaseNodeModel[] {
        return this.inSequenceNodes;
    }

    getOutSequenceNodes(): BaseNodeModel[] {
        return this.outSequenceNodes;
    }
}

