/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { TypeKind } from "@wso2-enterprise/mi-core";
import md5 from "blueimp-md5";
import { Diagnostic, ElementAccessExpression, Identifier, Node, PropertyAccessExpression } from "ts-morph";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { DataMapperLinkModel } from "../../Link";
import { IntermediatePortModel, InputOutputPortModel } from "../../Port";
import { ARRAY_OUTPUT_TARGET_PORT_PREFIX, OFFSETS, PRIMITIVE_OUTPUT_TARGET_PORT_PREFIX } from "../../utils/constants";
import { DataMapperNodeModel } from "../commons/DataMapperNode";
import { ObjectOutputNode } from "../ObjectOutput";
import { getPosition, isPositionsEquals, traversNode } from "../../utils/st-utils";
import {
    findInputNode,
    getDefaultValue,
    getInputPort,
    getOutputPort,
    getTargetPortPrefix
} from "../../utils/common-utils";
import { getDiagnostics } from "../../utils/diagnostics-utils";
import { ArrayOutputNode } from "../ArrayOutput";
import { LinkDeletingVisitor } from "../../../../components/Visitors/LinkDeletingVistior";
import { PrimitiveOutputNode } from "../PrimitiveOutput";

export const LINK_CONNECTOR_NODE_TYPE = "link-connector-node";
const NODE_ID = "link-connector-node";

export class LinkConnectorNode extends DataMapperNodeModel {

    public sourcePorts: InputOutputPortModel[] = [];
    public targetPort: InputOutputPortModel;
    public targetMappedPort: InputOutputPortModel;

    public inPort: IntermediatePortModel;
    public outPort: IntermediatePortModel;

    public value: string;
    public diagnostics: Diagnostic[];
    public hidden: boolean;
    public hasInitialized: boolean;

    constructor(
        public context: IDataMapperContext,
        public valueNode: Node,
        public editorLabel: string,
        public parentNode: Node,
        public inputAccessNodes: (PropertyAccessExpression | ElementAccessExpression | Identifier)[],
        public fields: Node[],
        public isPrimitiveTypeArrayElement?: boolean
    ) {
        super(
            NODE_ID,
            context,
            LINK_CONNECTOR_NODE_TYPE
        );
        if (Node.isPropertyAssignment(valueNode)) {
            this.value = valueNode.getInitializer() ? valueNode.getInitializer().getText().trim() : '';
            this.diagnostics = getDiagnostics(valueNode.getInitializer());
        } else {
            this.value = valueNode.getText().trim();
            this.diagnostics = getDiagnostics(valueNode);
        }
    }

    initPorts(): void {
        this.sourcePorts = [];
        this.targetMappedPort = undefined;
        this.inPort = new IntermediatePortModel(
            md5(JSON.stringify(getPosition(this.valueNode)) + "IN")
            , "IN"
        );
        this.addPort(this.inPort);
        this.outPort = new IntermediatePortModel(
            md5(JSON.stringify(getPosition(this.valueNode)) + "OUT")
            , "OUT"
        );
        this.addPort(this.outPort);

        this.inputAccessNodes.forEach((field) => {
            const inputNode = findInputNode(field, this);
            if (inputNode) {
                this.sourcePorts.push(getInputPort(inputNode, field));
            }
        })

        if (this.outPort) {
            this.getModel().getNodes().map((node) => {
    
                if (node instanceof ObjectOutputNode
                    || node instanceof ArrayOutputNode
                    || node instanceof PrimitiveOutputNode
                ) {
                    const targetPortPrefix = getTargetPortPrefix(node);

                    if (Node.isBlock(this.parentNode)) {
                        if (!(node instanceof ObjectOutputNode)) {
                            const typeName = targetPortPrefix === PRIMITIVE_OUTPUT_TARGET_PORT_PREFIX
                                ? node.dmTypeWithValue.type.kind
                                : targetPortPrefix === ARRAY_OUTPUT_TARGET_PORT_PREFIX
                                    ? (node as ArrayOutputNode).rootName
                                    : undefined;
                            this.targetPort = node.getPort(
                                `${targetPortPrefix}${typeName ? `.${typeName}` : ''}.IN`) as InputOutputPortModel;
                        }
                        this.targetMappedPort = this.targetPort;
                    } else {
                        const rootName = targetPortPrefix === ARRAY_OUTPUT_TARGET_PORT_PREFIX
                            && (node as ArrayOutputNode).rootName;

                        [this.targetPort, this.targetMappedPort] = getOutputPort(
                            this.fields, node.dmTypeWithValue, targetPortPrefix,
                            (portId: string) =>  node.getPort(portId) as InputOutputPortModel, rootName
                        );
                        const previouslyHidden = this.hidden;
                        this.hidden = this.targetMappedPort?.portName !== this.targetPort?.portName;
                        if (this.hidden !== previouslyHidden) {
                            this.hasInitialized = false;
                        }
                    }
                }
            });
        }
    }

    initLinks(): void {
        if (this.hasInitialized) {
            return;
        }
        if (this.hidden) {
            if (this.targetMappedPort) {
                this.sourcePorts.forEach((sourcePort) => {
                    const inPort = this.targetMappedPort;
                    const lm = new DataMapperLinkModel(undefined, this.diagnostics, true);

                    sourcePort.addLinkedPort(this.targetMappedPort);

                    lm.setTargetPort(this.targetMappedPort);
                    lm.setSourcePort(sourcePort);
                    lm.registerListener({
                        selectionChanged(event) {
                            if (event.isSelected) {
                                inPort.fireEvent({}, "link-selected");
                                sourcePort.fireEvent({}, "link-selected");
                            } else {
                                inPort.fireEvent({}, "link-unselected");
                                sourcePort.fireEvent({}, "link-unselected");
                            }
                        },
                    })
                    this.getModel().addAll(lm);

                    if (!this.editorLabel) {
                        this.editorLabel = this.targetMappedPort.fieldFQN.split('.').pop();
                    }
                })
            }
        } else {
            this.sourcePorts.forEach((sourcePort) => {
                const inPort = this.inPort;
                const lm = new DataMapperLinkModel(undefined, this.diagnostics, true);
    
                if (sourcePort) {
                    sourcePort.addLinkedPort(this.inPort);
                    sourcePort.addLinkedPort(this.targetMappedPort)

                    lm.setTargetPort(this.inPort);
                    lm.setSourcePort(sourcePort);
                    lm.registerListener({
                        selectionChanged(event) {
                            if (event.isSelected) {
                                inPort.fireEvent({}, "link-selected");
                                sourcePort.fireEvent({}, "link-selected");
                            } else {
                                inPort.fireEvent({}, "link-unselected");
                                sourcePort.fireEvent({}, "link-unselected");
                            }
                        },
                    })
                    this.getModel().addAll(lm);
                }
            })

            if (this.targetMappedPort) {
                const outPort = this.outPort;
                const targetPort = this.targetMappedPort;

                const lm = new DataMapperLinkModel(undefined, this.diagnostics, true);

                lm.setTargetPort(this.targetMappedPort);
                lm.setSourcePort(this.outPort);
                lm.registerListener({
                    selectionChanged(event) {
                        if (event.isSelected) {
                            outPort.fireEvent({}, "link-selected");
                            targetPort.fireEvent({}, "link-selected");
                        } else {
                            outPort.fireEvent({}, "link-unselected");
                            targetPort.fireEvent({}, "link-unselected");
                        }
                    },
                })

                if (!this.editorLabel) {
                    this.editorLabel = this.targetMappedPort.fieldFQN.split('.').pop();
                }
                this.getModel().addAll(lm);
            }
        }
        this.hasInitialized = true;
    }

    updateSource(suffix: string): void {
        this.value = `${this.value} + ${suffix}`;
        const targetNode = Node.isPropertyAssignment(this.valueNode)
            ? this.valueNode.getInitializer()
            : this.valueNode;
        
        targetNode.replaceWithText(this.value);
        this.context.applyModifications();
    }

    public updatePosition() {
        if (this.targetMappedPort) {
            const position = this.targetMappedPort.getPosition()
            this.setPosition(this.hasError() ? OFFSETS.LINK_CONNECTOR_NODE_WITH_ERROR.X : OFFSETS.LINK_CONNECTOR_NODE.X, position.y - 2)
        }
    }

    public hasError(): boolean {
        return this.diagnostics.length > 0;
    }

    public async deleteLink(): Promise<void> {
        const targetField = this.targetPort.field;
        const targetNode = this.targetPort.getNode();
        const { functionST, applyModifications } = this.context;
        const exprFuncBodyPosition = getPosition(functionST.getBody());

        if ((!targetField?.fieldName
            && targetField?.kind !== TypeKind.Array
            && targetField?.kind !== TypeKind.Interface)
                || isPositionsEquals(exprFuncBodyPosition, getPosition(this.valueNode)))
        {
            this.valueNode.replaceWithText(getDefaultValue(targetField?.kind));
        } else {
            let rootExpr = this.parentNode;
            if (targetNode instanceof ObjectOutputNode || targetNode instanceof ArrayOutputNode) {
                rootExpr = targetNode.value.getExpression();
            }
            const linkDeleteVisitor = new LinkDeletingVisitor(this.valueNode, rootExpr);
            traversNode(functionST, linkDeleteVisitor);
            const targetNodes = linkDeleteVisitor.getNodesToDelete();

            targetNodes.forEach(node => {
                const parentNode = node.getParent();

                if (Node.isPropertyAssignment(node)) {
                    node.remove();
                } else if (parentNode && Node.isArrayLiteralExpression(parentNode)) {
                    const elementIndex = parentNode.getElements().find(e => e === node);
                    parentNode.removeElement(elementIndex);
                } else {
                    node.replaceWithText('');
                }
            });
        }

        await applyModifications();
    }
}
