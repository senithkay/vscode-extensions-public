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
    Visitor,
    Resource,
    APIResource,
    Sequence,
    Throttle,
    traversNode,
    Store,
    Property,
    PropertyGroup,
    Respond,
    Loopback,
    Call,
    CallTemplate,
    Send,
    Drop,
    Callout,
    Header,
    Validate,
    EndpointHttp,
    Endpoint,
    Filter,
    PayloadFactory,
    Range
} from '@wso2-enterprise/mi-syntax-tree/lib/src';
import { BaseNodeModel, SequenceType } from '../../components/base/base-node/base-node';
import { SimpleMediatorNodeModel } from '../../components/nodes/mediators/simpleMediator/SimpleMediatorModel';
import { ENDPOINTS, MEDIATORS } from '../../constants';
import { AdvancedMediatorNodeModel } from '../../components/nodes/mediators/advancedMediator/AdvancedMediatorModel';
import { SimpleEndpointNodeModel } from '../../components/nodes/mediators/simpleEndpoint/SimpleEndpointModel';

export interface SequenceNodes {
    type: SequenceType;
    nodes: BaseNodeModel[];
    range?: Range;
}

export class NodeInitVisitor implements Visitor {
    private currentSequence: BaseNodeModel[];

    private sequences: SequenceNodes[] = [];

    private parents: STNode[] = [];
    private documentUri: string;
    private sequenceType: SequenceType;
    private skipChildrenVisit = false;

    constructor(documentUri: string) {
        this.documentUri = documentUri;
    }

    beginVisitResource(node: Resource): void {
        this.parents.push(node);

        if ((node as any).inSequence || (node as any).outSequence) {
            this.beginVisitAPIResource(node as any);
        }
    }

    beginVisitAPIResource(node: APIResource): void {
        this.parents.push(node);
    }

    endVisitAPIResource(_node: APIResource): void {
        this.parents.pop();
    }

    beginVisitLog(node: Log) {
        this.currentSequence.push(
            new SimpleMediatorNodeModel({
                node: node,
                name: MEDIATORS.LOG,
                description: node.level?.toString(),
                documentUri: this.documentUri,
                sequenceType: this.sequenceType,
                parentNode: this.parents[this.parents.length - 1]
            }
            ));
        this.skipChildrenVisit = true;
    }

    endVisitLog(): void {
        this.skipChildrenVisit = false;
    }

    beginVisitStore(node: Store) {
        this.currentSequence.push(
            new SimpleMediatorNodeModel({
                node: node,
                name: MEDIATORS.STORE,
                description: node.messageStore?.toString(),
                documentUri: this.documentUri,
                sequenceType: this.sequenceType,
                parentNode: this.parents[this.parents.length - 1]
            }
            ));
    }

    beginVisitProperty(node: Property) {
        this.currentSequence.push(
            new SimpleMediatorNodeModel({
                node: node,
                name: MEDIATORS.PROPERTY,
                description: "",
                documentUri: this.documentUri,
                sequenceType: this.sequenceType,
                parentNode: this.parents[this.parents.length - 1]
            }
            ));
    }

    beginVisitPropertyGroup(node: PropertyGroup) {
        this.currentSequence.push(
            new SimpleMediatorNodeModel({
                node: node,
                name: MEDIATORS.PROPERTYGROUP,
                description: node.description?.toString(),
                documentUri: this.documentUri,
                sequenceType: this.sequenceType,
                parentNode: this.parents[this.parents.length - 1]
            }
            ));
    }

    beginVisitRespond(node: Respond) {
        this.currentSequence.push(
            new SimpleMediatorNodeModel({
                node: node,
                name: MEDIATORS.RESPOND,
                description: node.description?.toString(),
                documentUri: this.documentUri,
                sequenceType: this.sequenceType,
                parentNode: this.parents[this.parents.length - 1],
                dropSequence: true
            }
            ));
    }

    beginVisitLoopback(node: Loopback) {
        this.currentSequence.push(
            new SimpleMediatorNodeModel({
                node: node,
                name: MEDIATORS.LOOPBACK,
                description: node.description?.toString(),
                documentUri: this.documentUri,
                sequenceType: this.sequenceType,
                parentNode: this.parents[this.parents.length - 1],
                dropSequence: true
            }
            ));
    }

    beginVisitCall(node: Call) {
        const currentSequence = this.currentSequence;
        const endpointNodes: [] = [];

        this.parents.push(node);
        if (node.endpoint) {
            this.currentSequence = endpointNodes;
            traversNode(node.endpoint, this);
        }

        this.parents.pop();

        this.currentSequence = currentSequence;
        this.currentSequence.push(
            new SimpleEndpointNodeModel({
                node: node,
                name: MEDIATORS.CALL,
                description: node.description?.toString(),
                documentUri: this.documentUri,
                sequenceType: this.sequenceType,
                parentNode: this.parents[this.parents.length - 1],
                subSequences: [{
                    name: "Endpoints", nodes: endpointNodes
                }]
            }
            ));
        this.skipChildrenVisit = true;
    }

    beginVisitCallTemplate(node: CallTemplate) {
        this.currentSequence.push(
            new SimpleMediatorNodeModel({
                node: node,
                name: MEDIATORS.CALLTEMPLATE,
                description: node.target?.toString(),
                documentUri: this.documentUri,
                sequenceType: this.sequenceType,
                parentNode: this.parents[this.parents.length - 1]
            }
            ));
    }

    beginVisitSend(node: Send) {
        const currentSequence = this.currentSequence;
        const endpointNodes: [] = [];

        this.parents.push(node);
        if (node.endpoint) {
            this.currentSequence = endpointNodes;
            (node.endpoint as any).forEach((mediator: STNode) => {
                traversNode(mediator, this);
            });
        }

        this.parents.pop();

        this.currentSequence = currentSequence;
        this.currentSequence.push(
            new SimpleEndpointNodeModel({
                node: node,
                name: MEDIATORS.SEND,
                description: node.description?.toString(),
                documentUri: this.documentUri,
                sequenceType: this.sequenceType,
                parentNode: this.parents[this.parents.length - 1],
                subSequences: [{
                    name: "Endpoints", nodes: endpointNodes
                }]
            }
            ));
        this.skipChildrenVisit = true;
    }

    beginVisitSequence(node: Sequence) {
        if (this.currentSequence) {
            this.currentSequence.push(
                new SimpleMediatorNodeModel({
                    node: node,
                    name: MEDIATORS.SEQUENCE,
                    description: node.tag?.toString(),
                    documentUri: this.documentUri,
                    sequenceType: this.sequenceType,
                    parentNode: this.parents[this.parents.length - 1]
                }
                ));
        } else {
            const sequenceNodes: SequenceNodes = {
                type: SequenceType.SEQUENCE,
                nodes: [],
                range: node.range
            };
            this.sequences.push(sequenceNodes);
            this.sequenceType = SequenceType.SEQUENCE;
            this.currentSequence = sequenceNodes.nodes;
            this.parents.push(node);
        }
    }

    beginVisitDrop(node: Drop) {
        this.currentSequence.push(
            new SimpleMediatorNodeModel({
                node: node,
                name: MEDIATORS.DROP,
                description: node.description?.toString(),
                documentUri: this.documentUri,
                sequenceType: this.sequenceType,
                parentNode: this.parents[this.parents.length - 1],
                dropSequence: true
            }
            ));
    }

    beginVisitCallout(node: Callout) {
        this.currentSequence.push(
            new SimpleMediatorNodeModel({
                node: node,
                name: MEDIATORS.CALLOUT,
                description: node.description?.toString(),
                documentUri: this.documentUri,
                sequenceType: this.sequenceType,
                parentNode: this.parents[this.parents.length - 1]
            }
            ));
    }

    beginVisitHeader(node: Header) {
        this.currentSequence.push(
            new SimpleMediatorNodeModel({
                node: node,
                name: MEDIATORS.HEADER,
                description: node.description?.toString(),
                documentUri: this.documentUri,
                sequenceType: this.sequenceType,
                parentNode: this.parents[this.parents.length - 1]
            }
            ));
    }

    beginVisitValidate(node: Validate) {
        const currentSequence = this.currentSequence;
        const onFailSequenceNodes: [] = [];

        this.parents.push(node);
        if (node.onFail) {
            this.currentSequence = onFailSequenceNodes;
            (node.onFail.mediatorList as any).forEach((mediator: STNode) => {
                traversNode(mediator, this);
            });
        }
        this.parents.pop();

        this.currentSequence = currentSequence;
        this.currentSequence.push(
            new AdvancedMediatorNodeModel({
                node: node,
                name: MEDIATORS.VALIDATE,
                description: node.description?.toString(),
                documentUri: this.documentUri,
                sequenceType: this.sequenceType,
                parentNode: this.parents[this.parents.length - 1],
                subSequences: [{
                    name: "OnFail", nodes: onFailSequenceNodes, range: node.onFail?.range
                }]
            }
            ));
        this.skipChildrenVisit = true;
    }

    beginVisitThrottle(node: Throttle): void {
        const currentSequence = this.currentSequence;
        const onAcceptSequenceNodes: [] = [];
        const onRejectSequenceNodes: [] = [];

        this.parents.push(node);
        if (node.onAccept) {
            this.currentSequence = onAcceptSequenceNodes;
            (node.onAccept.mediatorList as any).forEach((mediator: STNode) => {
                traversNode(mediator, this);
            });
        }

        if (node.onReject) {
            this.currentSequence = onRejectSequenceNodes;
            (node.onReject.mediatorList as any).forEach((mediator: STNode) => {
                traversNode(mediator, this);
            });
        }
        this.parents.pop();

        this.currentSequence = currentSequence;
        this.currentSequence.push(
            new AdvancedMediatorNodeModel({
                node: node,
                name: MEDIATORS.THROTTLE,
                description: node.id?.toString(),
                documentUri: this.documentUri,
                sequenceType: this.sequenceType,
                parentNode: this.parents[this.parents.length - 1],
                subSequences: [{
                    name: "OnAccept", nodes: onAcceptSequenceNodes, range: node.onAccept?.range
                }, {
                    name: "OnReject", nodes: onRejectSequenceNodes, range: node.onReject?.range
                }]
            }
            ));
        this.skipChildrenVisit = true;
    }

    beginVisitEndpoint(node: Endpoint): void {
        type EndpointType = keyof typeof ENDPOINTS;
        const type: EndpointType = (node as any).type.split("_").slice(0, -1).join('');
        this.currentSequence.push(
            new SimpleMediatorNodeModel({
                node: node,
                name: ENDPOINTS[type],
                description: node.key?.toString(),
                documentUri: this.documentUri,
                sequenceType: this.sequenceType,
                parentNode: this.parents[this.parents.length - 1]
            }
            ));
    }

    beginVisitEndpointHttp(node: EndpointHttp): void {
        this.currentSequence.push(
            new SimpleMediatorNodeModel({
                node: node,
                name: ENDPOINTS.HTTP,
                description: node.tag?.toString(),
                documentUri: this.documentUri,
                sequenceType: this.sequenceType,
                parentNode: this.parents[this.parents.length - 1]
            }
            ));
    }

    endVisitEndpoint(): void {
        this.skipChildrenVisit = false;
    }

    endVisitThrottle(): void {
        this.skipChildrenVisit = false;
    }

    endVisitValidate(): void {
        this.skipChildrenVisit = false;
    }

    beginVisitInSequence(node: Sequence): void {
        const sequenceNodes: SequenceNodes = {
            type: SequenceType.IN_SEQUENCE,
            nodes: [],
            range: node.range
        };
        this.sequences.push(sequenceNodes);
        this.sequenceType = SequenceType.IN_SEQUENCE;
        this.currentSequence = sequenceNodes.nodes;
        this.parents.push(node);
    }

    endVisitInSequence(): void {
        this.parents.pop();
    }

    beginVisitOutSequence(node: Sequence): void {
        const sequenceNodes: SequenceNodes = {
            type: SequenceType.OUT_SEQUENCE,
            nodes: [],
            range: node.range
        };
        this.sequences.push(sequenceNodes);
        this.sequenceType = SequenceType.OUT_SEQUENCE;
        this.currentSequence = sequenceNodes.nodes;
        this.parents.push(node);
    }

    endVisitOutSequence(): void {
        this.parents.pop();
    }

    beginVisitFilter(node: Filter): void {
        const currentSequence = this.currentSequence;
        const thenSequenceNodes: [] = [];
        const elseSequenceNodes: [] = [];
        const subSequences = [];

        this.parents.push(node);
        if (node.then) {
            this.currentSequence = thenSequenceNodes;
            if (node.then.mediatorList) {
                (node.then.mediatorList as any).forEach((mediator: STNode) => {
                    traversNode(mediator, this);
                });
            }
            subSequences.push({
                name: "Then", nodes: thenSequenceNodes, range: node.then?.range
            });
        }

        if (node.else_) {
            this.currentSequence = elseSequenceNodes;
            if (node.else_.mediatorList) {
                (node.else_.mediatorList as any).forEach((mediator: STNode) => {
                    traversNode(mediator, this);
                });
            }
            subSequences.push({
                name: "Else", nodes: elseSequenceNodes, range: node.else_?.range
            });
        }
        this.parents.pop();

        this.currentSequence = currentSequence;
        this.currentSequence.push(
            new AdvancedMediatorNodeModel({
                node: node,
                name: MEDIATORS.FILTER,
                description: "",
                documentUri: this.documentUri,
                sequenceType: this.sequenceType,
                parentNode: this.parents[this.parents.length - 1],
                subSequences
            }
            ));
        this.skipChildrenVisit = true;
    }

    endVisitFilter(): void {
        this.skipChildrenVisit = false;
    }

    beginVisitPayloadFactory(node: PayloadFactory): void {
        this.currentSequence.push(
            new SimpleMediatorNodeModel({
                node: node,
                name: MEDIATORS.PAYLOAD,
                description: node.mediaType?.toString(),
                documentUri: this.documentUri,
                sequenceType: SequenceType.IN_SEQUENCE,
                parentNode: this.parents[this.parents.length - 1]
            }
            ));
    }

    skipChildren(): boolean {
        return this.skipChildrenVisit;
    }

    getSequences(): SequenceNodes[] {
        return this.sequences;
    }
}

