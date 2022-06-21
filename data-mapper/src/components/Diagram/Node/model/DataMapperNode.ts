import { NodeModel, NodeModelGenerics } from '@projectstorm/react-diagrams';
import {
	AnydataTypeDesc, AnyTypeDesc, ArrayTypeDesc, BooleanTypeDesc, ByteTypeDesc, DecimalTypeDesc,
	DistinctTypeDesc, ErrorTypeDesc, FloatTypeDesc, FunctionTypeDesc, FutureTypeDesc, HandleTypeDesc,
	IntersectionTypeDesc, IntTypeDesc, JsonTypeDesc, MapTypeDesc, NeverTypeDesc, NilTypeDesc, ObjectTypeDesc,
	OptionalTypeDesc, ParenthesisedTypeDesc, QualifiedNameReference, ReadonlyTypeDesc, RecordTypeDesc,
	SimpleNameReference, SingletonTypeDesc, STKindChecker, StreamTypeDesc, StringTypeDesc, TableTypeDesc,
	TupleTypeDesc, TypeDefinition, TypedescTypeDesc, UnionTypeDesc, XmlTypeDesc
} from '@wso2-enterprise/syntax-tree';

import { DataMapperPortModel } from '../../Port/model/DataMapperPortModel';

export interface DiamondNodeModelGenerics {
	PORT: DataMapperPortModel;
}

export type TypeDescriptor = AnyTypeDesc | AnydataTypeDesc | ArrayTypeDesc | BooleanTypeDesc | ByteTypeDesc | DecimalTypeDesc
	| DistinctTypeDesc | ErrorTypeDesc | FloatTypeDesc | FunctionTypeDesc | FutureTypeDesc | HandleTypeDesc | IntTypeDesc
	| IntersectionTypeDesc | JsonTypeDesc | MapTypeDesc | NeverTypeDesc | NilTypeDesc | ObjectTypeDesc | OptionalTypeDesc
	| ParenthesisedTypeDesc | QualifiedNameReference | ReadonlyTypeDesc | RecordTypeDesc | SimpleNameReference
	| SingletonTypeDesc | StreamTypeDesc | StringTypeDesc | TableTypeDesc | TupleTypeDesc | TypedescTypeDesc | UnionTypeDesc
	| XmlTypeDesc;


export class DataMapperNodeModel extends NodeModel<NodeModelGenerics & DiamondNodeModelGenerics> {
	public readonly typeDef: TypeDefinition;
	public readonly supportOutput: boolean;
	public readonly supportInput: boolean
	public readonly name: string;
 
	constructor(name: string, typeDef: TypeDefinition, supportOutput: boolean, supportInput: boolean) {
		super({
			type: 'datamapper'
		});
		this.name = name;
		this.typeDef = typeDef;
		this.supportInput = supportInput;
		this.supportOutput = supportOutput;
		this.addPorts(this.typeDef.typeDescriptor, this.name);
	}

	private addPorts(typeDesc: TypeDescriptor, parentId: string = "") {
		if (STKindChecker.isRecordTypeDesc(typeDesc)) {
			typeDesc.fields.forEach((field) => {
				if (STKindChecker.isRecordField(field)) {
					if (STKindChecker.isRecordTypeDesc(field.typeName)) {
						this.addPorts(field.typeName, field.fieldName.value);
					} else {
						if (this.supportInput) {
							this.addPort(new DataMapperPortModel(parentId + "." + field.fieldName.value +".in","IN"));
						}
						if (this.supportOutput) {
							this.addPort(new DataMapperPortModel(parentId + "." + field.fieldName.value +".out","OUT"));
						}
					} {
						// TODO handle other simple types
					}
				} else {
					// TODO handle field with default val and included records
				}
			})
		} else if (STKindChecker.isStringTypeDesc(typeDesc)) {
			if (this.supportInput) {
				this.addPort(new DataMapperPortModel(parentId + ".in","IN"));
			}
			if (this.supportOutput) {
				this.addPort(new DataMapperPortModel(parentId + ".out","OUT"));
			}
		} else {
			// TODO handle other simple types
		}
	}
}
