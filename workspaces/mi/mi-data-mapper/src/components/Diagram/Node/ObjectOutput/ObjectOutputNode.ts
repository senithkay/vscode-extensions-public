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
import { Expression, Node } from "ts-morph";

import { useDMCollapsedFieldsStore, useDMSearchStore } from "../../../../store/store";
import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { DMTypeWithValue } from "../../Mappings/DMTypeWithValue";
import { MappingMetadata } from "../../Mappings/MappingMetadata";
import { DataMapperNodeModel } from "../commons/DataMapperNode";
import { getFilteredMappings, getSearchFilteredOutput, hasNoOutputMatchFound } from "../../utils/search-utils";
import { enrichAndProcessType } from "../../utils/type-utils";
import { OBJECT_OUTPUT_TARGET_PORT_PREFIX } from "../../utils/constants";
import {
    findInputNode,
    getDefaultValue,
    getInputPort,
    getOutputPort,
    getTypeName,
    getTypeOfValue,
    isMapFnAtPropAssignment,
    isMapFnAtRootReturn
} from "../../utils/common-utils";
import { InputOutputPortModel } from "../../Port";
import { DataMapperLinkModel } from "../../Link";
import { ExpressionLabelModel } from "../../Label";
import { filterDiagnosticsForNode } from "../../utils/diagnostics-utils";
import { getPosition, traversNode } from "../../utils/st-utils";
import { LinkDeletingVisitor } from "../../../../components/Visitors/LinkDeletingVistior";

export const OBJECT_OUTPUT_NODE_TYPE = "data-mapper-node-object-output";
const NODE_ID = "object-output-node";

export class ObjectOutputNode extends DataMapperNodeModel {
    public dmType: DMType;
    public dmTypeWithValue: DMTypeWithValue;
    public typeName: string;
    public rootName: string;
    public mappings: MappingMetadata[];
    public hasNoMatchingFields: boolean;
    public x: number;
    public y: number;
    public isMapFn: boolean;

    constructor(
        public context: IDataMapperContext,
        public value: Expression | undefined,
        public originalType: DMType,
        public isSubMapping: boolean = false
    ) {
        super(
            NODE_ID,
            context,
            OBJECT_OUTPUT_NODE_TYPE
        ); 
    }

    async initPorts() {
        this.dmType = getSearchFilteredOutput(this.originalType);

        if (this.dmType) {
            this.rootName = this.dmType?.fieldName;
            const { focusedST, functionST, views } = this.context;
            const focusedView = views[views.length - 1];

            const isMapFnAtPropAsmt = isMapFnAtPropAssignment(focusedST);
            const isMapFnAtRootRtn = views.length > 1 && isMapFnAtRootReturn(functionST, focusedST);
            this.isMapFn = isMapFnAtPropAsmt || isMapFnAtRootRtn;

            const isCollapsedField = useDMCollapsedFieldsStore.getState().isCollapsedField;
            const [valueEnrichedType, type] = enrichAndProcessType(this.dmType, this.value, this.context.recursiveTypes);
            this.dmType = type;
            this.typeName = getTypeName(valueEnrichedType.type);

            this.hasNoMatchingFields = hasNoOutputMatchFound(this.originalType, valueEnrichedType);
    
            const parentPort = this.addPortsForHeader(
                this.dmType, this.rootName, "IN", OBJECT_OUTPUT_TARGET_PORT_PREFIX,
                isCollapsedField, valueEnrichedType, this.isMapFn
            );
    
            if (valueEnrichedType.type.kind === TypeKind.Interface || valueEnrichedType.type.kind === TypeKind.Union) {
                this.dmTypeWithValue = valueEnrichedType;

                if (this.dmTypeWithValue.childrenTypes?.length) {
                    this.dmTypeWithValue.childrenTypes.forEach(field => {
                        this.addPortsForOutputField(
                            field, "IN", this.rootName, undefined, OBJECT_OUTPUT_TARGET_PORT_PREFIX,
                            parentPort, isCollapsedField, parentPort.collapsed, this.isMapFn
                        );
                    });
                }

                if (this.isSubMapping && focusedView.subMappingInfo.focusedOnSubMappingRoot) {
                    this.addOutputFieldAdderPort(
                        this.rootName, parentPort, isCollapsedField, parentPort.collapsed, this.isMapFn
                    );
                }
            }
        }
    }

    initLinks(): void {
        if (!this.value) {
            return;
        }
        const searchValue = useDMSearchStore.getState().outputSearch;
        const mappings = this.genMappings(this.value);
        this.mappings = getFilteredMappings(mappings, searchValue);
        this.createLinks(this.mappings);
    }

    private createLinks(mappings: MappingMetadata[]) {
        mappings.forEach((mapping) => {
            const { fields, value, otherVal } = mapping;
            const field = fields[fields.length - 1];
    
            if (!value || !value.getText() || (otherVal && (Node.isCallExpression(otherVal) || Node.isBinaryExpression(otherVal)))) {
                // Unsupported mapping
                return;
            }

            const inputNode = findInputNode(value, this);
            let inPort: InputOutputPortModel;

            if (inputNode) {
                inPort = getInputPort(inputNode, value);
            }
            const [outPort, mappedOutPort] = getOutputPort(
                fields, this.dmTypeWithValue, OBJECT_OUTPUT_TARGET_PORT_PREFIX,
                (portId: string) =>  this.getPort(portId) as InputOutputPortModel
            );

            if (inPort && mappedOutPort) {
                const diagnostics = filterDiagnosticsForNode(this.context.diagnostics, otherVal || value);
                const lm = new DataMapperLinkModel(value, diagnostics, true, undefined);
                const mappedField = mappedOutPort.typeWithValue && mappedOutPort.typeWithValue.type;
                const keepDefault = ((
                        mappedField
                        && !mappedField?.fieldName
                        && mappedField.kind !== TypeKind.Array
                        && mappedField.kind !== TypeKind.Interface
                    ) || !Node.isObjectLiteralExpression(this.value)
                );

                lm.setTargetPort(mappedOutPort);
                lm.setSourcePort(inPort);
                inPort.addLinkedPort(mappedOutPort);

                lm.addLabel(
                    new ExpressionLabelModel({
                        value: otherVal?.getText(),
                        valueNode: otherVal || value,
                        context: this.context,
                        link: lm,
                        field: Node.isPropertyAssignment(field)
                            ? field.getInitializer()
                            : field,
                        editorLabel: Node.isPropertyAssignment(field)
                            ? field.getName()
                            : outPort.fieldFQN && `${outPort.fieldFQN.split('.').pop()}[${outPort.index}]`,
                        deleteLink: () => this.deleteField(field, keepDefault),
                    }
                ));

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

    async deleteField(field: Node, keepDefaultVal?: boolean) {
        const typeOfValue = getTypeOfValue(this.dmTypeWithValue, getPosition(field));
        const defaultValue = getDefaultValue(typeOfValue);

        if (keepDefaultVal && !Node.isPropertyAssignment(field)) {
            field.replaceWithText(defaultValue);
        } else {
            const linkDeleteVisitor = new LinkDeletingVisitor(field, this.value);
            traversNode(this.value, linkDeleteVisitor);
            const targetNodes = linkDeleteVisitor.getNodesToDelete();

            targetNodes.forEach(node => {
                const parentNode = node.getParent();

                if (Node.isPropertyAssignment(node)) {
                    node.remove();
                } else if (parentNode && Node.isArrayLiteralExpression(parentNode)) {
                    const elementIndex = parentNode.getElements().find(e => e === node);
                    parentNode.removeElement(elementIndex);
                } else {
                    node.replaceWithText('');
                }
            });
        }

        await this.context.applyModifications(field.getSourceFile().getFullText());
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
