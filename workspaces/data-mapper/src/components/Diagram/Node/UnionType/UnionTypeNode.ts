/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
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
    NodePosition,
    SelectClause,
    STKindChecker,
    STNode,
} from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { ExpressionLabelModel } from "../../Label";
import { DataMapperLinkModel } from "../../Link";
import { EditableRecordField } from "../../Mappings/EditableRecordField";
import { FieldAccessToSpecificFied } from "../../Mappings/FieldAccessToSpecificFied";
import { RecordFieldPortModel } from "../../Port";
import {
    MAPPING_CONSTRUCTOR_TARGET_PORT_PREFIX,
    UNION_TYPE_TARGET_PORT_PREFIX
} from "../../utils/constants";
import {
    enrichAndProcessType,
    getBalRecFieldName,
    getExprBodyFromLetExpression,
    getInnermostExpressionBody,
    getInputNodeExpr,
    getInputPortsForExpr,
    getOutputPortForField,
    getSearchFilteredOutput,
    getTypeFromStore,
    getTypeName
} from "../../utils/dm-utils";
import { filterDiagnostics } from "../../utils/ls-utils";
import { getResolvedType, getSupportedUnionTypes } from "../../utils/union-type-utils";
import { DataMapperNodeModel, TypeDescriptor } from "../commons/DataMapperNode";

export const UNION_TYPE_NODE_TYPE = "data-mapper-node-union-type";

export class UnionTypeNode extends DataMapperNodeModel {

    public recordField: EditableRecordField;
    public typeName: string;
    public rootName: string;
    public resolvedType: Type;
    public hasInvalidTypeCast: boolean;
    public mappings: FieldAccessToSpecificFied[];
    public x: number;
    public y: number;

    constructor(
        public context: IDataMapperContext,
        public value: ExpressionFunctionBody | SelectClause,
        public typeIdentifier: TypeDescriptor | IdentifierToken,
        public typeDef: Type
    ) {
        super(
            context,
            UNION_TYPE_NODE_TYPE
        );
    }

    async initPorts() {
        this.rootName = this.typeDef?.name && getBalRecFieldName(this.typeDef.name);
        this.typeName = getTypeName(this.typeDef);
        this.resolveType();
        const renderResolvedTypes = !this.shouldRenderUnionType();
        if (this.resolvedType && renderResolvedTypes) {
            this.typeDef = getSearchFilteredOutput(this.resolvedType);
            if (this.typeDef) {
                const [valueEnrichedType, type] = enrichAndProcessType(this.typeDef, this.getValueExpr(),
                    this.context.selection.selectedST.stNode);
                this.typeDef = type;
                this.rootName = this.typeDef?.name && getBalRecFieldName(this.typeDef.name);
                const parentPort = this.addPortsForHeaderField(this.typeDef, this.rootName, "IN",
                    MAPPING_CONSTRUCTOR_TARGET_PORT_PREFIX, this.context.collapsedFields, false, valueEnrichedType);
                if (valueEnrichedType.type.typeName === PrimitiveBalType.Record) {
                    this.recordField = valueEnrichedType;
                    if (this.recordField.childrenTypes.length) {
                        this.recordField.childrenTypes.forEach((field) => {
                            this.addPortsForOutputRecordField(field, "IN", this.rootName, undefined,
                                MAPPING_CONSTRUCTOR_TARGET_PORT_PREFIX, parentPort,
                                this.context.collapsedFields, parentPort.collapsed);
                        });
                    }
                } else if (valueEnrichedType.type.typeName === PrimitiveBalType.Array
                    && STKindChecker.isSelectClause(this.value)
                ) {
                    // valueEnrichedType only contains a single element as it is being used within the select clause in the query expression
                    this.recordField = valueEnrichedType.elements[0].member;
                    if (this.recordField.childrenTypes.length) {
                        this.recordField.childrenTypes.forEach((field) => {
                            this.addPortsForOutputRecordField(field, "IN", this.rootName, undefined,
                                MAPPING_CONSTRUCTOR_TARGET_PORT_PREFIX, parentPort,
                                this.context.collapsedFields, parentPort.collapsed, true);
                        });
                    }
                }
            }
        } else {
            this.addPortsForHeaderField(this.typeDef, this.rootName, "IN", UNION_TYPE_TARGET_PORT_PREFIX);
        }
    }

    initLinks(): void {
        this.mappings = this.genMappings(this.value.expression);
        this.createLinks(this.mappings);
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
            if (this.shouldRenderUnionType()) {
                outPort = this.getPort(`${UNION_TYPE_TARGET_PORT_PREFIX}.IN`) as RecordFieldPortModel;
                mappedOutPort = outPort;
            } else {
                [outPort, mappedOutPort] = getOutputPortForField(fields,
                    this.recordField,
                    MAPPING_CONSTRUCTOR_TARGET_PORT_PREFIX,
                    (portId: string) =>  this.getPort(portId) as RecordFieldPortModel);
            }
            const diagnostics = filterDiagnostics(
                this.context.diagnostics, (otherVal.position || value.position) as NodePosition);
            const lm = new DataMapperLinkModel(value, diagnostics, true);
            if (inPort && mappedOutPort) {
                const mappedField = mappedOutPort.editableRecordField && mappedOutPort.editableRecordField.type;
                const keepDefault = ((mappedField && !mappedField?.name
                        && mappedField.typeName !== PrimitiveBalType.Array
                        && mappedField.typeName !== PrimitiveBalType.Record)
                    || !STKindChecker.isMappingConstructor(this.value.expression)
                );
                lm.addLabel(new ExpressionLabelModel({
                    value: otherVal?.source || value.source,
                    valueNode: otherVal || value,
                    context: this.context,
                    link: lm,
                    field: STKindChecker.isSpecificField(field)
                        ? field.valueExpr
                        : field,
                    editorLabel: STKindChecker.isSpecificField(field)
                        ? field.fieldName.value as string
                        : `${outPort.fieldFQN.split('.').pop()}[${outPort.index}]`,
                    deleteLink: () => this.deleteField(field, keepDefault),
                }));
                lm.setTargetPort(mappedOutPort);
                lm.setSourcePort(inPort);
                inPort.addLinkedPort(mappedOutPort);
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

    private resolveType() {
        const bodyExpr = STKindChecker.isLetExpression(this.value.expression)
            ? getExprBodyFromLetExpression(this.value.expression)
            : this.value.expression;
        const supportedTypes = getSupportedUnionTypes(this.typeIdentifier, this.typeDef);
        if (STKindChecker.isTypeCastExpression(bodyExpr)) {
            // when the expr is wrapped with a type cast
            const type = bodyExpr.typeCastParam?.type;
            this.resolvedType = this.typeDef.members.find((member) => {
                return getResolvedType(member, type);
            });
            this.hasInvalidTypeCast = !this.resolvedType;
        } else if (supportedTypes.length === 1) {
            // when the specified union type is narrowed down to a single type
            this.resolvedType = this.typeDef.members.find(member => {
                const typeName = getTypeName(member);
                return typeName === supportedTypes[0];
            });
        } else {
            // when the type is derivable from the expr
            const typeFromStore = getTypeFromStore(this.getValueExpr().position as NodePosition);
            const typeName = getTypeName(typeFromStore);
            this.resolvedType = !!typeFromStore
                && typeFromStore.typeName !== '$CompilationError$'
                && supportedTypes.includes(typeName)
                && typeFromStore;
        }
    }

    public shouldRenderUnionType() {
        return !this.resolvedType
            || !STKindChecker.isMappingConstructor(this.getValueExpr()) && this.resolvedType.typeName === PrimitiveBalType.Record
            || !STKindChecker.isListConstructor(this.getValueExpr()) && this.resolvedType.typeName === PrimitiveBalType.Array;
    }

    public getValueExpr(): STNode {
        return getInnermostExpressionBody(this.value.expression);
    }

    public getTypeCastExpr(): STNode {
        let valueExpr: STNode = this.value.expression;
        if (STKindChecker.isLetExpression(valueExpr)) {
            valueExpr = getExprBodyFromLetExpression(valueExpr);
        }
        return STKindChecker.isTypeCastExpression(valueExpr) ? valueExpr : undefined;
    }

    async deleteField(field: STNode, keepDefault?: boolean) {
        // TODO: Handle delete
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
