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
import { STModification } from "@wso2-enterprise/ballerina-languageclient";
import { PrimitiveBalType, Type } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    CaptureBindingPattern,
    NodePosition,
    QueryExpression,
    STKindChecker,
    STNode,
    traversNode
} from "@wso2-enterprise/syntax-tree";
import md5 from "blueimp-md5";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { isPositionsEquals } from "../../../../utils/st-utils";
import { DataMapperLinkModel } from "../../Link";
import { IntermediatePortModel, RecordFieldPortModel } from "../../Port";
import {
    EXPANDED_QUERY_SOURCE_PORT_PREFIX,
    LET_EXPRESSION_SOURCE_PORT_PREFIX,
    LIST_CONSTRUCTOR_TARGET_PORT_PREFIX,
    OFFSETS
} from "../../utils/constants";
import { getExprBodyFromLetExpression, getFieldNames, getTypeFromStore } from "../../utils/dm-utils";
import { LinkDeletingVisitor } from "../../visitors/LinkDeletingVistior";
import { DataMapperNodeModel } from "../commons/DataMapperNode";
import { FromClauseNode } from "../FromClause";
import { ListConstructorNode } from "../ListConstructor";
import { MappingConstructorNode } from "../MappingConstructor";
import { RequiredParamNode } from "../RequiredParam";

export const QUERY_EXPR_NODE_TYPE = "datamapper-node-query-expr";

export class QueryExpressionNode extends DataMapperNodeModel {

    public sourceTypeDesc: Type;
    public sourcePort: RecordFieldPortModel;
    public targetPort: RecordFieldPortModel;

    public inPort: IntermediatePortModel;
    public outPort: IntermediatePortModel;

    public sourceBindingPattern: CaptureBindingPattern;
    public targetFieldFQN: string;
    public hidden: boolean;

    constructor(
        public context: IDataMapperContext,
        public value: QueryExpression,
        public parentNode: STNode) {
        super(
            context,
            QUERY_EXPR_NODE_TYPE
        );
    }

    initPorts(): void {
        this.getSourceType();
        this.getTargetType();
        this.inPort = new IntermediatePortModel(
            md5(JSON.stringify(this.value.position) + "IN")
            , "IN"
        );
        this.addPort(this.inPort);
        this.outPort = new IntermediatePortModel(
            md5(JSON.stringify(this.value.position) + "OUT")
            , "OUT"
        );
        this.addPort(this.outPort);
    }

    private getSourceType(): void {
        const fromClause = this.value.queryPipeline.fromClause;
        const sourceFieldAccess = fromClause.expression;
        const bindingPattern = this.value.queryPipeline.fromClause.typedBindingPattern.bindingPattern;
        if (STKindChecker.isCaptureBindingPattern(bindingPattern)) {
            this.sourceBindingPattern = bindingPattern;
            const type = getTypeFromStore(fromClause.expression.position);

            if (type && type?.memberType && type.typeName === PrimitiveBalType.Array) {
                this.sourceTypeDesc = type.memberType;
            }

            let fieldId: string;
            let paramName: string;
            if (STKindChecker.isFieldAccess(sourceFieldAccess)) {
                const fieldNames = getFieldNames(sourceFieldAccess);
                fieldId = fieldNames.reduce((pV, cV) => pV ? `${pV}.${cV}` : cV, "");
                paramName = fieldNames[0];
            } else if (STKindChecker.isSimpleNameReference(sourceFieldAccess)) {
                fieldId = sourceFieldAccess.name.value;
                paramName = fieldId;
            }

            this.getModel().getNodes().map((node) => {
                if (node instanceof RequiredParamNode && node.value.paramName.value === paramName) {
                    this.sourcePort = node.getPort(fieldId + ".OUT") as RecordFieldPortModel;
                } else if (node instanceof FromClauseNode
                    && STKindChecker.isCaptureBindingPattern(node.value.typedBindingPattern.bindingPattern)
                    && node.value.typedBindingPattern.bindingPattern.source.trim() === paramName.trim())
                {
                    this.sourcePort = node.getPort(
                        `${EXPANDED_QUERY_SOURCE_PORT_PREFIX}.${fieldId}.OUT`) as RecordFieldPortModel;
                }
                while (this.sourcePort && this.sourcePort.hidden){
                    this.sourcePort = this.sourcePort.parentModel;
                }
            });
        }
    }

    private getTargetType(): void {
        const fieldNamePosition = STKindChecker.isSpecificField(this.parentNode)
                                    && this.parentNode.fieldName.position as NodePosition;
        if (fieldNamePosition) {
            this.getModel().getNodes().map((node) => {
                if (node instanceof MappingConstructorNode || node instanceof ListConstructorNode) {
                    const ports = Object.entries(node.getPorts());
                    ports.map((entry) => {
                        const port = entry[1];
                        if (port instanceof RecordFieldPortModel
                            && port?.editableRecordField && port.editableRecordField?.value
                            && STKindChecker.isSpecificField(port.editableRecordField.value)
                            && isPositionsEquals(port.editableRecordField.value.fieldName.position as NodePosition,
                                            fieldNamePosition)
                        ) {
                            this.targetPort = port;
                        }
                    });
                }
            });
        } else if (STKindChecker.isExpressionFunctionBody(this.parentNode)) {
            const exprPosition = this.parentNode.expression.position;
            this.getModel().getNodes().forEach((node) => {
                if (node instanceof ListConstructorNode) {
                    const ports = Object.entries(node.getPorts());
                    ports.map((entry) => {
                        const port = entry[1];
                        if (port instanceof RecordFieldPortModel
                            && port?.editableRecordField && port.editableRecordField?.value
                            && STKindChecker.isQueryExpression(port.editableRecordField.value)
                            && isPositionsEquals(port.editableRecordField.value.position, exprPosition)
                            && port.portName === `${LIST_CONSTRUCTOR_TARGET_PORT_PREFIX}.${node.rootName}`
                            && port.portType === 'IN'
                        ) {
                            this.targetPort = port;
                        }
                    });
                }
            });
        } else if (STKindChecker.isLetExpression(this.parentNode)) {
            const exprPosition = this.parentNode.expression.position;
            this.getModel().getNodes().forEach((node) => {
                if (node instanceof ListConstructorNode) {
                    const ports = Object.entries(node.getPorts());
                    ports.map((entry) => {
                        const port = entry[1];
                        if (port instanceof RecordFieldPortModel
                            && port?.editableRecordField && port.editableRecordField?.value
                            && STKindChecker.isLetExpression(port.editableRecordField.value)
                            && isPositionsEquals(getExprBodyFromLetExpression(port.editableRecordField.value).position, exprPosition)
                            && port.portName === `${LIST_CONSTRUCTOR_TARGET_PORT_PREFIX}.${node.rootName}`
                            && port.portType === 'IN'
                        ) {
                            this.targetPort = port;
                        }
                    });
                }
            });
        }

        if (this.targetPort?.hidden){
            this.hidden = true;
        }
        while (this.targetPort && this.targetPort.hidden){
            this.targetPort = this.targetPort.parentModel;
        }
    }

    initLinks(): void {
        if (!this.hidden) {
            // Currently, we create links from "IN" ports and back tracing the inputs.
            if (this.sourcePort && this.inPort) {
                const link = new DataMapperLinkModel(undefined, undefined, true);
                link.setSourcePort(this.sourcePort);
                link.setTargetPort(this.inPort);
                this.sourcePort.addLinkedPort(this.inPort);
                this.sourcePort.addLinkedPort(this.targetPort);
                link.registerListener({
                    selectionChanged: (event) => {
                        if (event.isSelected) {
                            this.sourcePort.fireEvent({}, "link-selected");
                            this.inPort.fireEvent({}, "link-selected");
                        } else {

                            this.sourcePort.fireEvent({}, "link-unselected");
                            this.inPort.fireEvent({}, "link-unselected");
                        }
                    },
                })
                this.getModel().addAll(link);
            }

            // TODO - temp hack to render link
            if (this.outPort && this.targetPort) {
                const link = new DataMapperLinkModel(undefined, undefined, true);
                link.setSourcePort(this.outPort);
                link.setTargetPort(this.targetPort);
                link.registerListener({
                    selectionChanged: (event) => {
                        if (event.isSelected) {
                            this.targetPort.fireEvent({}, "link-selected");
                            this.outPort.fireEvent({}, "link-selected");
                        } else {
                            this.targetPort.fireEvent({}, "link-unselected");
                            this.outPort.fireEvent({}, "link-unselected");
                        }
                    },
                })
                this.getModel().addAll(link);
                this.targetFieldFQN = this.targetPort.fieldFQN;
            }
        } else {
            if (this.sourcePort && this.targetPort) {
                const link = new DataMapperLinkModel(undefined, undefined, true);
                link.setSourcePort(this.sourcePort);
                link.setTargetPort(this.targetPort);
                this.sourcePort.addLinkedPort(this.targetPort);
                link.registerListener({
                    selectionChanged: (event) => {
                        if (event.isSelected) {
                            this.sourcePort.fireEvent({}, "link-selected");
                            this.targetPort.fireEvent({}, "link-selected");
                        } else {

                            this.sourcePort.fireEvent({}, "link-unselected");
                            this.targetPort.fireEvent({}, "link-unselected");
                        }
                    },
                })
                this.getModel().addAll(link);
            }
        }
    }

    public updatePosition() {
        if (this.targetPort){
            const position = this.targetPort.getPosition()
            this.setPosition(OFFSETS.QUERY_EXPRESSION_NODE.X, position.y - 2)
        }
    }

    public deleteLink(): void {
        let modifications: STModification[];
        const dmNode = this.getModel().getNodes().find(node =>
            node instanceof MappingConstructorNode || node instanceof ListConstructorNode
        ) as MappingConstructorNode | ListConstructorNode;
        if (dmNode) {
            if (STKindChecker.isSpecificField(this.parentNode)) {
                const rootConstruct = dmNode.value.expression;
                const linkDeleteVisitor = new LinkDeletingVisitor(this.parentNode.position as NodePosition, rootConstruct);
                traversNode(this.context.selection.selectedST.stNode, linkDeleteVisitor);
                const nodePositionsToDelete = linkDeleteVisitor.getPositionToDelete();
                modifications = [{
                    type: "DELETE",
                    ...nodePositionsToDelete
                }];
            } else {
                if (dmNode instanceof ListConstructorNode) {
                    modifications = [{
                        type: "INSERT",
                        config: {
                            "STATEMENT": '[]'
                        },
                        ...this.value.position
                    }];
                }
            }
        }

        void this.context.applyModifications(modifications);
    }
}
