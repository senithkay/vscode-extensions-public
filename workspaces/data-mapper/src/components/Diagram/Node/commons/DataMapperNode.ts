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
// tslint:disable: no-empty-interface
import { DiagramModel, NodeModel, NodeModelGenerics } from '@projectstorm/react-diagrams';
import { PrimitiveBalType, Type } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
	AnydataTypeDesc,
	AnyTypeDesc,
	ArrayTypeDesc,
	BooleanTypeDesc,
	ByteTypeDesc,
	DecimalTypeDesc,
	DistinctTypeDesc,
	ErrorTypeDesc,
	FloatTypeDesc,
	FunctionTypeDesc,
	FutureTypeDesc,
	HandleTypeDesc,
	IntersectionTypeDesc,
	IntTypeDesc,
	JsonTypeDesc,
	MapTypeDesc,
	NeverTypeDesc,
	NilTypeDesc,
	ObjectTypeDesc,
	OptionalTypeDesc,
	ParenthesisedTypeDesc,
	QualifiedNameReference,
	ReadonlyTypeDesc,
	RecordTypeDesc,
	SimpleNameReference,
	SingletonTypeDesc,
	STKindChecker,
	STNode,
	StreamTypeDesc,
	StringTypeDesc,
	TableTypeDesc,
	TupleTypeDesc,
	TypedescTypeDesc,
	UnionTypeDesc,
	XmlTypeDesc
} from '@wso2-enterprise/syntax-tree';

import { IDataMapperContext } from '../../../../utils/DataMapperContext/DataMapperContext';
import { ArrayElement, EditableRecordField } from "../../Mappings/EditableRecordField";
import { FieldAccessToSpecificFied } from '../../Mappings/FieldAccessToSpecificFied';
import { RecordFieldPortModel } from "../../Port";
import {
	getBalRecFieldName,
	getExprBodyFromLetExpression,
	getFieldName,
	getInputNodes,
	getOptionalRecordField,
	isComplexExpression
} from "../../utils/dm-utils";

export interface DataMapperNodeModelGenerics {
	PORT: RecordFieldPortModel;
}

export type TypeDescriptor = AnyTypeDesc | AnydataTypeDesc | ArrayTypeDesc | BooleanTypeDesc | ByteTypeDesc | DecimalTypeDesc
	| DistinctTypeDesc | ErrorTypeDesc | FloatTypeDesc | FunctionTypeDesc | FutureTypeDesc | HandleTypeDesc | IntTypeDesc
	| IntersectionTypeDesc | JsonTypeDesc | MapTypeDesc | NeverTypeDesc | NilTypeDesc | ObjectTypeDesc | OptionalTypeDesc
	| ParenthesisedTypeDesc | QualifiedNameReference | ReadonlyTypeDesc | RecordTypeDesc | SimpleNameReference
	| SingletonTypeDesc | StreamTypeDesc | StringTypeDesc | TableTypeDesc | TupleTypeDesc | TypedescTypeDesc | UnionTypeDesc
	| XmlTypeDesc;

export interface IDataMapperNodeFactory {

}

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

	abstract initPorts(): void;
	abstract initLinks(): void;
	// extend this class to add link init, port init logics

	protected addPortsForInputRecordField(field: Type, type: "IN" | "OUT", parentId: string,
		                                     portPrefix?: string,
		                                     parent?: RecordFieldPortModel,
		                                     collapsedFields?: string[],
		                                     hidden?: boolean,
		                                     isOptional?: boolean): number {
		const fieldName = field?.name ? getBalRecFieldName(field.name) : '';
		const fieldFQN = parentId ? `${parentId}${fieldName && isOptional ? `?.${fieldName}` : `.${fieldName}`}` : fieldName && fieldName;
		const portName = portPrefix ? `${portPrefix}.${fieldFQN}` : fieldFQN;
		const isCollapsed = !hidden && collapsedFields && collapsedFields.includes(portName);
		const fieldPort = new RecordFieldPortModel(
			field, portName, type, parentId, undefined, undefined, fieldFQN,
			parent, isCollapsed, hidden);
		this.addPort(fieldPort)
		let numberOfFields = 1;
		const optionalRecordField = getOptionalRecordField(field);
		if (optionalRecordField) {
			optionalRecordField?.fields.forEach((subField) => {
				numberOfFields += this.addPortsForInputRecordField(subField, type, fieldFQN, portPrefix,
					fieldPort, collapsedFields, isCollapsed ? true : hidden, true);
			});
		} else if (field.typeName === PrimitiveBalType.Record) {
			const fields = field?.fields;
			if (fields && !!fields.length) {
				fields.forEach((subField) => {
					numberOfFields += this.addPortsForInputRecordField(subField, type, fieldFQN, portPrefix,
						fieldPort, collapsedFields, isCollapsed ? true : hidden, isOptional);
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
		const fieldName = getFieldName(field);
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

		if (field.type.typeName === PrimitiveBalType.Record || field.type.typeName === PrimitiveBalType.Union) {
			const fields = field?.childrenTypes;
			if (fields && !!fields.length) {
				fields.forEach((subField) => {
					this.addPortsForOutputRecordField(subField, type, fieldFQN, undefined, portPrefix,
						fieldPort, collapsedFields, isCollapsed ? true : hidden);
				});
			}
		} else if (field.type.typeName === PrimitiveBalType.Array) {
			const elements: ArrayElement[] = field?.elements;
			if (elements && !!elements.length) {
				elements.forEach((element, index) => {
					this.addPortsForOutputRecordField(element.member, type, fieldFQN, index, portPrefix,
						fieldPort, collapsedFields, isCollapsed ? true : hidden);
				});
			}
		}
	}

	protected addPortsForHeaderField(field: Type, name: string,
		                                type: "IN" | "OUT",
		                                portPrefix: string,
		                                collapsedFields?: string[],
		                                isWithinSelectClause?: boolean,
		                                editableRecordField?: EditableRecordField): RecordFieldPortModel {
		const fieldName = getBalRecFieldName(name);
		let portName = fieldName;
		if (portPrefix) {
			portName = fieldName ? `${portPrefix}.${fieldName}` : portPrefix;
		}
		const isCollapsed = collapsedFields && collapsedFields.includes(portName);
		const fieldPort = new RecordFieldPortModel(
			field, portName, type, undefined, undefined, editableRecordField, fieldName, undefined,
			isCollapsed, false, isWithinSelectClause);
		this.addPort(fieldPort)

		return fieldPort;
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
				const isMappingConstructor = STKindChecker.isMappingConstructor(val.valueExpr);
				const isListConstructor = STKindChecker.isListConstructor(val.valueExpr);
				if (isMappingConstructor || isListConstructor) {
					foundMappings = [...foundMappings, ...this.genMappings(val.valueExpr, [...currentFields, val])];
				} else {
					foundMappings.push(this.getOtherMappings(val, currentFields));
				}
			} else if (STKindChecker.isListConstructor(val)) {
				val.expressions.forEach((expr) => {
					if (!STKindChecker.isCommaToken(expr)) {
						foundMappings = [...foundMappings, ...this.genMappings(expr, [...currentFields, val])];
					}
				})
			} else if (STKindChecker.isLetExpression(val)) {
				const expr = getExprBodyFromLetExpression(val);
				foundMappings = [...foundMappings, ...this.genMappings(expr, [...currentFields])];
			} else {
				foundMappings.push(this.getOtherMappings(val, currentFields));
			}
		}
		return foundMappings;
	}

	protected getOtherMappings(node: STNode, currentFields: STNode[]) {
		const valNode = STKindChecker.isSpecificField(node) ? node.valueExpr : node;
		const inputNodes = getInputNodes(valNode);
		if (inputNodes.length === 1 && !isComplexExpression(valNode) && !STKindChecker.isQueryExpression(valNode)) {
			return new FieldAccessToSpecificFied([...currentFields, node], inputNodes[0], valNode);
		}
		return new FieldAccessToSpecificFied([...currentFields, node], undefined , valNode);
	}
}
