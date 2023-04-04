/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Point } from "@projectstorm/geometry";
import { STModification } from "@wso2-enterprise/ballerina-languageclient";
import { PrimitiveBalType, Type } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    ExpressionFunctionBody,
    IdentifierToken,
    ListConstructor,
    NodePosition,
    QueryExpression,
    SelectClause,
    STKindChecker,
    STNode,
    traversNode
} from "@wso2-enterprise/syntax-tree";

import { useDMSearchStore } from "../../../../store/store";
import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { ExpressionLabelModel } from "../../Label";
import { DataMapperLinkModel } from "../../Link";
import { EditableRecordField } from "../../Mappings/EditableRecordField";
import { FieldAccessToSpecificFied } from "../../Mappings/FieldAccessToSpecificFied";
import { RecordFieldPortModel } from "../../Port";
import { LIST_CONSTRUCTOR_TARGET_PORT_PREFIX } from "../../utils/constants";
import {
    enrichAndProcessType,
    getBalRecFieldName,
    getDefaultValue,
    getExprBodyFromLetExpression,
    getExprBodyFromTypeCastExpression,
    getFilteredMappings,
    getFilteredUnionOutputTypes,
    getInnermostExpressionBody,
    getInputNodeExpr,
    getInputPortsForExpr,
    getOutputPortForField,
    getSearchFilteredOutput,
    getTypeName,
    getTypeOfValue,
    hasNoMatchFound
} from "../../utils/dm-utils";
import { filterDiagnostics } from "../../utils/ls-utils";
import { LinkDeletingVisitor } from "../../visitors/LinkDeletingVistior";
import { DataMapperNodeModel, TypeDescriptor } from "../commons/DataMapperNode";

export const LIST_CONSTRUCTOR_NODE_TYPE = "data-mapper-node-list-constructor";

export class ListConstructorNode extends DataMapperNodeModel {

    public recordField: EditableRecordField;
    public typeName: string;
    public rootName: string;
    public hasNoMatchingFields: boolean;
    public x: number;
    public y: number;

    constructor(
        public context: IDataMapperContext,
        public value: ExpressionFunctionBody | SelectClause,
        public typeIdentifier: TypeDescriptor | IdentifierToken,
        public typeDef: Type,
        public queryExpr?: QueryExpression) {
        super(
            context,
            LIST_CONSTRUCTOR_NODE_TYPE
        );
    }

    async initPorts() {
        const originalTypeDef = this.typeDef;
        this.typeDef = getSearchFilteredOutput(this.typeDef);

        if (this.typeDef) {
            const isSelectClause = STKindChecker.isSelectClause(this.value);
            this.rootName = this.typeDef?.name ? getBalRecFieldName(this.typeDef.name) : this.typeDef.typeName;
            if (isSelectClause){
                this.rootName = this.typeIdentifier.value || this.typeIdentifier.source;
            }
            if (this.typeDef.typeName === PrimitiveBalType.Union) {
                this.typeName = getTypeName(this.typeDef);
                const acceptedMembers = getFilteredUnionOutputTypes(this.typeDef);
                if (acceptedMembers.length === 1) {
                    this.typeDef = acceptedMembers[0];
                }
            }
            const [valueEnrichedType, type] = enrichAndProcessType(this.typeDef, this.getValueExpr(),
                this.context.selection.selectedST.stNode);
            this.typeDef = type;
            this.hasNoMatchingFields = hasNoMatchFound(originalTypeDef, valueEnrichedType);
            this.typeName = !this.typeName ? getTypeName(valueEnrichedType.type) : this.typeName;
            this.recordField = valueEnrichedType;
            if (this.typeDef.typeName === PrimitiveBalType.Union) {
                this.rootName = valueEnrichedType?.type?.typeName;
            }
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
        const searchValue = useDMSearchStore.getState().outputSearch;
        const mappings = this.genMappings(this.value.expression);
        const filteredMappings = getFilteredMappings(mappings, searchValue);
        this.createLinks(filteredMappings);
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
            const body = getInnermostExpressionBody(this.recordField.value);
            if (this.recordField.type.typeName === PrimitiveBalType.Array
                && this.recordField?.value
                && !STKindChecker.isListConstructor(body)
            ) {
                outPort = this.getPort(`${LIST_CONSTRUCTOR_TARGET_PORT_PREFIX}.${this.rootName}.IN`) as RecordFieldPortModel;
                mappedOutPort = outPort;
            } else {
                [outPort, mappedOutPort] = getOutputPortForField(fields,
                    this.recordField,
                    LIST_CONSTRUCTOR_TARGET_PORT_PREFIX,
                    (portId: string) =>  this.getPort(portId) as RecordFieldPortModel,
                    this.rootName);
            }
            const diagnostics = filterDiagnostics(
                this.context.diagnostics, (otherVal.position || value.position) as NodePosition);
            const lm = new DataMapperLinkModel(value, diagnostics, true);
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
                        ? field.fieldName.value as string
                        : `${outPort.fieldFQN.split('.').pop()}[${outPort.index}]`,
                    deleteLink: () => this.deleteField(field, true)
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

    async deleteField(field: STNode, keepDefaultVal?: boolean) {
        let modifications: STModification[];
        const typeOfValue = getTypeOfValue(this.recordField, field.position);
        if (keepDefaultVal && !STKindChecker.isSpecificField(field)) {
            modifications = [{
                type: "INSERT",
                config: {
                    "STATEMENT": getDefaultValue(typeOfValue?.typeName)
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

    public getValueExpr(): STNode {
        return getInnermostExpressionBody(this.queryExpr || this.value.expression);
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
