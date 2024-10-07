/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Point } from "@projectstorm/geometry";
import { IDMType, TypeKind } from "@wso2-enterprise/ballerina-core";

import { useDMCollapsedFieldsStore, useDMSearchStore } from "../../../../store/store";
import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { DMTypeWithValue } from "../../Mappings/DMTypeWithValue";
import { MappingMetadata } from "../../Mappings/MappingMetadata";
import { DataMapperNodeModel } from "../commons/DataMapperNode";
import { getSearchFilteredOutput, hasNoOutputMatchFound } from "../../utils/search-utils";
import { enrichAndProcessType } from "../../utils/type-utils";
import { OBJECT_OUTPUT_TARGET_PORT_PREFIX } from "../../utils/constants";
import { InputOutputPortModel } from "../../Port";
import { DataMapperLinkModel } from "../../Link";
import { ExpressionLabelModel } from "../../Label";
import { getPosition, traversNode } from "../../utils/st-utils";

export const OBJECT_OUTPUT_NODE_TYPE = "data-mapper-node-object-output";
const NODE_ID = "object-output-node";

export class ObjectOutputNode extends DataMapperNodeModel {
    public dmType: IDMType;
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
        public value: any | undefined,
        public originalType: IDMType,
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

            // const isMapFnAtPropAsmt = isMapFnAtPropAssignment(focusedST);
            const isMapFnAtPropAsmt = false;
            // const isMapFnAtRootRtn = views.length > 1 && isMapFnAtRootReturn(functionST, focusedST);
            const isMapFnAtRootRtn = views.length > 1 && false;
            this.isMapFn = isMapFnAtPropAsmt || isMapFnAtRootRtn;

            const collapsedFields = useDMCollapsedFieldsStore.getState().collapsedFields;
            const [valueEnrichedType, type] = enrichAndProcessType(this.dmType, this.value);
            this.dmType = type;
            // this.typeName = getTypeName(valueEnrichedType.type);
            this.typeName = "TYPE_NAME";

            this.hasNoMatchingFields = hasNoOutputMatchFound(this.originalType, valueEnrichedType);
    
            const parentPort = this.addPortsForHeader(
                this.dmType, this.rootName, "IN", OBJECT_OUTPUT_TARGET_PORT_PREFIX,
                collapsedFields, valueEnrichedType, this.isMapFn
            );
    
            if (valueEnrichedType.type.kind === TypeKind.Record) {
                this.dmTypeWithValue = valueEnrichedType;

                if (this.dmTypeWithValue.childrenTypes.length) {
                    this.dmTypeWithValue.childrenTypes.forEach(field => {
                        this.addPortsForOutputField(
                            field, "IN", this.rootName, undefined, OBJECT_OUTPUT_TARGET_PORT_PREFIX,
                            parentPort, collapsedFields, parentPort.collapsed, this.isMapFn
                        );
                    });
                }

                if (this.isSubMapping && focusedView.subMappingInfo.focusedOnSubMappingRoot) {
                    this.addOutputFieldAdderPort(
                        this.rootName, parentPort, collapsedFields, parentPort.collapsed, this.isMapFn
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
        // this.mappings = getFilteredMappings(mappings, searchValue);
        this.createLinks(this.mappings);
    }

    private createLinks(mappings: MappingMetadata[]) {
        mappings.forEach((mapping) => {
            const { fields, value, otherVal } = mapping;
            const field = fields[fields.length - 1];
    
            if (!value || !value.getText()) {
                // Unsupported mapping
                return;
            }

            // const inputNode = findInputNode(value, this);
            // let inPort: InputOutputPortModel;

            // if (inputNode) {
            //     inPort = getInputPort(inputNode, value);
            // }
            // const [outPort, mappedOutPort] = getOutputPort(
            //     fields, this.dmTypeWithValue, OBJECT_OUTPUT_TARGET_PORT_PREFIX,
            //     (portId: string) =>  this.getPort(portId) as InputOutputPortModel
            // );

            // if (inPort && mappedOutPort) {
            //     const diagnostics = getDiagnostics(otherVal || value);
            //     const lm = new DataMapperLinkModel(value, diagnostics, true, undefined);
            //     const mappedField = mappedOutPort.typeWithValue && mappedOutPort.typeWithValue.type;
            //     const keepDefault = ((
            //             mappedField
            //             && !mappedField?.fieldName
            //             && mappedField.kind !== TypeKind.Array
            //             && mappedField.kind !== TypeKind.Record
            //         ) || !Node.isObjectLiteralExpression(this.value)
            //         || Node.isVariableStatement(this.context.focusedST)
            //     );

            //     lm.setTargetPort(mappedOutPort);
            //     lm.setSourcePort(inPort);
            //     inPort.addLinkedPort(mappedOutPort);

            //     lm.addLabel(
            //         new ExpressionLabelModel({
            //             value: otherVal?.getText(),
            //             valueNode: otherVal || value,
            //             context: this.context,
            //             link: lm,
            //             field: Node.isPropertyAssignment(field)
            //                 ? field.getInitializer()
            //                 : field,
            //             editorLabel: Node.isPropertyAssignment(field)
            //                 ? field.getName()
            //                 : outPort.fieldFQN && `${outPort.fieldFQN.split('.').pop()}[${outPort.index}]`,
            //             deleteLink: () => this.deleteField(field, keepDefault),
            //         }
            //     ));

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
            //     });

            //     this.getModel().addAll(lm);
            // }
        });
    }

    async deleteField(field: Node, keepDefaultVal?: boolean) {
        // const typeOfValue = getTypeOfValue(this.dmTypeWithValue, getPosition(field));
        // const defaultValue = getDefaultValue(typeOfValue.kind);

        // if (keepDefaultVal && !Node.isPropertyAssignment(field)) {
        //     field.replaceWithText(defaultValue);
        // } else {
        //     const linkDeleteVisitor = new LinkDeletingVisitor(field, this.value);
        //     traversNode(this.value, linkDeleteVisitor);
        //     const targetNodes = linkDeleteVisitor.getNodesToDelete();

        //     targetNodes.forEach(node => {
        //         const parentNode = node.getParent();

        //         if (Node.isPropertyAssignment(node)) {
        //             if (Node.isVariableStatement(this.context.focusedST)) {
        //                 node.getInitializer().replaceWithText(defaultValue);
        //             } else {
        //                 node.remove();
        //             }
        //         } else if (parentNode && Node.isArrayLiteralExpression(parentNode)) {
        //             const elementIndex = parentNode.getElements().find(e => e === node);
        //             parentNode.removeElement(elementIndex);
        //         } else {
        //             node.replaceWithText('');
        //         }
        //     });
        // }

        // await this.context.applyModifications(field.getSourceFile().getFullText());
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
