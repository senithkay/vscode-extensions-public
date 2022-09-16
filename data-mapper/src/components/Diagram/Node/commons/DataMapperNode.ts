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
import { getBalRecFieldName, getFieldAccessNodes } from "../../utils/dm-utils";

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
										                             parentFieldAccessExpr?: string,
										                             parent?: RecordFieldPortModel) : number {
		const fieldName = getBalRecFieldName(field.name);
		const fieldId = `${parentId}.${fieldName}`;
		const fieldAccessExpr = `${parentFieldAccessExpr}.${fieldName}`;
		const fieldPort = new RecordFieldPortModel(
			field, type, parentId, undefined, undefined, parentFieldAccessExpr, parent);
		this.addPort(fieldPort)
		let numberOfFields = 1;
		if (field.typeName === PrimitiveBalType.Record) {
			const fields = field?.fields;
			if (fields && !!fields.length) {
				fields.forEach((subField) => {
					numberOfFields += this.addPortsForInputRecordField(subField, type, fieldId, fieldAccessExpr, fieldPort);
				});
			}
		}
		return numberOfFields;
	}

	protected addPortsForOutputRecordField(field: EditableRecordField, type: "IN" | "OUT",
										                              parentId: string, elementIndex?: number,
										                              parentFieldAccessExpr?: string,
										                              parent?: RecordFieldPortModel) {
		const fieldName = getBalRecFieldName(field.type.name);
		parentId = elementIndex !== undefined
			? `${parentId}.${elementIndex}`
			: parentId;
		const fieldId = `${parentId}${fieldName && `.${fieldName}`}`;
		const fieldAccessExpr = `${parentFieldAccessExpr}.${fieldName}`;
		const fieldPort = new RecordFieldPortModel(
			field.type, type, parentId, elementIndex, field, parentFieldAccessExpr, parent);
		this.addPort(fieldPort);

		if (field.type.typeName === PrimitiveBalType.Record) {
			const fields = field?.childrenTypes;
			if (fields && !!fields.length) {
				fields.forEach((subField) => {
					this.addPortsForOutputRecordField(subField, type, fieldId, undefined, fieldAccessExpr, fieldPort);
				});
			}
		} else if (field.type.typeName === PrimitiveBalType.Array) {
			const elements: ArrayElement[] = field?.elements;
			if (elements && !!elements.length) {
				elements.forEach((element, index) => {
					element.members.forEach((subField) => {
						this.addPortsForOutputRecordField(subField, type, fieldId, index, fieldAccessExpr, fieldPort);
					});
				});
			}
		}
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
