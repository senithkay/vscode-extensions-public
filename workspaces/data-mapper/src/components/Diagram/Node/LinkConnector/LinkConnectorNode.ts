/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import { PrimitiveBalType, STModification } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    FieldAccess,
    NodePosition,
    OptionalFieldAccess,
    SimpleNameReference,
    STKindChecker,
    STNode,
    traversNode
} from "@wso2-enterprise/syntax-tree";
import md5 from "blueimp-md5";
import { Diagnostic } from "vscode-languageserver-protocol";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { isPositionsEquals } from "../../../../utils/st-utils";
import { DataMapperLinkModel } from "../../Link";
import { IntermediatePortModel, RecordFieldPortModel } from "../../Port";
import {
    LIST_CONSTRUCTOR_TARGET_PORT_PREFIX,
    OFFSETS, PRIMITIVE_TYPE_TARGET_PORT_PREFIX
} from "../../utils/constants";
import {
    getDefaultValue,
    getInputNodeExpr,
    getInputPortsForExpr,
    getOutputPortForField
} from "../../utils/dm-utils";
import { FnDefInfo } from "../../utils/fn-definition-store";
import { filterDiagnostics } from "../../utils/ls-utils";
import { LinkDeletingVisitor } from "../../visitors/LinkDeletingVistior";
import { DataMapperNodeModel } from "../commons/DataMapperNode";
import { ListConstructorNode } from "../ListConstructor";
import { MappingConstructorNode } from "../MappingConstructor";
import { PrimitiveTypeNode } from "../PrimitiveType";

export const LINK_CONNECTOR_NODE_TYPE = "link-connector-node";

export class LinkConnectorNode extends DataMapperNodeModel {

    public sourcePorts: RecordFieldPortModel[] = [];
    public targetMappedPort: RecordFieldPortModel;
    public targetPort: RecordFieldPortModel;

    public inPort: IntermediatePortModel;
    public outPort: IntermediatePortModel;

    public value: string;
    public diagnostics: Diagnostic[];
    public hidden: boolean;

    constructor(
        public context: IDataMapperContext,
        public valueNode: STNode,
        public editorLabel: string,
        public parentNode: STNode,
        public fieldAccessNodes: (FieldAccess | OptionalFieldAccess | SimpleNameReference)[],
        public fields: STNode[],
        public fnDefForFnCall?: FnDefInfo,
        public isPrimitiveTypeArrayElement?: boolean) {
        super(
            context,
            LINK_CONNECTOR_NODE_TYPE
        );
        if (STKindChecker.isSpecificField(valueNode)) {
            this.value = valueNode.valueExpr ? valueNode.valueExpr.source.trim() : '';
            this.diagnostics = filterDiagnostics(this.context.diagnostics, valueNode.valueExpr.position as NodePosition);
        } else {
            this.value = valueNode.value ? (valueNode.value as string).trim()  : valueNode.source.trim();
            this.diagnostics = filterDiagnostics(this.context.diagnostics, valueNode.position as NodePosition);
        }
    }

    initPorts(): void {
        this.inPort = new IntermediatePortModel(
            md5(JSON.stringify(this.valueNode.position) + "IN")
            , "IN"
        );
        this.addPort(this.inPort);
        this.outPort = new IntermediatePortModel(
            md5(JSON.stringify(this.valueNode.position) + "OUT")
            , "OUT"
        );
        this.addPort(this.outPort);

        this.fieldAccessNodes.forEach((field) => {
            const inputNode = getInputNodeExpr(field, this);
            if (inputNode) {
                this.sourcePorts.push(getInputPortsForExpr(inputNode, field));
            }
        })

        if (this.outPort) {
            this.getModel().getNodes().map((node) => {
                if (node instanceof MappingConstructorNode
                    || node instanceof PrimitiveTypeNode
                    || node instanceof ListConstructorNode)
                {
                    if (STKindChecker.isFunctionDefinition(this.parentNode)
                        || STKindChecker.isQueryExpression(this.parentNode)
                        || STKindChecker.isBracedExpression(this.parentNode))
                    {
                        if (node instanceof PrimitiveTypeNode) {
                            this.targetPort = node.getPort(
                                `${PRIMITIVE_TYPE_TARGET_PORT_PREFIX}.${node.recordField.type.typeName}.IN`
                            ) as RecordFieldPortModel;
                        } else if (node instanceof ListConstructorNode) {
                            this.targetPort = node.getPort(
                                `${LIST_CONSTRUCTOR_TARGET_PORT_PREFIX}.${node.rootName}.IN`
                            ) as RecordFieldPortModel;
                        }
                        this.targetMappedPort = this.targetPort;
                    } else {
                        [this.targetPort, this.targetMappedPort] = getOutputPortForField(this.fields, node);
                    }
                    if (this.targetMappedPort?.portName !== this.targetPort?.portName) {
                        this.hidden = true;
                    }
                }
            });
        }
    }

    initLinks(): void {
        if (!this.hidden) {
            this.sourcePorts.forEach((sourcePort) => {
                const inPort = this.inPort;

                const lm = new DataMapperLinkModel(undefined, undefined, true);
                if (sourcePort) {
                    lm.setTargetPort(this.inPort);
                    lm.setSourcePort(sourcePort);
                    sourcePort.addLinkedPort(this.inPort);
                    sourcePort.addLinkedPort(this.targetMappedPort)

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

                this.getModel().addAll(lm);
            }
        } else {
            if (this.targetMappedPort) {
                this.sourcePorts.forEach((sourcePort) => {
                    const inPort = this.targetMappedPort;

                    const lm = new DataMapperLinkModel(undefined, this.diagnostics, true);
                    lm.setTargetPort(this.targetMappedPort);
                    lm.setSourcePort(sourcePort);
                    sourcePort.addLinkedPort(this.targetMappedPort);

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
                })
            }
        }
    }

    updateSource(): void {
        const targetPosition = STKindChecker.isSpecificField(this.valueNode)
            ? this.valueNode.valueExpr.position as NodePosition
            : this.valueNode.position as NodePosition;
        const modifications = [
            {
                type: "INSERT",
                config: {
                    "STATEMENT": this.value,
                },
                ...targetPosition
            }
        ];
        void this.context.applyModifications(modifications);
    }

    public updatePosition() {
        const position = this.targetMappedPort.getPosition()
        this.setPosition(this.hasError() ? OFFSETS.LINK_CONNECTOR_NODE_WITH_ERROR.X : OFFSETS.LINK_CONNECTOR_NODE.X, position.y - 5.5)
    }

    public hasError(): boolean {
        return this.diagnostics.length > 0;
    }

    public deleteLink(): void {
        const targetField = this.targetPort.field;
        let modifications: STModification[];
        const selectedST = this.context.selection.selectedST.stNode;
        const exprFuncBodyPosition: NodePosition = STKindChecker.isFunctionDefinition(selectedST)
            && STKindChecker.isExpressionFunctionBody(selectedST.functionBody)
            && selectedST.functionBody.expression.position;
        if ((!targetField?.name && targetField?.typeName !== PrimitiveBalType.Array
            && targetField?.typeName !== PrimitiveBalType.Record)
            || (isPositionsEquals(exprFuncBodyPosition, this.valueNode.position)))
        {
            let deletePosition = this.valueNode.position;
            if (STKindChecker.isQueryExpression(this.valueNode)) {
                deletePosition = this.valueNode.selectClause.expression?.position;
            }
            // Fallback to the default value if the target is a primitive type element
            modifications = [{
                type: "INSERT",
                config: {
                    "STATEMENT": getDefaultValue(targetField?.typeName)
                },
                ...deletePosition
            }];
        } else if ((this.targetPort?.parentModel?.field?.typeName === PrimitiveBalType.Union
            || this.targetPort?.parentModel?.field?.originalTypeName === PrimitiveBalType.Union)
            && STKindChecker.isSpecificField(this.valueNode)) {
            modifications = [{
                type: "INSERT",
                config: { "STATEMENT": "" },
                ...this.valueNode?.valueExpr?.position
            }];
        } else {
            const linkDeleteVisitor = new LinkDeletingVisitor(this.valueNode.position as NodePosition, this.parentNode);
            traversNode(this.context.selection.selectedST.stNode, linkDeleteVisitor);
            const nodePositionsToDelete = linkDeleteVisitor.getPositionToDelete();

            modifications = [{
                type: "DELETE",
                ...nodePositionsToDelete
            }];
        }

        void this.context.applyModifications(modifications);
    }
}
