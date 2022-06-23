import { NodeModel, NodeModelGenerics } from '@projectstorm/react-diagrams';
import { BalleriaLanguageClient } from '@wso2-enterprise/ballerina-languageclient';
import {
	AnydataTypeDesc, AnyTypeDesc, ArrayTypeDesc, BooleanTypeDesc, ByteTypeDesc, DecimalTypeDesc,
	DistinctTypeDesc, ErrorTypeDesc, ExpressionFunctionBody, FloatTypeDesc, FunctionTypeDesc, FutureTypeDesc, HandleTypeDesc,
	IntersectionTypeDesc, IntTypeDesc, JsonTypeDesc, MapTypeDesc, NeverTypeDesc, NilTypeDesc, ObjectTypeDesc,
	OptionalTypeDesc, ParenthesisedTypeDesc, QualifiedNameReference, ReadonlyTypeDesc, RecordField, RecordFieldWithDefaultValue, RecordTypeDesc,
	RequiredParam,
	SimpleNameReference, SingletonTypeDesc, STKindChecker, STNode, StreamTypeDesc, StringTypeDesc, TableTypeDesc,
	TupleTypeDesc, TypeDefinition, TypedescTypeDesc, TypeReference, UnionTypeDesc, XmlTypeDesc
} from '@wso2-enterprise/syntax-tree';

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


export class DataMapperNodeModel extends NodeModel<NodeModelGenerics & DataMapperNodeModelGenerics> {
	public readonly typeDef: TypeDefinition;
	public readonly supportOutput: boolean;
	public readonly supportInput: boolean
	public readonly value: ExpressionFunctionBody | RequiredParam;
	public readonly filePath: string;
	public readonly langClientPromise: Promise<BalleriaLanguageClient>;
    public readonly updateFileContent: (filePath: string, content: string) => Promise<boolean>;


	constructor(value: ExpressionFunctionBody | RequiredParam, typeDef: TypeDefinition, supportOutput: boolean, supportInput: boolean,
				filePath: string, lCP: Promise<BalleriaLanguageClient>,
				updateFileContent: (filePath: string, content: string) => Promise<boolean>) {
		super({
			type: 'datamapper'
		});
		this.value = value;
		this.typeDef = typeDef;
		this.supportInput = supportInput;
		this.supportOutput = supportOutput;
		this.filePath = filePath;
		this.langClientPromise = lCP;
		this.updateFileContent = updateFileContent;
		this.addPorts();
	}

	private addPorts() {

		if (this.supportInput) {
			this.addPortOv(this.typeDef.typeDescriptor as RecordTypeDesc, "IN");
		}
		if (this.supportOutput) {
			this.addPortOv(this.typeDef.typeDescriptor as RecordTypeDesc, "OUT");
		}
	}

	private addPortOv(typeNode: RecordField | RecordTypeDesc | RecordFieldWithDefaultValue | TypeReference,
		type: "IN" | "OUT", parent?: DataMapperPortModel) {
		if (STKindChecker.isRecordTypeDesc(typeNode)) {
			const recPort = new DataMapperPortModel(typeNode, type, parent);
			this.addPort(recPort);
			typeNode.fields.forEach((field) => {
				this.addPortOv(field, type, recPort);
			});
		} else if (STKindChecker.isRecordField(typeNode)) {
			const fieldPort = new DataMapperPortModel(typeNode, type, parent);
			this.addPort(fieldPort)
			if (STKindChecker.isRecordTypeDesc(typeNode.typeName)) {
				this.addPortOv(typeNode.typeName, type, fieldPort);
			}
		}
	}
}
