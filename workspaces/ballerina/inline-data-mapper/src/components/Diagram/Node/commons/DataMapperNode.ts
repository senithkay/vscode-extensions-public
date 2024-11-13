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
import { IOType, Mapping, TypeKind } from '@wso2-enterprise/ballerina-core';

import { IDataMapperContext } from '../../../../utils/DataMapperContext/DataMapperContext';
import { MappingMetadata } from '../../Mappings/MappingMetadata';
import { InputOutputPortModel } from "../../Port";
import { findMappingByOutput } from '../../utils/common-utils';

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
		field: IOType,
		portType: "IN" | "OUT",
		parentId: string,
		unsafeParentId: string,
		portPrefix?: string,
		parent?: InputOutputPortModel,
		collapsedFields?: string[],
		hidden?: boolean,
		isOptional?: boolean
	): number {

		const fieldName = field.fieldName;

		const fieldFQN = parentId
			? `${parentId}${fieldName && isOptional
				? `?.${fieldName}`
				: `.${fieldName}`}`
			: fieldName && fieldName;
		const unsafeFieldFQN = unsafeParentId
			? `${unsafeParentId}.${fieldName}`
			: fieldName || '';

		const portName = portPrefix ? `${portPrefix}.${unsafeFieldFQN}` : unsafeFieldFQN;
		const isCollapsed = !hidden && collapsedFields && collapsedFields.includes(portName);
		const fieldPort = new InputOutputPortModel(
			field, portName, portType, undefined, fieldFQN, unsafeFieldFQN, parent, isCollapsed, hidden
		);

		this.addPort(fieldPort);

		let numberOfFields = 1;
		if (field.kind === TypeKind.Record) {
			const fields = field?.fields;

			if (fields && !!fields.length) {
				fields.forEach(subField => {
					numberOfFields += this.addPortsForInputField(
						subField, portType, fieldFQN, unsafeFieldFQN, portPrefix, fieldPort,
						collapsedFields, isCollapsed ? true : hidden, subField.optional || isOptional
					);
				});
			}
		}
		return hidden ? 0 : numberOfFields;
	}

	protected addPortsForOutputField(
		field: IOType,
		type: "IN" | "OUT",
		mappings: Mapping[],
		portPrefix?: string,
		parent?: InputOutputPortModel,
		collapsedFields?: string[],
		hidden?: boolean,
		isWithinMapFunction?: boolean
	) {
		const portName = `${portPrefix}.${field.id}`;
		const isCollapsed = !hidden && collapsedFields && collapsedFields.includes(portName);
		const mapping = findMappingByOutput(mappings, field.id);

		const fieldPort = new InputOutputPortModel(
			field, portName, type, mapping, field.id, field.id,
			parent, isCollapsed, hidden, false, false, isWithinMapFunction
		);
		this.addPort(fieldPort);

		if (field.kind === TypeKind.Record) {
			const fields = field?.fields;
			if (fields && !!fields.length) {
				fields.forEach((subField) => {
					this.addPortsForOutputField(
						subField, type, mappings, portPrefix, fieldPort, collapsedFields, isCollapsed ? true : hidden
					);
				});
			}
		} else if (field.kind === TypeKind.Array) {
			// const elements: ArrayElement[] = field?.memberType?.elements;
			// if (elements && !!elements.length) {
			// 	elements.forEach((element, index) => {
			// 		this.addPortsForOutputField(element.member, type, fieldFQN, index, portPrefix,
			// 			fieldPort, collapsedFields, isCollapsed ? true : hidden);
			// 	});
			// }
		}
	}

	protected addPortsForHeader(
		dmType: IOType,
		name: string,
		portType: "IN" | "OUT",
		portPrefix: string,
		mappings?: Mapping[],
		collapsedFields?: string[],
		isWithinMapFunction?: boolean,
	): InputOutputPortModel {

		let portName = name;

		if (portPrefix) {
			portName = name ? `${portPrefix}.${name}` : portPrefix;
		}
		const mapping = mappings && findMappingByOutput(mappings, portName);
	
		const isCollapsed = collapsedFields && collapsedFields.includes(portName);
		const headerPort = new InputOutputPortModel(
			dmType, portName, portType, mapping, name, name, undefined,
			isCollapsed, false, false, false, isWithinMapFunction
		);

		this.addPort(headerPort)

		return headerPort;
	}

	protected genMappings(val: Node, parentFields?: Node[]) {
		let foundMappings: MappingMetadata[] = [];
		const currentFields = [...(parentFields ? parentFields : [])];
		if (val) {
			// if (Node.isObjectLiteralExpression(val)) {
			// 	val.getProperties().forEach((field) => {
			// 		foundMappings = [...foundMappings, ...this.genMappings(field, [...currentFields, val])];
			// 	});
			// } else if (Node.isPropertyAssignment(val) && val.getInitializer()) {
			// 	const initializer = val.getInitializer();
			// 	const isObjectLiteralExpr = Node.isObjectLiteralExpression(initializer);
			// 	const isArrayLiteralExpr = Node.isArrayLiteralExpression(initializer);
			// 	if (isObjectLiteralExpr || isArrayLiteralExpr) {
			// 		foundMappings = [...foundMappings, ...this.genMappings(initializer, [...currentFields, val])];
			// 	} else {
			// 		foundMappings.push(this.getOtherMappings(val, currentFields));
			// 	}
			// } else if (Node.isArrayLiteralExpression(val)) {
			// 	val.getElements().forEach((expr) => {
			// 		foundMappings = [...foundMappings, ...this.genMappings(expr, [...currentFields, val])];
			// 	})
			// } else {
				foundMappings.push(this.getOtherMappings(val, currentFields));
			// }
		}
		return foundMappings;
	}

	protected getOtherMappings(node: Node, currentFields: Node[]) {
		// const valNode = Node.isPropertyAssignment(node) ? node.getInitializer() : node;
		// if (valNode) {
		// 	const inputNodes = getInputAccessNodes(valNode);
		// 	if (inputNodes.length === 1) {
		// 		return new MappingMetadata([...currentFields, node], inputNodes[0], valNode);
		// 	}
			return new MappingMetadata([...currentFields, node], undefined, undefined);
		// }
	}
}
