/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Point } from "@projectstorm/geometry";
import { DMType, TypeKind } from "@wso2-enterprise/mi-core";
import { ObjectLiteralExpression, Node } from "typescript";

import { useDMSearchStore } from "../../../../store/store";
import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { EditableRecordField } from "../../Mappings/EditableRecordField";
import { FieldAccessToSpecificFied } from "../../Mappings/FieldAccessToSpecificFied";
import { MAPPING_CONSTRUCTOR_TARGET_PORT_PREFIX } from "../../utils/constants";
import { DataMapperNodeModel } from "../commons/DataMapperNode";
import { getSearchFilteredOutput, hasNoOutputMatchFound } from "../../utils/search-utils";
import { enrichAndProcessType } from "../../utils/type-utils";

export const MAPPING_CONSTRUCTOR_NODE_TYPE = "data-mapper-node-mapping-constructor";
const NODE_ID = "mapping-constructor-node";

export class MappingConstructorNode extends DataMapperNodeModel {
    public dmType: DMType;
    public recordField: EditableRecordField;
    public typeName: string;
    public rootName: string;
    public mappings: FieldAccessToSpecificFied[];
    public hasNoMatchingFields: boolean;
    public x: number;
    public y: number;

    constructor(
        public context: IDataMapperContext,
        public value: ObjectLiteralExpression
    ) {
        super(
            NODE_ID,
            context,
            MAPPING_CONSTRUCTOR_NODE_TYPE
        ); 
        this.dmType = this.context.outputTree;
    }

    async initPorts() {
        this.dmType = getSearchFilteredOutput(this.dmType);

        if (this.dmType) {
            this.rootName = this.dmType?.fieldName;

            const [valueEnrichedType, type] = enrichAndProcessType(this.dmType, this.value);
            this.dmType = type;
            this.hasNoMatchingFields = hasNoOutputMatchFound(this.dmType, valueEnrichedType);
            this.typeName = valueEnrichedType.type.typeName;
            const parentPort = this.addPortsForHeader(this.dmType, this.rootName, "IN",
                MAPPING_CONSTRUCTOR_TARGET_PORT_PREFIX, [], undefined, valueEnrichedType);
    
            if (valueEnrichedType.type.kind === TypeKind.Interface) {
                this.recordField = valueEnrichedType;
                if (this.recordField.childrenTypes.length) {
                    this.recordField.childrenTypes.forEach((field) => {
                        this.addPortsForOutputRecordField(field, "IN", this.rootName, undefined,
                            MAPPING_CONSTRUCTOR_TARGET_PORT_PREFIX, parentPort,
                            [], parentPort.collapsed);
                    });
                }
            }
        }
    }

    initLinks(): void {
        const searchValue = useDMSearchStore.getState().outputSearch;
        // const mappings = this.genMappings(this.value.properties);
        // this.mappings = getFilteredMappings(mappings, searchValue);
        // this.createLinks(this.mappings);
    }

    private createLinks(mappings: FieldAccessToSpecificFied[]) {
        mappings.forEach((mapping) => {
            const { fields, value, otherVal } = mapping;
            const field = fields[fields.length - 1];
            if (!value || !value.source) {
                // Unsupported mapping
                return;
            }
            // const inputNode = getInputNodeExpr(value, this);
            // let inPort: RecordFieldPortModel;
            // if (inputNode) {
            //     inPort = getInputPortsForExpr(inputNode, value);
            // }
            // const [outPort, mappedOutPort] = getOutputPortForField(fields,
            //     this.recordField,
            //     MAPPING_CONSTRUCTOR_TARGET_PORT_PREFIX,
            //     (portId: string) =>  this.getPort(portId) as RecordFieldPortModel);
            // if (inPort && mappedOutPort) {
            //     const diagnostics = filterDiagnostics(this.context.diagnostics,
            //         getDiagnosticsPosition(mappedOutPort.editableRecordField, mapping));
            //     const lm = new DataMapperLinkModel(value, diagnostics, true);
            //     const mappedField = mappedOutPort.editableRecordField && mappedOutPort.editableRecordField.type;
            //     const keepDefault = ((mappedField && !mappedField?.name
            //         && mappedField.typeName !== TypeKind.Array
            //         && mappedField.typeName !== TypeKind.Record)
            //         || !STKindChecker.isMappingConstructor(this.value.expression)
            //     );
            //     lm.addLabel(new ExpressionLabelModel({
            //         value: otherVal?.source || value.source,
            //         valueNode: otherVal || value,
            //         context: this.context,
            //         link: lm,
            //         field: STKindChecker.isSpecificField(field)
            //             ? field.valueExpr
            //             : field,
            //         editorLabel: STKindChecker.isSpecificField(field)
            //             ? field.fieldName.value as string
            //             : `${outPort.fieldFQN.split('.').pop()}[${outPort.index}]`,
            //         deleteLink: () => this.deleteField(field, keepDefault),
            //     }));
            //     lm.setTargetPort(mappedOutPort);
            //     lm.setSourcePort(inPort);
            //     inPort.addLinkedPort(mappedOutPort);
            //     lm.registerListener({
            //         selectionChanged(event) {
            //             if (event.isSelected) {
            //                 inPort.fireEvent({}, "link-selected");
            //                 mappedOutPort.fireEvent({}, "link-selected");
            //             } else {
            //                 inPort.fireEvent({}, "link-unselected");
            //                 mappedOutPort.fireEvent({}, "link-unselected");
            //             }
            //         },
            //     })
            //     this.getModel().addAll(lm);
            // }
        });
    }

    async deleteField(field: Node, keepDefaultVal?: boolean) {
        // let modifications: STModification[];
        // const typeOfValue = getTypeOfValue(this.recordField, field.position);
        // if (keepDefaultVal && !STKindChecker.isSpecificField(field)) {
        //     modifications = [{
        //         type: "INSERT",
        //         config: {
        //             "STATEMENT": getDefaultValue(typeOfValue?.typeName)
        //         },
        //         ...field.position
        //     }];
        // } else if (STKindChecker.isSelectClause(this.value) && STKindChecker.isSpecificField(field)) {
        //     // if Within query expression expanded view
        //     modifications = [{
        //         type: "DELETE",
        //         ...field.valueExpr?.position
        //     }];
        // } else {
        //     const linkDeleteVisitor = new LinkDeletingVisitor(field.position as NodePosition, this.value.expression);
        //     traversNode(this.value.expression, linkDeleteVisitor);
        //     const nodePositionsToDelete = linkDeleteVisitor.getPositionToDelete();
        //     modifications = [{
        //         type: "DELETE",
        //         ...nodePositionsToDelete
        //     }];
        // }

        // this.context.applyModifications(modifications);
        // await this.context.applyModifications(modifications);
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
            super.setPosition(x, y);
        }
    }
}
