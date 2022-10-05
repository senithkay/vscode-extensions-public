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
import { MAPPING_CONSTRUCTOR_TARGET_PORT_PREFIX } from "../../utils/constants";
import {
    getEnrichedRecordType,
    getInputNodeExpr,
    getInputPortsForExpr,
    getOutputPortForField,
    getTypeName
} from "../../utils/dm-utils";
import { filterDiagnostics } from "../../utils/ls-utils";
import { RecordTypeDescriptorStore } from "../../utils/record-type-descriptor-store";
import { LinkDeletingVisitor } from "../../visitors/LinkDeletingVistior";
import { DataMapperNodeModel, TypeDescriptor } from "../commons/DataMapperNode";

export const MAPPING_CONSTRUCTOR_NODE_TYPE = "data-mapper-node-mapping-constructor";

export class MappingConstructorNode extends DataMapperNodeModel {

    public typeDef: Type;
    public recordField: EditableRecordField;
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
            const parentPort = this.addPortsForHeaderField(this.typeDef, MAPPING_CONSTRUCTOR_TARGET_PORT_PREFIX,
                "IN", this.context.collapsedFields, STKindChecker.isSelectClause(this.value));

            const valueEnrichedType = getEnrichedRecordType(this.typeDef, this.value.expression);
            this.typeName = getTypeName(valueEnrichedType.type);
            if (valueEnrichedType.type.typeName === PrimitiveBalType.Record) {
                this.recordField = valueEnrichedType;
                if (!!this.recordField.childrenTypes.length) {
                    this.recordField.childrenTypes.forEach((field) => {
                        this.addPortsForOutputRecordField(field, "IN", '', undefined,
                            MAPPING_CONSTRUCTOR_TARGET_PORT_PREFIX, parentPort,
                            this.context.collapsedFields, parentPort.collapsed);
                    });
                }
            } else if (valueEnrichedType.type.typeName === PrimitiveBalType.Array
                && STKindChecker.isSelectClause(this.value)
            ) {
                // valueEnrichedType only contains a single element as it is being used within the select clause in the query expression
                this.recordField = valueEnrichedType.elements[0].member;
                if (!!this.recordField.childrenTypes.length) {
                    this.recordField.childrenTypes.forEach((field) => {
                        this.addPortsForOutputRecordField(field, "IN", '', undefined,
                            MAPPING_CONSTRUCTOR_TARGET_PORT_PREFIX, parentPort,
                            this.context.collapsedFields, parentPort.collapsed, true);
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
            const [outPort, mappedOutPort] = getOutputPortForField(fields, this);
            const lm = new DataMapperLinkModel(value, filterDiagnostics(this.context.diagnostics, value.position));
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
