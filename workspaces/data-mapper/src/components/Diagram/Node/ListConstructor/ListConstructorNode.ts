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
import { Point } from "@projectstorm/geometry";
import { STModification } from "@wso2-enterprise/ballerina-languageclient";
import { PrimitiveBalType, Type } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    ExpressionFunctionBody,
    IdentifierToken,
    ListConstructor,
    QueryExpression,
    SelectClause,
    STKindChecker,
    STNode,
    traversNode
} from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { ExpressionLabelModel } from "../../Label";
import { DataMapperLinkModel } from "../../Link";
import { EditableRecordField } from "../../Mappings/EditableRecordField";
import { FieldAccessToSpecificFied } from "../../Mappings/FieldAccessToSpecificFied";
import { RecordFieldPortModel } from "../../Port";
import { LIST_CONSTRUCTOR_TARGET_PORT_PREFIX } from "../../utils/constants";
import {
    getBalRecFieldName,
    getDefaultValue,
    getEnrichedRecordType,
    getInputNodeExpr,
    getInputPortsForExpr,
    getOutputPortForField,
    getTypeName,
    getTypeOfOutput,
    getTypeOfValue
} from "../../utils/dm-utils";
import { filterDiagnostics } from "../../utils/ls-utils";
import { LinkDeletingVisitor } from "../../visitors/LinkDeletingVistior";
import { DataMapperNodeModel, TypeDescriptor } from "../commons/DataMapperNode";

export const LIST_CONSTRUCTOR_NODE_TYPE = "data-mapper-node-list-constructor";

export class ListConstructorNode extends DataMapperNodeModel {

    public typeDef: Type;
    public recordField: EditableRecordField;
    public typeName: string;
    public rootName: string;
    public x: number;
    public y: number;

    constructor(
        public context: IDataMapperContext,
        public value: ExpressionFunctionBody | SelectClause,
        public typeIdentifier: TypeDescriptor | IdentifierToken,
        public queryExpr?: QueryExpression) {
        super(
            context,
            LIST_CONSTRUCTOR_NODE_TYPE
        );
    }

    async initPorts() {
        this.typeDef = getTypeOfOutput(this.typeIdentifier, this.context.ballerinaVersion);

        if (this.typeDef) {
            const isSelectClause = STKindChecker.isSelectClause(this.value);
            this.rootName = this.typeDef?.name ? getBalRecFieldName(this.typeDef.name) : this.typeDef.typeName;
            if (isSelectClause){
                this.rootName = this.typeIdentifier.value || this.typeIdentifier.source;
            }
            const valueEnrichedType = getEnrichedRecordType(this.typeDef,
                this.queryExpr || this.value.expression, this.context.selection.selectedST.stNode);
            this.typeName = getTypeName(valueEnrichedType.type);
            this.recordField = valueEnrichedType;
            const parentPort = this.addPortsForHeaderField(this.typeDef, this.rootName, "IN",
                LIST_CONSTRUCTOR_TARGET_PORT_PREFIX, this.context.collapsedFields, isSelectClause, this.recordField);
            if (valueEnrichedType.type.typeName === PrimitiveBalType.Array) {
                if (isSelectClause) {
                    this.recordField = valueEnrichedType.elements[0].member;
                }
                if (this.recordField?.elements && this.recordField.elements.length > 0) {
                    this.recordField.elements.forEach((field, index) => {
                        this.addPortsForOutputRecordField(field.member, "IN", this.rootName, index,
                            LIST_CONSTRUCTOR_TARGET_PORT_PREFIX, parentPort,
                            this.context.collapsedFields, parentPort.collapsed);
                    });
                }
            }
        }
    }

    async initLinks() {
        const mappings = this.genMappings(this.value.expression as ListConstructor);
        this.createLinks(mappings);
    }

    private createLinks(mappings: FieldAccessToSpecificFied[]) {
        mappings.forEach((mapping) => {
            const { fields, value, otherVal } = mapping;
            const field = fields[fields.length - 1];
            if (!value || !value.source) {
                // Unsupported mapping
                return;
            }
            const inputNode = getInputNodeExpr(value, this);
            let inPort: RecordFieldPortModel;
            if (inputNode) {
                inPort = getInputPortsForExpr(inputNode, value);
            }
            let outPort: RecordFieldPortModel;
            let mappedOutPort: RecordFieldPortModel;
            if (this.recordField.type.typeName === PrimitiveBalType.Array
                && this.recordField?.value
                && !STKindChecker.isListConstructor(this.recordField.value)
            ) {
                outPort = this.getPort(`${LIST_CONSTRUCTOR_TARGET_PORT_PREFIX}.${this.rootName}.IN`) as RecordFieldPortModel;
                mappedOutPort = outPort;
            } else {
                [outPort, mappedOutPort] = getOutputPortForField(fields, this);
            }
            const lm = new DataMapperLinkModel(value, filterDiagnostics(this.context.diagnostics, value.position), true);
            if (inPort && mappedOutPort) {
                lm.addLabel(new ExpressionLabelModel({
                    value: otherVal?.source || value.source,
                    valueNode: otherVal || value,
                    context: this.context,
                    link: lm,
                    field: STKindChecker.isSpecificField(field)
                        ? field.valueExpr
                        : field,
                    editorLabel: STKindChecker.isSpecificField(field)
                        ? field.fieldName.value
                        : `${outPort.fieldFQN.split('.').pop()}[${outPort.index}]`,
                    deleteLink: () => this.deleteField(field, true)
                }));
                lm.setTargetPort(mappedOutPort);
                lm.setSourcePort(inPort);
                lm.registerListener({
                    selectionChanged(event) {
                        if (event.isSelected) {
                            inPort.fireEvent({}, "link-selected");
                            mappedOutPort.fireEvent({}, "link-selected");
                        } else {
                            inPort.fireEvent({}, "link-unselected");
                            mappedOutPort.fireEvent({}, "link-unselected");
                        }
                    },
                })
                this.getModel().addAll(lm);
            }
        });
    }

    async deleteField(field: STNode, keepDefaultVal?: boolean) {
        let modifications: STModification[];
        const typeOfValue = getTypeOfValue(this.recordField, field.position);
        if (keepDefaultVal && !STKindChecker.isSpecificField(field)) {
            modifications = [{
                type: "INSERT",
                config: {
                    "STATEMENT": getDefaultValue(typeOfValue)
                },
                ...field.position
            }];
        } else {
            const linkDeleteVisitor = new LinkDeletingVisitor(field.position, this.value.expression);
            traversNode(this.value.expression, linkDeleteVisitor);
            const nodePositionsToDelete = linkDeleteVisitor.getPositionToDelete();
            modifications = [{
                type: "DELETE",
                ...nodePositionsToDelete
            }]
        }

        await this.context.applyModifications(modifications);
    }


    public updatePosition() {
        this.setPosition(this.position.x, this.position.y);
    }

    setPosition(point: Point): void;
    setPosition(x: number, y: number): void;
    setPosition(x: unknown, y?: unknown): void {
        if (typeof x === 'number' && typeof y === 'number') {
            if (!this.x || !this.y) {
                this.x = x;
                this.y = y;
            }
            super.setPosition(x, y || this.y);
        }
    }
}
