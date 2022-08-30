import { DiagramModel, NodeModel, NodeModelGenerics } from '@projectstorm/react-diagrams';
import { Type } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
	AnydataTypeDesc, AnyTypeDesc, ArrayTypeDesc, BooleanTypeDesc, ByteTypeDesc, DecimalTypeDesc,
	DistinctTypeDesc, ErrorTypeDesc, FloatTypeDesc, FunctionTypeDesc, FutureTypeDesc, HandleTypeDesc,
	IntersectionTypeDesc, IntTypeDesc, JsonTypeDesc, MappingConstructor, MapTypeDesc, NeverTypeDesc, NilTypeDesc, ObjectTypeDesc,
	OptionalTypeDesc, ParenthesisedTypeDesc, QualifiedNameReference, ReadonlyTypeDesc, RecordTypeDesc,
	SimpleNameReference, SingletonTypeDesc, SpecificField, STKindChecker, StreamTypeDesc, StringTypeDesc, TableTypeDesc, traversNode,
	TupleTypeDesc, TypedescTypeDesc, UnionTypeDesc, XmlTypeDesc
} from '@wso2-enterprise/syntax-tree';

import { IDataMapperContext } from '../../../../utils/DataMapperContext/DataMapperContext';
import { FieldAccessToSpecificFied } from '../../Mappings/FieldAccessToSpecificFied';
import { ArrayElement, TypeWithValue } from "../../Mappings/TypeWithValue";
import { RecordFieldPortModel, SpecificFieldPortModel } from "../../Port";
import { getBalRecFieldName, INPUT_RECORD_FIELD_INDEX } from "../../utils/dm-utils";
import { FieldAccessFindingVisitor } from '../../visitors/FieldAccessFindingVisitor';

export interface DataMapperNodeModelGenerics {
	PORT: SpecificFieldPortModel | RecordFieldPortModel;
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

	protected addPortsForSpecificField(field: SpecificField, type: "IN" | "OUT", parentId: string,
									                           parent?: SpecificFieldPortModel) {
		const fieldId = `${parentId}.${field.fieldName.value}`;
		if (STKindChecker.isSpecificField(field)) {
			const fieldPort = new SpecificFieldPortModel(field, type, parentId, "", parent);
			this.addPort(fieldPort)
			if (STKindChecker.isMappingConstructor(field.valueExpr)) {
				field.valueExpr.fields.forEach((subField) => {
					if (STKindChecker.isSpecificField(subField)) {
						this.addPortsForSpecificField(subField, type, fieldId, fieldPort);
					}
				});
			}
		}
	}

	protected addPortsForInputRecordField(field: Type, type: "IN" | "OUT", parentId: string,
										                             parentFieldAccessExpr?: string,
										                             parent?: RecordFieldPortModel) {
		const fieldName = getBalRecFieldName(field.name);
		const fieldId = `${parentId}.${fieldName}`;
		const fieldAccessExpr = `${parentFieldAccessExpr}.${fieldName}`;
		const fieldPort = new RecordFieldPortModel(
			field, type, parentId, INPUT_RECORD_FIELD_INDEX, parentFieldAccessExpr, parent);
		this.addPort(fieldPort)

		if (field.typeName === 'record') {
			const fields = field?.fields;
			if (fields && !!fields.length) {
				fields.forEach((subField) => {
					this.addPortsForInputRecordField(subField, type, fieldId, fieldAccessExpr, fieldPort);
				});
			}
		}
	}

	protected addPortsForOutputRecordField(field: TypeWithValue, type: "IN" | "OUT", parentId: string,
										                              fieldIndex?: number,
										                              parentFieldAccessExpr?: string,
										                              parent?: RecordFieldPortModel) {
		const fieldName = getBalRecFieldName(field.type.name);
		const fieldId = `${parentId}.${fieldName}`;
		const fieldAccessExpr = `${parentFieldAccessExpr}.${fieldName}`;
		const fIndex = fieldIndex || 0;
		const fieldPort = new RecordFieldPortModel(field.type, type, parentId, fIndex, parentFieldAccessExpr, parent);
		this.addPort(fieldPort);

		if (field.type.typeName === 'record') {
			const fields = field?.childrenTypes;
			if (fields && !!fields.length) {
				fields.forEach((subField) => {
					this.addPortsForOutputRecordField(subField, type, fieldId, fieldIndex, fieldAccessExpr, fieldPort);
				});
			}
		} else if (field.type.typeName === 'array' && field.type.memberType.typeName === 'record') {
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

	protected genMappings(val: MappingConstructor, parentFields?: SpecificField[]) {
		let foundMappings: FieldAccessToSpecificFied[] = [];
		const currentFields = [...(parentFields ? parentFields : [])];
		if (val) {
			val.fields.forEach((field) => {
				if (STKindChecker.isSpecificField(field)) {
					if (STKindChecker.isMappingConstructor(field.valueExpr)) {
						foundMappings = [...foundMappings, ...this.genMappings(field.valueExpr, [...currentFields, field])];
					} else if (STKindChecker.isListConstructor(field.valueExpr)) {
						field.valueExpr.expressions.forEach((expr) => {
							if (STKindChecker.isMappingConstructor(expr)) {
								foundMappings = [...foundMappings, ...this.genMappings(expr, [...currentFields, field])];
							}
						})
					} else if (STKindChecker.isFieldAccess(field.valueExpr)
						|| STKindChecker.isSimpleNameReference(field.valueExpr)) {
						foundMappings.push(new FieldAccessToSpecificFied([...currentFields, field], field.valueExpr));
					} else {
						const fieldAccessFindingVisitor : FieldAccessFindingVisitor = new FieldAccessFindingVisitor();
						traversNode(field.valueExpr, fieldAccessFindingVisitor);
						const fieldAccesseNodes = fieldAccessFindingVisitor.getFieldAccesseNodes();
						if (fieldAccesseNodes.length === 1){
							foundMappings.push(new FieldAccessToSpecificFied([...currentFields, field], fieldAccesseNodes[1], field.valueExpr));
						}
						else {
							foundMappings.push(new FieldAccessToSpecificFied([...currentFields, field], undefined , field.valueExpr));
						}
					}
				}
			})
		}
		return foundMappings;
	}
}
