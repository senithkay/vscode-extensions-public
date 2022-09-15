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
import { PrimitiveBalType, Type } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    ExpressionFunctionBody,
    IdentifierToken,
    MappingConstructor,
    SelectClause,
    STKindChecker,
    STNode,
    traversNode
} from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { isPositionsEquals } from "../../../../utils/st-utils";
import { ExpressionLabelModel } from "../../Label";
import { DataMapperLinkModel } from "../../Link";
import { EditableRecordField } from "../../Mappings/EditableRecordField";
import { FieldAccessToSpecificFied } from "../../Mappings/FieldAccessToSpecificFied";
import { RecordFieldPortModel } from "../../Port";
import {
    getBalRecFieldName,
    getEnrichedRecordType,
    getInputNodeExpr,
    getInputPortsForExpr
} from "../../utils/dm-utils";
import { filterDiagnostics } from "../../utils/ls-utils";
import { RecordTypeDescriptorStore } from "../../utils/record-type-descriptor-store";
import { LinkDeletingVisitor } from "../../visitors/LinkDeletingVistior";
import { DataMapperNodeModel, TypeDescriptor } from "../commons/DataMapperNode";

export const MAPPING_CONSTRUCTOR_NODE_TYPE = "data-mapper-node-mapping-constructor";
export const MAPPING_CONSTRUCTOR_TARGET_PORT_PREFIX = "mappingConstructor";

export class MappingConstructorNode extends DataMapperNodeModel {

    public typeDef: Type;
    public recordFields: EditableRecordField[];

    constructor(
        public context: IDataMapperContext,
        public value: ExpressionFunctionBody | SelectClause,
        public typeIdentifier: TypeDescriptor | IdentifierToken) {
        super(
            context,
            MAPPING_CONSTRUCTOR_NODE_TYPE
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
            const valueEnrichedType = getEnrichedRecordType(this.typeDef, this.value.expression);
            if (valueEnrichedType.type.typeName === PrimitiveBalType.Record) {
                this.recordFields = valueEnrichedType.childrenTypes;
                if (!!this.recordFields.length) {
                    this.recordFields.forEach((field) => {
                        this.addPortsForOutputRecordField(field, "IN", MAPPING_CONSTRUCTOR_TARGET_PORT_PREFIX);
                    });
                }
            } else if (valueEnrichedType.type.typeName === PrimitiveBalType.Array && STKindChecker.isSelectClause(this.value)) {
                // valueEnrichedType only contains a single element as it is being used within the select clause
                this.recordFields = valueEnrichedType.elements[0].members;
                if (!!this.recordFields.length) {
                    this.recordFields.forEach((field) => {
                        this.addPortsForOutputRecordField(field, "IN", MAPPING_CONSTRUCTOR_TARGET_PORT_PREFIX);
                    });
                }
            } else {
                // TODO: Add support for other return type descriptors
            }
        }
    }

    async initLinks() {
        const mappings = this.genMappings(this.value.expression as MappingConstructor);
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
            const outPort = this.getOutputPortForField(fields);
            const lm = new DataMapperLinkModel(value, filterDiagnostics(this.context.diagnostics, value.position));
            if (inPort && outPort) {
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
                        : `${outPort.parentFieldAccess.split('.').pop()}[${outPort.index}]`,
                    deleteLink: () => this.deleteLink(field),
                }));
                lm.setTargetPort(outPort);
                lm.setSourcePort(inPort);
                lm.registerListener({
                    selectionChanged(event) {
                        if (event.isSelected) {
                            inPort.fireEvent({}, "link-selected");
                            outPort.fireEvent({}, "link-selected");
                        } else {
                            inPort.fireEvent({}, "link-unselected");
                            outPort.fireEvent({}, "link-unselected");
                        }
                    },
                })
                this.getModel().addAll(lm);
            }
        });
    }

    private getOutputPortForField(fields: STNode[]) {
        let nextTypeNode = this.recordFields;
        let recField: EditableRecordField;
        let portIdBuffer = MAPPING_CONSTRUCTOR_TARGET_PORT_PREFIX;
        let fieldIndex;
        for (let i = 0; i < fields.length; i++) {
            const field = fields[i];
            if (STKindChecker.isSpecificField(field)) {
                if (fieldIndex !== undefined) {
                    portIdBuffer = `${portIdBuffer}.${fieldIndex}.${field.fieldName.value}`;
                    fieldIndex = undefined;
                } else {
                    portIdBuffer = `${portIdBuffer}.${field.fieldName.value}`
                }
                const recFieldTemp = nextTypeNode.find(
                    (recF) => getBalRecFieldName(recF.type.name) === field.fieldName.value);
                if (recFieldTemp) {
                    if (i === fields.length - 1) {
                        recField = recFieldTemp;
                    } else if (recFieldTemp.type.typeName === PrimitiveBalType.Record) {
                        nextTypeNode = recFieldTemp?.childrenTypes;
                    } else if (recFieldTemp.type.typeName === PrimitiveBalType.Array) {
                        recFieldTemp.elements.forEach((element, index) => {
                            if (STKindChecker.isListConstructor(field.valueExpr)) {
                                field.valueExpr.expressions.forEach((expr) => {
                                    if (isPositionsEquals(element.elementNode.position, expr.position)) {
                                        const nextField = fields[i + 1];
                                        element.members.forEach((member) => {
                                            if (member?.value) {
                                                if ((STKindChecker.isSpecificField(member.value)
                                                        && STKindChecker.isSpecificField(nextField)
                                                        && isPositionsEquals(member.value.fieldName.position,
                                                            nextField.fieldName.position))
                                                    || (STKindChecker.isFieldAccess(member.value)
                                                        && STKindChecker.isFieldAccess(nextField)
                                                        && isPositionsEquals(member.value.position,
                                                            nextField.position)))
                                                {
                                                    nextTypeNode = element?.members;
                                                    fieldIndex = index;
                                                    return;
                                                }
                                            }
                                        });
                                    }
                                })
                            }
                        })
                    }
                }
            } else {
                portIdBuffer = fieldIndex !== undefined ? `${portIdBuffer}.${fieldIndex}` : portIdBuffer;
                recField = nextTypeNode.find(
                    (recF) => isPositionsEquals(recF?.value.position, field.position));
            }
        }
        if (recField) {
            const portId = `${portIdBuffer}.IN`;
            return this.getPort(portId) as RecordFieldPortModel;
        }
    }

    private deleteLink(field: STNode) {
        const linkDeleteVisitor = new LinkDeletingVisitor(field.position, this.value.expression);
        traversNode(this.value.expression, linkDeleteVisitor);
        const nodePositionsToDelete = linkDeleteVisitor.getPositionToDelete();

        this.context.applyModifications([{
            type: "DELETE",
            ...nodePositionsToDelete
        }]);
    }

    public updatePosition() {
        this.setPosition(1000, this.position.y)
    }
}
