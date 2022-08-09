import { DiagramModel, NodeModel, NodeModelGenerics } from '@projectstorm/react-diagrams';
import { FormField } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
	AnydataTypeDesc, AnyTypeDesc, ArrayTypeDesc, BooleanTypeDesc, ByteTypeDesc, DecimalTypeDesc,
	DistinctTypeDesc, ErrorTypeDesc, FloatTypeDesc, FunctionTypeDesc, FutureTypeDesc, HandleTypeDesc,
	IntersectionTypeDesc, IntTypeDesc, JsonTypeDesc, MappingConstructor, MapTypeDesc, NeverTypeDesc, NilTypeDesc, ObjectTypeDesc,
	OptionalTypeDesc, ParenthesisedTypeDesc, QualifiedNameReference, ReadonlyTypeDesc, RecordField, RecordTypeDesc,
	SimpleNameReference, SingletonTypeDesc, SpecificField, STKindChecker, StreamTypeDesc, StringTypeDesc, TableTypeDesc,
	TupleTypeDesc, TypedescTypeDesc, UnionTypeDesc, XmlTypeDesc
} from '@wso2-enterprise/syntax-tree';

import { IDataMapperContext } from '../../../../utils/DataMapperContext/DataMapperContext';
import { FieldAccessToSpecificFied } from '../../Mappings/FieldAccessToSpecificFied';
import { DataMapperPortModel } from '../../Port';
import { FormFieldPortModel } from "../../Port/model/FormFieldPortModel";
import { STNodePortModel } from "../../Port/model/STNodePortModel";
import { RecordTypeDescriptorStore } from '../../utils/record-type-descriptor-store';

export interface DataMapperNodeModelGenerics {
	PORT: DataMapperPortModel;
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

	protected addPorts(field: RecordField,
		                  type: "IN" | "OUT", parentId: string, parentFieldAccessExpr?: string, parent?: STNodePortModel) {
		const fieldId = `${parentId}.${field.fieldName.value}`;
		const fieldAccessExpr = `${parentFieldAccessExpr}.${field.fieldName.value}`;
		if (STKindChecker.isRecordField(field)) {
			// const fieldPort = new DataMapperPortModel(field.fieldName.value, type, parentId, field, parentFieldAccessExpr, parent);
			const fieldPort = new STNodePortModel(field, type, parentId, parentFieldAccessExpr, parent);
			this.addPort(fieldPort)
			if (STKindChecker.isRecordTypeDesc(field.typeName)) {
				field.typeName.fields.forEach((subField) => {
					if (STKindChecker.isRecordField(subField)) {
						this.addPorts(subField, type, fieldId, fieldAccessExpr, fieldPort);
					}
				});
			}
			if (STKindChecker.isSimpleNameReference(field.typeName)) {
				const recordTypeDescriptors = RecordTypeDescriptorStore.getInstance();
				const typeDef = recordTypeDescriptors.gettypeDescriptor(field.typeName.name.value)
				if (!!typeDef?.typeDescriptor && STKindChecker.isRecordTypeDesc(typeDef?.typeDescriptor)){
					typeDef?.typeDescriptor?.fields.forEach((subField : any) => {
						if (STKindChecker.isRecordField(subField)) {
							this.addPorts(subField, type, fieldId, fieldAccessExpr, fieldPort);
						}
					});
				}
			}
		}
	}

	protected addPortsForSpecificField(field: SpecificField,
		                                  type: "IN" | "OUT", parentId: string, parent?: STNodePortModel) {
		const fieldId = `${parentId}.${field.fieldName.value}`;
		if (STKindChecker.isSpecificField(field)) {
			const fieldPort = new STNodePortModel(field, type, parentId, "", parent);
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

	protected addPortsForField(field: FormField, type: "IN" | "OUT", parentId: string,
							                     parentFieldAccessExpr?: string, parent?: FormFieldPortModel) {
		const fieldId = `${parentId}.${field.name}`;
		const fieldAccessExpr = `${parentFieldAccessExpr}.${field.name}`;
		const fieldPort = new FormFieldPortModel(field, type, parentId, parentFieldAccessExpr, parent);
		this.addPort(fieldPort)
		if (field.typeName === 'record') {
			field.fields.forEach((subField) => {
				this.addPortsForField(subField, type, fieldId, fieldAccessExpr, fieldPort);
			});
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
					} else if (STKindChecker.isFieldAccess(field.valueExpr)
						|| STKindChecker.isSimpleNameReference(field.valueExpr)) {
						foundMappings.push(new FieldAccessToSpecificFied([...currentFields, field], field.valueExpr));
					} else if (STKindChecker.isBinaryExpression(field.valueExpr)
						&& ((STKindChecker.isFieldAccess(field.valueExpr.rhsExpr)
						|| STKindChecker.isSimpleNameReference(field.valueExpr.rhsExpr)))) {
						// TODO handle other types of expressions here
						foundMappings.push(new FieldAccessToSpecificFied([...currentFields, field], field.valueExpr.rhsExpr, field.valueExpr));
					} else {
						// TODO handle other types of expressions here
						foundMappings.push(new FieldAccessToSpecificFied([...currentFields, field], undefined , field.valueExpr));
					}
				}
			})
		}
		return foundMappings;
	}
}
