import { DiagramModel, NodeModel, NodeModelGenerics } from '@projectstorm/react-diagrams';
import { BalleriaLanguageClient } from '@wso2-enterprise/ballerina-languageclient';
import {
	AnydataTypeDesc, AnyTypeDesc, ArrayTypeDesc, BooleanTypeDesc, ByteTypeDesc, DecimalTypeDesc,
	DistinctTypeDesc, ErrorTypeDesc, ExpressionFunctionBody, FieldAccess, FloatTypeDesc, FunctionDefinition, FunctionTypeDesc, FutureTypeDesc, HandleTypeDesc,
	IntersectionTypeDesc, IntTypeDesc, JsonTypeDesc, MappingConstructor, MapTypeDesc, NeverTypeDesc, NilTypeDesc, ObjectTypeDesc,
	OptionalTypeDesc, ParenthesisedTypeDesc, QualifiedNameReference, ReadonlyTypeDesc, RecordField, RecordFieldWithDefaultValue, RecordTypeDesc,
	RequiredParam,
	SimpleNameReference, SingletonTypeDesc, SpecificField, STKindChecker, STNode, StreamTypeDesc, StringTypeDesc, TableTypeDesc,
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

export interface SpecificFieldMappingFieldAccess {
	fields: SpecificField[];
	value: FieldAccess|SimpleNameReference;
}

export class DataMapperNodeModel extends NodeModel<NodeModelGenerics & DataMapperNodeModelGenerics> {
	public readonly fnST: FunctionDefinition;
	public readonly typeDef: TypeDefinition;
	public readonly supportOutput: boolean;
	public readonly supportInput: boolean
	public readonly value: ExpressionFunctionBody | RequiredParam;
	public readonly filePath: string;
	public readonly langClientPromise: Promise<BalleriaLanguageClient>;
    public readonly updateFileContent: (filePath: string, content: string) => Promise<boolean>;
	private diagramModel: DiagramModel;

	constructor(fnST: FunctionDefinition, value: ExpressionFunctionBody | RequiredParam, typeDef: TypeDefinition, supportOutput: boolean, supportInput: boolean,
				filePath: string, lCP: Promise<BalleriaLanguageClient>,
				updateFileContent: (filePath: string, content: string) => Promise<boolean>) {
		super({
			type: 'datamapper'
		});
		this.fnST = fnST;
		this.value = value;
		this.typeDef = typeDef;
		this.supportInput = supportInput;
		this.supportOutput = supportOutput;
		this.filePath = filePath;
		this.langClientPromise = lCP;
		this.updateFileContent = updateFileContent;
		this.addPorts();
	}

	public setModel(model: DiagramModel) {
		this.diagramModel = model;
	}

	public getModel() {
		return this.diagramModel;
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

	public initLinks() {
		if (STKindChecker.isExpressionFunctionBody(this.value)) {
			const mappings = this.genMappings(this.value.expression as MappingConstructor);
			console.log(mappings);
		} else if (STKindChecker.isRequiredParam(this.value)) {
			// Only create links from target side
		}
	}

	private createLinks() {
		// if (STKindChecker.isSpecificField(val)) {
		// 	let valueExpr = val.valueExpr;
		// 	if (STKindChecker.isFieldAccess(valueExpr)) {
		// 		const fieldNames: string[] = [];
		// 		while (STKindChecker.isFieldAccess(valueExpr)) {
		// 			fieldNames.push(valueExpr.fieldName.value);
		// 			valueExpr = valueExpr.expression as FieldAccess|SimpleNameReference;
		// 		}
		// 		if (STKindChecker.isSimpleNameReference(valueExpr)) {
		// 			fieldNames.push(valueExpr.name.value);
		// 		}
		// 		const paramNode = this.fnST.functionSignature.parameters
		// 			.find((param) => 
		// 				STKindChecker.isRequiredParam(param) 
		// 				&& param.paramName?.value === fieldNames[fieldNames.length - 1]
		// 			) as RequiredParam;
		// 		const findNode = this.findNodeByValueNode.bind(this);
		// 		const nodeForParam = findNode(paramNode);
		// 		if (nodeForParam) {
					
		// 		}
		// 	}
		// }
	}

	private genMappings(val: MappingConstructor, parentFields?: SpecificField[]) {
		let foundMappings: SpecificFieldMappingFieldAccess[] = [];
		let currentFields = [...(parentFields ? parentFields : [])];
		if (val) {
			val.fields.forEach((field) => {
				if (STKindChecker.isSpecificField(field)) {
					if (STKindChecker.isMappingConstructor(field.valueExpr)) {
						foundMappings = [...foundMappings, ...this.genMappings(field.valueExpr, [...currentFields, field])];
					} else if (STKindChecker.isFieldAccess(field.valueExpr)) {
						foundMappings.push({
							fields: [...currentFields, field],
							value: field.valueExpr
						});
					} else if (STKindChecker.isSimpleNameReference(field.valueExpr)) {
						foundMappings.push({
							fields: [...currentFields, field],
							value: field.valueExpr
						});
					} else {
						// TODO handle other types of expressions here
					}
				}
			})
		}
		return foundMappings;
	}

	private findNodeByValueNode(value: ExpressionFunctionBody | RequiredParam) {
		let foundNode: DataMapperNodeModel;
		this.getModel().getNodes().find((node) => {
			var dmNode = node as DataMapperNodeModel;
			if (STKindChecker.isRequiredParam(value)
				&& STKindChecker.isRequiredParam(dmNode.value)
				&& value.paramName.value === dmNode.value.paramName.value) {
					foundNode = dmNode;
			} 
		});
		return foundNode;
	}
}
