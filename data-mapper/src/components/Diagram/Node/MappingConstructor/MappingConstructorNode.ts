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
import { PrimitiveBalType, Type } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    ExpressionFunctionBody,
    IdentifierToken,
    MappingConstructor,
    NodePosition,
    SelectClause,
    STKindChecker,
    STNode,
    traversNode
} from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { isPositionsEquals } from "../../../../utils/st-utils";
import { ExpressionLabelModel } from "../../Label";
import { DataMapperLinkModel } from "../../Link";
import { ArrayElement, EditableRecordField } from "../../Mappings/EditableRecordField";
import { FieldAccessToSpecificFied } from "../../Mappings/FieldAccessToSpecificFied";
import { RecordFieldPortModel } from "../../Port";
import {
    getBalRecFieldName,
    getEnrichedRecordType,
    getInputNodeExpr,
    getInputPortsForExpr,
    getTypeName
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
    public typeName: string;
    public x: number;
    public y: number;

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
            const parentPort = this.addPortsForHeaderField(this.typeDef, MAPPING_CONSTRUCTOR_TARGET_PORT_PREFIX, "IN", this.context.collapsedFields);

            const valueEnrichedType = getEnrichedRecordType(this.typeDef, this.value.expression);
            this.typeName = getTypeName(valueEnrichedType.type);
            if (valueEnrichedType.type.typeName === PrimitiveBalType.Record) {
                this.recordFields = valueEnrichedType.childrenTypes;
                if (!!this.recordFields.length) {
                    this.recordFields.forEach((field) => {
                        this.addPortsForOutputRecordField(field, "IN", MAPPING_CONSTRUCTOR_TARGET_PORT_PREFIX,
                            undefined, MAPPING_CONSTRUCTOR_TARGET_PORT_PREFIX, parentPort, this.context.collapsedFields, parentPort.collapsed);
                    });
                }
            } else if (valueEnrichedType.type.typeName === PrimitiveBalType.Array && STKindChecker.isSelectClause(this.value)) {
                // valueEnrichedType only contains a single element as it is being used within the select clause
                this.recordFields = valueEnrichedType.elements[0].members;
                if (!!this.recordFields.length) {
                    this.recordFields.forEach((field) => {
                        this.addPortsForOutputRecordField(field, "IN", MAPPING_CONSTRUCTOR_TARGET_PORT_PREFIX,
                            undefined, MAPPING_CONSTRUCTOR_TARGET_PORT_PREFIX, parentPort, this.context.collapsedFields, parentPort.collapsed);
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
                    deleteLink: () => this.deleteField(field),
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
        let nextTypeChildNodes: EditableRecordField[] = this.recordFields; // Represents fields of a record
        let nextTypeMemberNodes: ArrayElement[]; // Represents elements of an array
        let recField: EditableRecordField;
        let portIdBuffer = MAPPING_CONSTRUCTOR_TARGET_PORT_PREFIX;
        for (let i = 0; i < fields.length; i++) {
            const field = fields[i];
            if (STKindChecker.isSpecificField(field)) {
                if (nextTypeChildNodes) {
                    portIdBuffer = `${portIdBuffer}.${field.fieldName.value}`
                    const recFieldTemp = nextTypeChildNodes.find(
                        (recF) => getBalRecFieldName(recF.type.name) === field.fieldName.value);
                    if (recFieldTemp) {
                        if (i === fields.length - 1) {
                            recField = recFieldTemp;
                        } else {
                            [nextTypeChildNodes, nextTypeMemberNodes] = this.getNextNodes(recFieldTemp);
                        }
                    }
                } else if (nextTypeMemberNodes) {
                    const [nextField, fieldIndex] = this.getNextField(nextTypeMemberNodes, field.position);
                    if (nextField && fieldIndex !== -1) {
                        portIdBuffer = `${portIdBuffer}.${fieldIndex}.${field.fieldName.value}`;
                        if (i === fields.length - 1) {
                            recField = nextField;
                        } else {
                            [nextTypeChildNodes, nextTypeMemberNodes] = this.getNextNodes(nextField);
                        }
                    }
                }
            } else if (STKindChecker.isListConstructor(field) && nextTypeMemberNodes) {
                const [nextField, fieldIndex] = this.getNextField(nextTypeMemberNodes, field.position);
                if (nextField && fieldIndex !== -1) {
                    portIdBuffer = `${portIdBuffer}.${fieldIndex}`;
                    [nextTypeChildNodes, nextTypeMemberNodes] = this.getNextNodes(nextField);
                }
            } else {
                if (nextTypeChildNodes) {
                    const fieldIndex = nextTypeChildNodes.findIndex(
                        (recF) => recF?.value && isPositionsEquals(field.position, recF.value.position));
                    if (fieldIndex !== -1) {
                        portIdBuffer = `${portIdBuffer}.${fieldIndex}`;
                        recField = nextTypeChildNodes[fieldIndex];
                    }
                } else if (nextTypeMemberNodes) {
                    const [nextField, fieldIndex] = this.getNextField(nextTypeMemberNodes, field.position);
                    if (nextField && fieldIndex !== -1) {
                        portIdBuffer = `${portIdBuffer}.${fieldIndex}`;
                        recField = nextField;
                    }
                }
            }
        }
        if (recField) {
            const portId = `${portIdBuffer}.IN`;
            let port = (this.getPort(portId) as RecordFieldPortModel);
            while (port && port.hidden) {
                port = port.parentModel;
            }
            return port;
        }
    }

    private getNextField(nextTypeMemberNodes: ArrayElement[],
        nextFieldPosition: NodePosition): [EditableRecordField, number] {
        let memberIndex = -1;
        const fieldIndex = nextTypeMemberNodes.findIndex((node) => {
            for (let i = 0; i < node.members.length; i++) {
                const member = node.members[i];
                if (member?.value && isPositionsEquals(nextFieldPosition, member.value.position)) {
                    memberIndex = i;
                    return true;
                }
            }
        });
        if (fieldIndex !== -1 && memberIndex !== -1) {
            return [nextTypeMemberNodes[fieldIndex].members[memberIndex], fieldIndex];
        }
        return [undefined, fieldIndex];
    }

    private getNextNodes(nextField: EditableRecordField): [EditableRecordField[], ArrayElement[]] {
        if (nextField.type.typeName === PrimitiveBalType.Record) {
            return [nextField?.childrenTypes, undefined];
        } else if (nextField.type.typeName === PrimitiveBalType.Array) {
            return [undefined, nextField?.elements];
        }
    }

    deleteField(field: STNode) {
        if (STKindChecker.isSelectClause(this.value) && STKindChecker.isSpecificField(field)) {
            // if Within query expression expanded view
            this.context.applyModifications([{
                type: "DELETE",
                ...field.valueExpr?.position
            }]);
        } else {
            const linkDeleteVisitor = new LinkDeletingVisitor(field.position, this.value.expression);
            traversNode(this.value.expression, linkDeleteVisitor);
            const nodePositionsToDelete = linkDeleteVisitor.getPositionToDelete();

            this.context.applyModifications([{
                type: "DELETE",
                ...nodePositionsToDelete
            }]);
        }
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
