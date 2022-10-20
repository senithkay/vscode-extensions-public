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
import { getBalRecFieldName, getFieldAccessNodes, getFieldName } from "../../utils/dm-utils";

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
										                             hidden? : boolean) : number {
		const fieldName = field?.name ? getBalRecFieldName(field.name) : '';
		const fieldFQN = parentId ? `${parentId}${fieldName && `.${fieldName}`}` : fieldName && fieldName;
		const portName = portPrefix ? `${portPrefix}.${fieldFQN}` : fieldFQN;
		const isCollapsed = !hidden && collapsedFields && collapsedFields.includes(portName);
		const fieldPort = new RecordFieldPortModel(
			field, portName, type, parentId, undefined, undefined, fieldFQN,
			parent, isCollapsed, hidden);
		this.addPort(fieldPort)
		let numberOfFields = 1;
		if (field.typeName === PrimitiveBalType.Record) {
			const fields = field?.fields;
			if (fields && !!fields.length) {
				fields.forEach((subField) => {
					numberOfFields += this.addPortsForInputRecordField(subField, type, fieldFQN, portPrefix,
												fieldPort, collapsedFields, isCollapsed ? true : hidden);
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

		if (field.type.typeName === PrimitiveBalType.Record) {
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

	protected addPortsForHeaderField(field: Type, fieldValue: string,
									                         type: "IN" | "OUT",
									                         collapsedFields?: string[],
									                         isWithinSelectClause?: boolean) : RecordFieldPortModel {
		const fieldName = getBalRecFieldName(fieldValue);
		const isCollapsed = collapsedFields && collapsedFields.includes(fieldName);
		const fieldPort = new RecordFieldPortModel(
			field, fieldName, type, undefined, undefined, undefined, fieldName, undefined,
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
					if (STKindChecker.isSpecificField(field) && field.valueExpr) {
						if (STKindChecker.isMappingConstructor(field.valueExpr)) {
							foundMappings = [...foundMappings, ...this.genMappings(field.valueExpr, [...currentFields, field])];
						} else if (STKindChecker.isListConstructor(field.valueExpr)) {
							field.valueExpr.expressions.forEach((expr) => {
								if (!STKindChecker.isCommaToken(expr)) {
									foundMappings = [...foundMappings, ...this.genMappings(expr, [...currentFields, field])];
								}
							})
						} else if (STKindChecker.isFieldAccess(field.valueExpr)
							|| STKindChecker.isSimpleNameReference(field.valueExpr)) {
							foundMappings.push(new FieldAccessToSpecificFied([...currentFields, field], field.valueExpr));
						} else {
							foundMappings.push(this.getOtherMappings(field, currentFields));
						}
					}
				})
			} else if (STKindChecker.isFieldAccess(val) || STKindChecker.isSimpleNameReference(val)) {
				foundMappings.push(new FieldAccessToSpecificFied([...currentFields, val], val));
			} else if (STKindChecker.isListConstructor(val)) {
				val.expressions.forEach((expr) => {
					if (!STKindChecker.isCommaToken(expr)) {
						foundMappings = [...foundMappings, ...this.genMappings(expr, [...currentFields, val])];
					}
				})
			} else {
				foundMappings.push(this.getOtherMappings(val, currentFields));
			}
		}
		return foundMappings;
	}

	protected getOtherMappings(node: STNode, currentFields: STNode[]) {
		const valNode = STKindChecker.isSpecificField(node) ? node.valueExpr : node;
		const fieldAccessNodes = getFieldAccessNodes(valNode);
		if (fieldAccessNodes.length === 1) {
			return new FieldAccessToSpecificFied([...currentFields, node], fieldAccessNodes[0], valNode);
		}
		return new FieldAccessToSpecificFied([...currentFields, node], undefined , valNode);
	}
}
