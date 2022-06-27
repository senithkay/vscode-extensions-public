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
import md5 from 'blueimp-md5';
import { IDataMapperContext } from '../../../../utils/DataMapperContext/DataMapperContext';
import { DataMapperLinkModel } from '../../Link/model/DataMapperLink';

import { DataMapperPortModel } from '../../Port/model/DataMapperPortModel';
import { getFieldNames } from '../../utils';

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
	public readonly typeDef: TypeDefinition;
	public readonly supportOutput: boolean;
	public readonly supportInput: boolean
	public readonly value: ExpressionFunctionBody | RequiredParam;
	public readonly context: IDataMapperContext;
	private diagramModel: DiagramModel;

	constructor(context: IDataMapperContext,
		value: ExpressionFunctionBody | RequiredParam,
		typeDef: TypeDefinition, supportOutput: boolean,
		supportInput: boolean) {
		super({
			type: 'datamapper'
		});
		this.context = context;
		this.value = value;
		this.typeDef = typeDef;
		this.supportInput = supportInput;
		this.supportOutput = supportOutput;
	}

	public setModel(model: DiagramModel) {
		this.diagramModel = model;
	}

	public getModel() {
		return this.diagramModel;
	}

	public initPorts() {
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
			this.createLinks(mappings);
		} else if (STKindChecker.isRequiredParam(this.value)) {
			// Only create links from target side
		}
	}

	private createLinks(mappings: SpecificFieldMappingFieldAccess[]) {
		mappings.forEach((mapping) => {
			const { fields, value } = mapping;
			const inputNode = this.getInputNodeExpr(value);
			let inPort: DataMapperPortModel; 
			if (inputNode) {
				inPort = this.getInputPortsForExpr(inputNode, value);	
			}
			const outPort = this.getOutputPortForField(fields);
			const lm = new DataMapperLinkModel();
			lm.addLabel(value.source);
			lm.setTargetPort(outPort);
			lm.setSourcePort(inPort);
			this.getModel().addAll(lm);
		});
	}

	private getOutputPortForField(fields: SpecificField[]) {
		let nextTypeNode = this.typeDef.typeDescriptor as RecordTypeDesc;
		let recField: RecordField;
		for (let i = 0; i < fields.length; i++) {
			const specificField = fields[i];
			const recFieldTemp = nextTypeNode.fields.find(
				(recF) => STKindChecker.isRecordField(recF) && recF.fieldName.value === specificField.fieldName.value);
			if (recFieldTemp) {
				if (i === fields.length - 1) {
					recField = recFieldTemp as RecordField;
				} else if (STKindChecker.isRecordTypeDesc(recFieldTemp.typeName)){
					nextTypeNode = recFieldTemp.typeName
				}
			}
		}
		if (recField) {
			const portId =  md5(JSON.stringify(recField.position) + "IN");
			const outPort = this.getPort(portId);
			return outPort;
		}
	}

	// Improve to return multiple ports for complex expressions
	private getInputPortsForExpr(node: DataMapperNodeModel, expr: FieldAccess|SimpleNameReference) {
		const typeDesc = node.typeDef.typeDescriptor;
		if (STKindChecker.isRecordTypeDesc(typeDesc)) {
			if (STKindChecker.isFieldAccess(expr)) {
				const fieldNames = getFieldNames(expr);
				let nextTypeNode: RecordTypeDesc = typeDesc;
				for (let i = 0; i < fieldNames.length; i++) {
					const fieldName = fieldNames[i];
					const recField = nextTypeNode.fields.find(
						(field) => STKindChecker.isRecordField(field) && field.fieldName.value === fieldName);
					if (recField) {
						if (i === fieldNames.length - 1) {
							const portId = md5(JSON.stringify(recField.position) + "OUT");
							const port = (node.getPort(portId) as DataMapperPortModel);
							return port;
						} else if (STKindChecker.isRecordTypeDesc(recField.typeName)) {
							nextTypeNode = recField.typeName;
						}
					}
				}
			} else {
				// handle this when direct mapping parameters is enabled
			}
		}
	}

	private getInputNodeExpr(expr: FieldAccess|SimpleNameReference) {
		let nameRef = STKindChecker.isSimpleNameReference(expr) ? expr: undefined;
		if (!nameRef && STKindChecker.isFieldAccess(expr)) {
			let valueExpr = expr.expression;
			while (valueExpr && STKindChecker.isFieldAccess(valueExpr)) {
				valueExpr = valueExpr.expression;
			}
			if (valueExpr && STKindChecker.isSimpleNameReference(valueExpr)) {
				const paramNode = this.context.functionST.functionSignature.parameters
					.find((param) => 
						STKindChecker.isRequiredParam(param) 
						&& param.paramName?.value === (valueExpr as  SimpleNameReference).name.value
					) as RequiredParam;
				return this.findNodeByValueNode(paramNode);	
			}
		}
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
