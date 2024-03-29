/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: no-empty-interface
import { DiagramModel, NodeModel, NodeModelGenerics } from '@projectstorm/react-diagrams';
import {
	AnydataTypeDesc,
	AnyTypeDesc,
	ArrayTypeDesc,
	BooleanTypeDesc,
	ByteTypeDesc,
	DecimalTypeDesc,
	DistinctTypeDesc,
	ErrorTypeDesc,
	FieldAccess,
	FloatTypeDesc,
	FunctionTypeDesc,
	FutureTypeDesc,
	HandleTypeDesc,
	OptionalFieldAccess,
	SimpleNameReference,
	STKindChecker,
	STNode,
} from '@wso2-enterprise/syntax-tree';

import { IDataMapperContext } from '../../../../utils/DataMapperContext/DataMapperContext';
import { ArrayElement, EditableRecordField } from "../../Mappings/EditableRecordField";
import { FieldAccessToSpecificFied } from '../../Mappings/FieldAccessToSpecificFied';
import { RecordFieldPortModel } from "../../Port";
import { DMType, TypeKind } from '@wso2-enterprise/mi-core';

export interface DataMapperNodeModelGenerics {
	PORT: RecordFieldPortModel;
}

export type TypeDescriptor = AnyTypeDesc | AnydataTypeDesc | ArrayTypeDesc | BooleanTypeDesc | ByteTypeDesc | DecimalTypeDesc
	| DistinctTypeDesc | ErrorTypeDesc | FloatTypeDesc | FunctionTypeDesc | FutureTypeDesc | HandleTypeDesc;

export abstract class DataMapperNodeModel extends NodeModel<NodeModelGenerics & DataMapperNodeModelGenerics> {

	private diagramModel: DiagramModel;

	constructor(
		public context: IDataMapperContext,
		type: string) {
		super({
			type
		});
	}

	public setModel(model: DiagramModel) {
		this.diagramModel = model;
	}

	public getModel() {
		return this.diagramModel;
	}

	// extend this class to add link init, port init logics
	abstract initPorts(): void;
	abstract initLinks(): void;

	protected addPortsForInputField(
		dmType: DMType,
		portType: "IN" | "OUT",
		parentId: string,
		portPrefix?: string,
		parent?: RecordFieldPortModel,
		collapsedFields?: string[],
		hidden?: boolean,
		isOptional?: boolean
	): number {

		const fieldName = dmType.fieldName;
		const fieldFQN = parentId
			? `${parentId}${fieldName && isOptional
				? `?.${fieldName}`
				: `.${fieldName}`}`
			: fieldName && fieldName;
		const portName = portPrefix ? `${portPrefix}.${fieldFQN}` : fieldFQN;
		const isCollapsed = !hidden && collapsedFields && collapsedFields.includes(portName);
		const fieldPort = new RecordFieldPortModel(
			dmType, portName, portType, parentId, undefined,
			undefined, fieldFQN, parent, isCollapsed, hidden
		);

		this.addPort(fieldPort);

		let numberOfFields = 1;
		if (dmType.kind === TypeKind.Interface) {
			const fields = dmType?.fields;

			if (fields && !!fields.length) {
				fields.forEach(subField => {
					numberOfFields += this.addPortsForInputField(
						subField, portType, fieldFQN, portPrefix, fieldPort,
						collapsedFields, isCollapsed ? true : hidden, isOptional
					);
				});
			}
		}
		return hidden ? 0 : numberOfFields;
	}

	protected addPortsForOutputRecordField(field: EditableRecordField, type: "IN" | "OUT",
		                                      parentId: string, elementIndex?: number,
		                                      portPrefix?: string,
		                                      parent?: RecordFieldPortModel,
		                                      collapsedFields?: string[],
		                                      hidden?: boolean,
		                                      isWithinSelectClause?: boolean
	) {
		// const fieldName = getFieldName(field);
		const fieldName = "";
		if (elementIndex !== undefined) {
			parentId = parentId ? `${parentId}.${elementIndex}` : elementIndex.toString();
		}
		const fieldFQN = parentId ? `${parentId}${fieldName && `.${fieldName}`}` : fieldName && fieldName;
		const portName = portPrefix ? `${portPrefix}.${fieldFQN}` : fieldFQN;
		const isCollapsed = !hidden && collapsedFields && collapsedFields.includes(portName);
		const fieldPort = new RecordFieldPortModel(
			field.type, portName, type, parentId, elementIndex, field,
			fieldFQN, parent, isCollapsed, hidden, isWithinSelectClause);
		this.addPort(fieldPort);

		if (field.type.kind === TypeKind.Interface) {
			const fields = field?.childrenTypes;
			if (fields && !!fields.length) {
				fields.forEach((subField) => {
					this.addPortsForOutputRecordField(subField, type, fieldFQN, undefined, portPrefix,
						fieldPort, collapsedFields, isCollapsed ? true : hidden);
				});
			}
		} else if (field.type.typeName === TypeKind.Array) {
			const elements: ArrayElement[] = field?.elements;
			if (elements && !!elements.length) {
				elements.forEach((element, index) => {
					this.addPortsForOutputRecordField(element.member, type, fieldFQN, index, portPrefix,
						fieldPort, collapsedFields, isCollapsed ? true : hidden);
				});
			}
		}
	}

	protected addPortsForHeader(
		dmType: DMType, name: string,
		portType: "IN" | "OUT",
		portPrefix: string,
		collapsedFields?: string[],
		isWithinSelectClause?: boolean,
		editableRecordField?: EditableRecordField
	): RecordFieldPortModel {

		let portName = name;
		if (portPrefix) {
			portName = name ? `${portPrefix}.${name}` : portPrefix;
		}
		const isCollapsed = collapsedFields && collapsedFields.includes(portName);
		const headerPort = new RecordFieldPortModel(
			dmType, portName, portType, undefined, undefined, editableRecordField,
			name, undefined, isCollapsed, false, isWithinSelectClause
		);

		this.addPort(headerPort)

		return headerPort;
	}

	protected genMappings(val: STNode, parentFields?: STNode[]) {
		let foundMappings: FieldAccessToSpecificFied[] = [];
		const currentFields = [...(parentFields ? parentFields : [])];
		if (val) {
			if (STKindChecker.isMappingConstructor(val)) {
				val.fields.forEach((field) => {
					if (!STKindChecker.isCommaToken(field)) {
						foundMappings = [...foundMappings, ...this.genMappings(field, [...currentFields, val])];
					}
				});
			} else if (STKindChecker.isSpecificField(val) && val.valueExpr) {
				// const expr = getInnermostExpressionBody(val.valueExpr);
				const expr:STNode = null;
				const isMappingConstructor = STKindChecker.isMappingConstructor(expr);
				const isListConstructor = STKindChecker.isListConstructor(expr);
				if (isMappingConstructor || isListConstructor) {
					foundMappings = [...foundMappings, ...this.genMappings(expr, [...currentFields, val])];
				} else {
					foundMappings.push(this.getOtherMappings(val, currentFields));
				}
			} else if (STKindChecker.isListConstructor(val)) {
				val.expressions.forEach((expr) => {
					if (!STKindChecker.isCommaToken(expr)) {
						foundMappings = [...foundMappings, ...this.genMappings(expr, [...currentFields, val])];
					}
				})
			} else if (STKindChecker.isLetExpression(val) || STKindChecker.isTypeCastExpression(val)) {
				// const expr = getInnermostExpressionBody(val);
				const expr: STNode = null;
				foundMappings = [...foundMappings, ...this.genMappings(expr, [...currentFields])];
			} else {
				foundMappings.push(this.getOtherMappings(val, currentFields));
			}
		}
		return foundMappings;
	}

	protected getOtherMappings(node: STNode, currentFields: STNode[]) {
		const valNode = STKindChecker.isSpecificField(node) ? node.valueExpr : node;
		if (valNode) {
			// const inputNodes = getInputNodes(valNode);
			const inputNodes: (FieldAccess | OptionalFieldAccess | SimpleNameReference)[] = [];
			const valueExpr = STKindChecker.isCheckExpression(valNode) ? valNode.expression : valNode;
			if (inputNodes.length === 1
				&& !STKindChecker.isQueryExpression(valNode)
			) {
				return new FieldAccessToSpecificFied([...currentFields, node], inputNodes[0], valNode);
			}
			return new FieldAccessToSpecificFied([...currentFields, node], undefined, valNode);
		}
	}
}
