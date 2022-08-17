import { STModification } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { ExpressionFunctionBody, FieldAccess, FunctionDefinition, MappingConstructor, NodePosition, RecordField, RecordTypeDesc, RequiredParam, SimpleNameReference, SpecificField, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import { ExpressionLabelModel } from "../Label";

import { DataMapperLinkModel } from "../Link";
import { ExpressionFunctionBodyNode, QueryExpressionNode, RequiredParamNode } from "../Node";
import { DataMapperNodeModel } from "../Node/commons/DataMapperNode";
import { LinkConnectorNode, LINK_CONNECTOR_NODE_TYPE } from "../Node/LinkConnector";
import { SelectClauseNode } from "../Node/SelectClause";
import { DataMapperPortModel, IntermediatePortModel } from "../Port";
import { RecordTypeDescriptorStore } from "./record-type-descriptor-store";

export function getFieldNames(expr: FieldAccess) {
	const fieldNames: string[] = [];
	let nextExp: FieldAccess = expr;
	while (nextExp && STKindChecker.isFieldAccess(nextExp)) {
		fieldNames.push((nextExp.fieldName as SimpleNameReference).name.value);
		if (STKindChecker.isSimpleNameReference(nextExp.expression)) {
			fieldNames.push(nextExp.expression.name.value);
		}
		nextExp = STKindChecker.isFieldAccess(nextExp.expression) ? nextExp.expression : undefined;
	}
	return fieldNames.reverse();
}

export function getFieldTypeName(field: RecordField) {
	let name: string;
	if (STKindChecker.isRecordTypeDesc(field.typeName)) {
		name = "record";
	} else if (STKindChecker.isArrayTypeDesc(field.typeName)) {
		name = "array";
	} else if ((field.typeName as any)?.name) {
		name = (field.typeName as any)?.name.value;
	}
	return name;
}

export function getParamForName(name: string, st: FunctionDefinition) {
	return st.functionSignature.parameters.find((param) =>
		STKindChecker.isRequiredParam(param) && param.paramName?.value === name); // TODO add support for other param types
}

export async function createSpecificFieldSource(link: DataMapperLinkModel) {
	let source = "";
	let lhs = "";
	let rhs = "";
	const modifications: STModification[] = [];
	if (link.getSourcePort()) {
		const sourcePort = link.getSourcePort() as DataMapperPortModel;

		rhs = (STKindChecker.isRecordField(sourcePort.field)
			? sourcePort.field.fieldName.value : "");

		if (sourcePort.parentFieldAccess) {
			rhs = sourcePort.parentFieldAccess + "." + rhs;
		}
	}

	if (link.getTargetPort()) {
		const targetPort = link.getTargetPort() as DataMapperPortModel;
		const targetNode = targetPort.getNode() as DataMapperNodeModel;

		let mappingConstruct;
		if (targetNode instanceof ExpressionFunctionBodyNode && STKindChecker.isMappingConstructor(targetNode.value.expression)) {
			mappingConstruct = targetNode.value.expression as MappingConstructor;
		} else if (targetNode instanceof QueryExpressionNode && STKindChecker.isMappingConstructor(targetNode.value.selectClause.expression)) {
			mappingConstruct = targetNode.value.selectClause.expression;
		} else if (targetNode instanceof SelectClauseNode && STKindChecker.isMappingConstructor(targetNode.value.expression)) {
			mappingConstruct = targetNode.value.expression;
		}

		// Inserting a new specific field
		if (STKindChecker.isRecordField(targetPort.field)) {
			lhs = targetPort.field.fieldName.value;
			const parentFieldNames: string[] = [];
			let parent = targetPort.parentModel;
			while (parent != null) {
				if (STKindChecker.isRecordField(parent.field)) {
					parentFieldNames.push(parent.field.fieldName.value);
				};
				parent = parent.parentModel;
			}
			if (mappingConstruct) {
				let targetMappingConstruct = mappingConstruct;
				let fromFieldIdx = -1;
				if (parentFieldNames.length > 0) {
					const fieldNames = parentFieldNames.reverse();
					for (let i = 0; i < fieldNames.length; i++) {
						const fieldName = fieldNames[i];
						if (mappingConstruct) {
							const specificField = mappingConstruct.fields.find((val) => STKindChecker.isSpecificField(val) && val.fieldName.value === fieldName) as SpecificField;
							if (specificField && specificField.valueExpr) {
								mappingConstruct = specificField.valueExpr as MappingConstructor;
								if (i === fieldNames.length - 1) {
									targetMappingConstruct = mappingConstruct;
								}
							} else {
								fromFieldIdx = i;
								targetMappingConstruct = mappingConstruct;
								break;
							}
						}
					}
					const createSpeficField = (missingFields: string[]) => {
						let source = "";
						if (missingFields.length > 0) {
							source = `\t${missingFields[0]}: {\n${createSpeficField(missingFields.slice(1))}}`;
						} else {
							source = `\t${lhs}: ${rhs}`;
						}
						return source;
					}
					if (fromFieldIdx >= 0 && fromFieldIdx <= fieldNames.length) {
						const missingFields = fieldNames.slice(fromFieldIdx);
						source = createSpeficField(missingFields);
					} else {
						source = `${lhs}: ${rhs}`;
					}
				} else {
					source = `${lhs}: ${rhs}`;
				}
				const targetPos = targetMappingConstruct.openBrace.position as NodePosition;
				if (targetMappingConstruct.fields.length > 0) {
					source += ",";
				}
				modifications.push({
					type: "INSERT",
					config: {
						"STATEMENT": source,
					},
					endColumn: targetPos.endColumn,
					endLine: targetPos.endLine,
					startColumn: targetPos.endColumn,
					startLine: targetPos.endLine
				});
			}
		} else if (STKindChecker.isSpecificField(targetPort.field)) {
			// Inserting just the valueExpr (RHS) to already available specific field in a mapping constructor
			const targetPos = targetPort.field.valueExpr.position as NodePosition;
			modifications.push({
				type: "INSERT",
				config: {
					"STATEMENT": rhs,
				},
				endColumn: targetPos.endColumn,
				endLine: targetPos.endLine,
				startColumn: targetPos.startColumn,
				startLine: targetPos.startLine
			});
		}
		targetNode.context.applyModifications(modifications);
	}
	return `${lhs} = ${rhs}`;
}

export async function modifySpecificFieldSource(link: DataMapperLinkModel) {
	let rhs = "";
	const modifications: STModification[] = [];
	if (link.getSourcePort()) {
		const sourcePort = link.getSourcePort() as DataMapperPortModel;

		rhs = (STKindChecker.isRecordField(sourcePort.field)
			? sourcePort.field.fieldName.value : "");

		if (sourcePort.parentFieldAccess) {
			rhs = sourcePort.parentFieldAccess + "." + rhs;
		}
	}

	if (link.getTargetPort()){
		const targetPort = link.getTargetPort();
		const targetNode = targetPort.getNode();
		if (targetNode.getOptions().type === LINK_CONNECTOR_NODE_TYPE){
			(targetNode as LinkConnectorNode).value = (targetNode as LinkConnectorNode).value + " + " + rhs;
			(targetNode as LinkConnectorNode).updateSource();
		}
		else {
			let targetPos: NodePosition;
			Object.keys(targetPort.getLinks()).forEach((linkId) => {
				if (linkId !== link.getID()){
					const link = targetPort.getLinks()[linkId]
					targetPos = (link.getLabels()[0] as ExpressionLabelModel).valueNode.position;

				}
			})
			if (targetPos){
				modifications.push({
					type: "INSERT",
					config: {
						"STATEMENT": " + " + rhs,
					},
					endColumn: targetPos.endColumn,
					endLine: targetPos.endLine,
					startColumn: targetPos.endColumn,
					startLine: targetPos.endLine
				});

				(targetNode as DataMapperNodeModel).context.applyModifications(modifications)
			}
		}
	}

}

export function getInputPortsForExpr(node: RequiredParamNode, expr: FieldAccess|SimpleNameReference) {
	const typeDesc = node.typeDef.typeDescriptor;
	let portIdBuffer = node.value.paramName.value;
	if (STKindChecker.isRecordTypeDesc(typeDesc)) {
		if (STKindChecker.isFieldAccess(expr)) {
			const fieldNames = getFieldNames(expr);
			let nextTypeNode: RecordTypeDesc = typeDesc;
			for (let i = 1; i < fieldNames.length; i++) { // Note i = 1 as we omit param name
				const fieldName = fieldNames[i];
				portIdBuffer += `.${fieldName}`;
				const recField = nextTypeNode.fields.find(
					(field) => STKindChecker.isRecordField(field) && field.fieldName.value === fieldName);
				if (recField) {
					if (i === fieldNames.length - 1) {
						const portId = portIdBuffer + ".OUT";
						const port = (node.getPort(portId) as DataMapperPortModel);
						return port;
					} else if (STKindChecker.isRecordTypeDesc(recField.typeName)) {
						nextTypeNode = recField.typeName;
					} else if (STKindChecker.isSimpleNameReference(recField.typeName) ){
						const recordTypeDescriptors = RecordTypeDescriptorStore.getInstance();
						const typeDef = recordTypeDescriptors.gettypeDescriptor(recField.typeName.name.value)
						nextTypeNode = typeDef.typeDescriptor as RecordTypeDesc
					}
				}
			}
		} else {
			// handle this when direct mapping parameters is enabled
		}
	}
}

export function getOutputPortForField(fields: SpecificField[]) {
	let nextTypeNode = this.typeDef.typeDescriptor as RecordTypeDesc;
	let recField: RecordField;
	let portIdBuffer = "exprFunctionBody";
	for (let i = 0; i < fields.length; i++) {
		const specificField = fields[i];
		portIdBuffer += `.${specificField.fieldName.value}`
		const recFieldTemp = nextTypeNode.fields.find(
			(recF) => STKindChecker.isRecordField(recF) && recF.fieldName.value === specificField.fieldName.value);
		if (recFieldTemp) {
			if (i === fields.length - 1) {
				recField = recFieldTemp as RecordField;
			} else if (STKindChecker.isRecordTypeDesc(recFieldTemp.typeName)){
				nextTypeNode = recFieldTemp.typeName
			}
			else if (STKindChecker.isSimpleNameReference(recFieldTemp.typeName) ){
				const recordTypeDescriptors = RecordTypeDescriptorStore.getInstance();
				const typeDef = recordTypeDescriptors.gettypeDescriptor(recFieldTemp.typeName.name.value)
				nextTypeNode = typeDef.typeDescriptor as RecordTypeDesc
			}
		}
	}
	if (recField) {
		const portId = portIdBuffer + ".IN";
		const outPort = this.getPort(portId);
		return outPort;
	}
}

export function getInputNodeExpr(expr: FieldAccess|SimpleNameReference) {
	let nameRef = STKindChecker.isSimpleNameReference(expr) ? expr: undefined;
	if (!nameRef && STKindChecker.isFieldAccess(expr)) {
		let valueNodeExpr = expr.expression;
		while (valueNodeExpr && STKindChecker.isFieldAccess(valueNodeExpr)) {
			valueNodeExpr = valueNodeExpr.expression;
		}
		if (valueNodeExpr && STKindChecker.isSimpleNameReference(valueNodeExpr)) {
			const paramNode = this.context.functionST.functionSignature.parameters
				.find((param: STNode) => 
					STKindChecker.isRequiredParam(param) 
					&& param.paramName?.value === (valueNodeExpr as  SimpleNameReference).name.value
				) as RequiredParam;
			return this.findNodeByValueNode(paramNode);	
		}
	}
}

export function findNodeByValueNode(valueNode: ExpressionFunctionBody | RequiredParam): RequiredParamNode {
	let foundNode: RequiredParamNode;
	this.getModel().getNodes().find((node: DataMapperNodeModel) => {
		if (STKindChecker.isRequiredParam(valueNode)
			&& node instanceof RequiredParamNode
			&& STKindChecker.isRequiredParam(node.value)
			&& valueNode.paramName.value === node.value.paramName.value) {
				foundNode = node;
		} 
	});
	return foundNode;
}


// TODO: Move below util to low-code-editor-commons
export function isPositionsEquals(position1: NodePosition, position2: NodePosition): boolean {
	return position1?.startLine === position2?.startLine &&
		position1?.startColumn === position2?.startColumn &&
		position1?.endLine === position2?.endLine &&
		position1?.endColumn === position2?.endColumn;
}

