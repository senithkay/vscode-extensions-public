import { DiagramModel, NodeModel, NodeModelGenerics } from '@projectstorm/react-diagrams';
import {
	AnydataTypeDesc, AnyTypeDesc, ArrayTypeDesc, BooleanTypeDesc, ByteTypeDesc, DecimalTypeDesc,
	DistinctTypeDesc, ErrorTypeDesc, FloatTypeDesc, FunctionTypeDesc, FutureTypeDesc, HandleTypeDesc,
	IntersectionTypeDesc, IntTypeDesc, JsonTypeDesc, MapTypeDesc, NeverTypeDesc, NilTypeDesc, ObjectTypeDesc,
	OptionalTypeDesc, ParenthesisedTypeDesc, QualifiedNameReference, ReadonlyTypeDesc, RecordField, RecordFieldWithDefaultValue, RecordTypeDesc,
	SimpleNameReference, SingletonTypeDesc, STKindChecker, STNode, StreamTypeDesc, StringTypeDesc, TableTypeDesc,
	TupleTypeDesc, TypeDefinition, TypedescTypeDesc, TypeReference, UnionTypeDesc, XmlTypeDesc
} from '@wso2-enterprise/syntax-tree';
import { IDataMapperContext } from '../../../../utils/DataMapperContext/DataMapperContext';

import { DataMapperPortModel } from '../../Port/model/DataMapperPortModel';

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

	constructor(public context: IDataMapperContext,
		type: string = 'datamapper-node') {
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

	protected addPorts(typeNode: RecordField | RecordTypeDesc | RecordFieldWithDefaultValue | TypeReference,
		type: "IN" | "OUT", parent?: DataMapperPortModel) {
		if (STKindChecker.isRecordTypeDesc(typeNode)) {
			const recPort = new DataMapperPortModel(typeNode, type, parent);
			this.addPort(recPort);
			typeNode.fields.forEach((field) => {
				this.addPorts(field, type, recPort);
			});
		} else if (STKindChecker.isRecordField(typeNode)) {
			const fieldPort = new DataMapperPortModel(typeNode, type, parent);
			this.addPort(fieldPort)
			if (STKindChecker.isRecordTypeDesc(typeNode.typeName)) {
				this.addPorts(typeNode.typeName, type, fieldPort);
			}
		}
	}
}
