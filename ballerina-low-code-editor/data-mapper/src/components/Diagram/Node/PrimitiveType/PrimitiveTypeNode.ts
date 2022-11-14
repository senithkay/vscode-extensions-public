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
import { PrimitiveBalType, STModification, Type } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    ExpressionFunctionBody,
    IdentifierToken,
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
import { PRIMITIVE_TYPE_TARGET_PORT_PREFIX } from "../../utils/constants";
import {
    getDefaultValue,
    getEnrichedRecordType,
    getInputNodeExpr,
    getInputPortsForExpr,
    getOutputPortForField,
    getTypeName,
    isArrayOrRecord
} from "../../utils/dm-utils";
import { filterDiagnostics } from "../../utils/ls-utils";
import { RecordTypeDescriptorStore } from "../../utils/record-type-descriptor-store";
import { LinkDeletingVisitor } from "../../visitors/LinkDeletingVistior";
import { DataMapperNodeModel, TypeDescriptor } from "../commons/DataMapperNode";

export const PRIMITIVE_TYPE_NODE_TYPE = "data-mapper-node-primitive-type";

export class PrimitiveTypeNode extends DataMapperNodeModel {

    public typeDef: Type;
    public recordField: EditableRecordField;
    public typeName: string;
    public x: number;
    public y: number;

    constructor(
        public context: IDataMapperContext,
        public value: SelectClause | ExpressionFunctionBody,
        public typeIdentifier: TypeDescriptor | IdentifierToken) {
        super(
            context,
            PRIMITIVE_TYPE_NODE_TYPE
        );
    }

    async initPorts() {
        const recordTypeDescriptors = RecordTypeDescriptorStore.getInstance();
        this.typeDef = recordTypeDescriptors.getTypeDescriptor({
            startLine: this.typeIdentifier.position.startLine,
            startColumn: this.typeIdentifier.position.startColumn,
            endLine: this.typeIdentifier.position.startLine,
            endColumn: this.typeIdentifier.position.startColumn
        });

        if (this.typeDef) {
            const parentPort = this.addPortsForHeaderField(this.typeDef, '', "IN",
                PRIMITIVE_TYPE_TARGET_PORT_PREFIX, this.context.collapsedFields, STKindChecker.isSelectClause(this.value));

            const valueEnrichedType = getEnrichedRecordType(this.typeDef,
                this.value.expression, this.context.selection.selectedST.stNode);
            this.typeName = getTypeName(valueEnrichedType.type);
            this.recordField = valueEnrichedType;
            if (valueEnrichedType.type.typeName === PrimitiveBalType.Array
                && STKindChecker.isSelectClause(this.value)
            ) {
                this.recordField = valueEnrichedType.elements[0].member;
            }
            this.addPortsForOutputRecordField(this.recordField, "IN", this.recordField.type.typeName,
                undefined, PRIMITIVE_TYPE_TARGET_PORT_PREFIX, parentPort,
                this.context.collapsedFields, parentPort.collapsed, STKindChecker.isSelectClause(this.value));
        }
    }

    async initLinks() {
        const mappings = this.genMappings(this.value.expression);
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
            let [outPort, mappedOutPort] = getOutputPortForField(fields, this);
            if (!isArrayOrRecord(this.recordField.type)) {
                outPort = this.getPort(
                    `${PRIMITIVE_TYPE_TARGET_PORT_PREFIX}.${this.recordField.type.typeName}.IN`) as RecordFieldPortModel;
                mappedOutPort = outPort;
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
                    deleteLink: () => this.deleteField(field),
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

    async deleteField(field: STNode) {
        let modifications: STModification[];
        if (this.typeDef?.typeName === PrimitiveBalType.Array && this.typeDef.memberType
            && this.typeDef.memberType.typeName !== PrimitiveBalType.Array
            && this.typeDef.memberType.typeName !== PrimitiveBalType.Record)
        {
            // Fallback to the default value if the target is a primitive type element
            modifications = [{
                type: "INSERT",
                config: {
                    "STATEMENT": getDefaultValue(this.typeDef.memberType)
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
                super.setPosition(x, y);
            }
        }
    }
}
