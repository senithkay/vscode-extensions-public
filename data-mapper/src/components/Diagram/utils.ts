import { STModification } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FieldAccess, FunctionDefinition, MappingConstructor, NodePosition, RecordField, SimpleNameReference, SpecificField, STKindChecker } from "@wso2-enterprise/syntax-tree";

import { DataMapperLinkModel } from "./Link/model/DataMapperLink";
import { ExpressionFunctionBodyNode, QueryExpressionNode, RequiredParamNode } from "./Node";
import { DataMapperNodeModel } from "./Node/commons/DataMapperNode";
import { DataMapperPortModel } from "./Port/model/DataMapperPortModel";

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

// TODO: Move below util to low-code-editor-commons
export function isPositionsEquals(position1: NodePosition, position2: NodePosition): boolean {
	return position1?.startLine === position2?.startLine &&
		position1?.startColumn === position2?.startColumn &&
		position1?.endLine === position2?.endLine &&
		position1?.endColumn === position2?.endColumn;
}

