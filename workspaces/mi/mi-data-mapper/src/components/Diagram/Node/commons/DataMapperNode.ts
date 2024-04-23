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
import { DMType, TypeKind } from '@wso2-enterprise/mi-core';
import { Node } from 'ts-morph';

import { IDataMapperContext } from '../../../../utils/DataMapperContext/DataMapperContext';
import { ArrayElement, DMTypeWithValue } from "../../Mappings/DMTypeWithValue";
import { MappingMetadata } from '../../Mappings/FieldAccessToSpecificFied';
import { InputOutputPortModel } from "../../Port";
import { getPropertyAccessNodes } from '../../utils/common-utils';

export interface DataMapperNodeModelGenerics {
	PORT: InputOutputPortModel;
}

export abstract class DataMapperNodeModel extends NodeModel<NodeModelGenerics & DataMapperNodeModelGenerics> {

	private diagramModel: DiagramModel;

	constructor(
		public id: string,
		public context: IDataMapperContext,
		type: string
	) {
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
		parent?: InputOutputPortModel,
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
		const fieldPort = new InputOutputPortModel(
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

	protected addPortsForOutputField(
		field: DMTypeWithValue,
		type: "IN" | "OUT",
		parentId: string,
		elementIndex?: number,
		portPrefix?: string,
		parent?: InputOutputPortModel,
		collapsedFields?: string[],
		hidden?: boolean
	) {

		const fieldName = field.type?.fieldName || field.type.kind;
		if (elementIndex !== undefined) {
			parentId = parentId ? `${parentId}.${elementIndex}` : elementIndex.toString();
		}
		const fieldFQN = parentId ? `${parentId}${fieldName && `.${fieldName}`}` : fieldName && fieldName;
		const portName = portPrefix ? `${portPrefix}.${fieldFQN}` : fieldFQN;
		const isCollapsed = !hidden && collapsedFields && collapsedFields.includes(portName);
		const fieldPort = new InputOutputPortModel(
			field.type, portName, type, parentId, elementIndex, field,
			fieldFQN, parent, isCollapsed, hidden);
		this.addPort(fieldPort);

		if (field.type.kind === TypeKind.Interface) {
			const fields = field?.childrenTypes;
			if (fields && !!fields.length) {
				fields.forEach((subField) => {
					this.addPortsForOutputField(subField, type, fieldFQN, undefined, portPrefix,
						fieldPort, collapsedFields, isCollapsed ? true : hidden);
				});
			}
		} else if (field.type.kind === TypeKind.Array) {
			const elements: ArrayElement[] = field?.elements;
			if (elements && !!elements.length) {
				elements.forEach((element, index) => {
					this.addPortsForOutputField(element.member, type, fieldFQN, index, portPrefix,
						fieldPort, collapsedFields, isCollapsed ? true : hidden);
				});
			}
		}
	}

	protected addPortsForHeader(
		dmType: DMType,
		name: string,
		portType: "IN" | "OUT",
		portPrefix: string,
		collapsedFields?: string[],
		field?: DMTypeWithValue
	): InputOutputPortModel {

		let portName = name;
		if (portPrefix) {
			portName = name ? `${portPrefix}.${name}` : portPrefix;
		}
		const isCollapsed = collapsedFields && collapsedFields.includes(portName);
		const headerPort = new InputOutputPortModel(
			dmType, portName, portType, undefined, undefined,
			field, name, undefined, isCollapsed, false,
		);

		this.addPort(headerPort)

		return headerPort;
	}

	protected genMappings(val: Node, parentFields?: Node[]) {
		let foundMappings: MappingMetadata[] = [];
		const currentFields = [...(parentFields ? parentFields : [])];
		if (val) {
			if (Node.isObjectLiteralExpression(val)) {
				val.getProperties().forEach((field) => {
					foundMappings = [...foundMappings, ...this.genMappings(field, [...currentFields, val])];
				});
			} else if (Node.isPropertyAssignment(val) && val.getInitializer()) {
				const initializer = val.getInitializer();
				const isObjectLiteralExpr = Node.isObjectLiteralExpression(initializer);
				const isArrayLiteralExpr = Node.isArrayLiteralExpression(initializer);
				if (isObjectLiteralExpr || isArrayLiteralExpr) {
					foundMappings = [...foundMappings, ...this.genMappings(initializer, [...currentFields, val])];
				} else {
					foundMappings.push(this.getOtherMappings(val, currentFields));
				}
			} else if (Node.isArrayLiteralExpression(val)) {
				val.getElements().forEach((expr) => {
					foundMappings = [...foundMappings, ...this.genMappings(expr, [...currentFields, val])];
				})
			} else {
				foundMappings.push(this.getOtherMappings(val, currentFields));
			}
		}
		return foundMappings;
	}

	protected getOtherMappings(node: Node, currentFields: Node[]) {
		const valNode = Node.isPropertyAssignment(node) ? node.getInitializer() : node;
		if (valNode) {
			const inputNodes = getPropertyAccessNodes(valNode);
			if (inputNodes.length === 1) {
				return new MappingMetadata([...currentFields, node], inputNodes[0], valNode);
			}
			return new MappingMetadata([...currentFields, node], undefined, valNode);
		}
	}
}
