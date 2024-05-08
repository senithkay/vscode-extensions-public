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
import { Node, ReturnStatement } from "ts-morph";

import { useDMCollapsedFieldsStore, useDMSearchStore } from "../../../../store/store";
import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { ExpressionLabelModel } from "../../Label";
import { DataMapperLinkModel } from "../../Link";
import { DMTypeWithValue } from "../../Mappings/DMTypeWithValue";
import { MappingMetadata } from "../../Mappings/MappingMetadata";
import { InputOutputPortModel } from "../../Port";
import { PRIMITIVE_OUTPUT_TARGET_PORT_PREFIX } from "../../utils/constants";
import { findInputNode, getDefaultValue, getInputPort, getOutputPort, getTypeName, isArrayOrInterface, isMapFunction } from "../../utils/common-utils";
import { getEnrichedDMType } from "../../utils/type-utils";
import { DataMapperNodeModel } from "../commons/DataMapperNode";
import { getFilteredMappings } from "../../utils/search-utils";
import { getDiagnostics } from "../../utils/diagnostics-utils";

export const PRIMITIVE_OUTPUT_NODE_TYPE = "data-mapper-node-primitive-output";
const NODE_ID = "primitive-output-node";

export class PrimitiveOutputNode extends DataMapperNodeModel {

    public dmType: DMType;
    public dmTypeWithValue: DMTypeWithValue;
    public typeName: string;
    public hasNoMatchingFields: boolean;
    public x: number;
    public y: number;
    public isMapFn: boolean;

    constructor(
        public context: IDataMapperContext,
        public value: ReturnStatement | undefined,
        public originalType: DMType
    ) {
        super(
            NODE_ID,
            context,
            PRIMITIVE_OUTPUT_NODE_TYPE
        );
        this.dmType = this.originalType;
    }

    async initPorts() {
        if (this.dmType) {
            const collapsedFields = useDMCollapsedFieldsStore.getState().collapsedFields;
            const valueEnrichedType = getEnrichedDMType(this.dmType, this.value && this.value.getExpression());
            const searchValue = useDMSearchStore.getState().outputSearch;
            this.isMapFn = Node.isCallExpression(this.value) && isMapFunction(this.value);

            this.typeName = getTypeName(valueEnrichedType.type);
            this.dmTypeWithValue = valueEnrichedType;
            this.hasNoMatchingFields = searchValue && !this.value.getExpression().getText().includes(searchValue);
            
            if (valueEnrichedType.type.kind === TypeKind.Array && this.isMapFn) {
                this.dmTypeWithValue = valueEnrichedType.elements[0].member;
            }
            const parentPort = this.addPortsForHeader(
                this.dmType, '', "IN", PRIMITIVE_OUTPUT_TARGET_PORT_PREFIX,
                collapsedFields, this.dmTypeWithValue, this.isMapFn
            );
            this.addPortsForOutputField(
                this.dmTypeWithValue, "IN", this.dmTypeWithValue.type.typeName, undefined,
                PRIMITIVE_OUTPUT_TARGET_PORT_PREFIX, parentPort, collapsedFields, parentPort.collapsed, this.isMapFn
            );
        }
    }

    initLinks(): void {
        if (!this.value) {
            return;
        }
        const searchValue = useDMSearchStore.getState().outputSearch;
        const mappings = this.genMappings(this.value.getExpression());
        const filteredMappings = getFilteredMappings(mappings, searchValue);
        this.createLinks(filteredMappings);
    }

    private createLinks(mappings: MappingMetadata[]) {
        mappings.forEach((mapping) => {
            let outPort: InputOutputPortModel;
            let mappedOutPort: InputOutputPortModel;
            let inPort: InputOutputPortModel;

            const { fields, value, otherVal } = mapping;
            const field = fields[fields.length - 1];

            if (!value || !value.getText() || (otherVal && Node.isCallExpression(otherVal))) {
                // Unsupported mapping
                return;
            }

            const inputNode = findInputNode(value, this);

            if (inputNode) {
                inPort = getInputPort(inputNode, value);
            }

            if (!isArrayOrInterface(this.dmTypeWithValue.type)) {
                outPort = this.getPort(`${PRIMITIVE_OUTPUT_TARGET_PORT_PREFIX}.${
                    this.dmTypeWithValue.type.typeName}.IN`) as InputOutputPortModel;
                mappedOutPort = outPort;
            } else {
                [outPort, mappedOutPort] = getOutputPort(
                    fields, this.dmTypeWithValue, PRIMITIVE_OUTPUT_TARGET_PORT_PREFIX,
                    (portId: string) =>  this.getPort(portId) as InputOutputPortModel
                );
            }
            if (inPort && mappedOutPort) {
                const diagnostics = getDiagnostics(otherVal || value);
                const lm = new DataMapperLinkModel(value, diagnostics, true);

                lm.setTargetPort(mappedOutPort);
                lm.setSourcePort(inPort);
                inPort.addLinkedPort(mappedOutPort);

                lm.addLabel(new ExpressionLabelModel({
                    value:  otherVal?.getText(),
                    valueNode: otherVal || value,
                    context: this.context,
                    link: lm,
                    field: Node.isPropertyAssignment(field) ? field.getInitializer() : field,
                    editorLabel: Node.isPropertyAssignment(field)
                        ? field.getName()
                        : `${outPort.fieldFQN.split('.').pop()}${outPort.index ? `[${outPort.index}]`: ''}`,
                    deleteLink: () => this.deleteField(field),
                }));

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
                });

                this.getModel().addAll(lm);
            }
        });
    }

    async deleteField(field: Node) {
        const typeOfValue = this.isLocked && this.dmType?.memberType ? this.dmType.memberType : this.dmType;
        const defaultValue = getDefaultValue(typeOfValue?.kind);
        field.replaceWithText(defaultValue);
        this.context.applyModifications();
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
