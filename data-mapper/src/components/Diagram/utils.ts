import { FieldAccess, FunctionDefinition, MappingConstructor, NodePosition, RecordField, SimpleNameReference, SpecificField, STKindChecker } from "@wso2-enterprise/syntax-tree";

import { DataMapperLinkModel } from "./Link/model/DataMapperLink";
import { ExpressionFunctionBodyNode, RequiredParamNode } from "./Node";
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
	if (link.getSourcePort()) {
		const sourcePort = link.getSourcePort() as DataMapperPortModel;

		rhs = (STKindChecker.isRecordField(sourcePort.field)
			? sourcePort.field.fieldName.value : "");
		let parent = sourcePort.parentModel;
		while (parent != null) {
			rhs = (STKindChecker.isRecordField(parent.field)
				? parent.field.fieldName.value + "." : "") + rhs;
			parent = parent.parentModel;
		}
		const sourceNode = sourcePort.getNode() as DataMapperNodeModel;
		if (sourceNode instanceof RequiredParamNode) {
			rhs = sourceNode.value.paramName.value + "." + rhs;
		}
	}

	if (link.getTargetPort()) {
		const targetPort = link.getTargetPort() as DataMapperPortModel;
		lhs = STKindChecker.isRecordField(targetPort.field)
			? targetPort.field.fieldName.value : "";

		const parentFieldNames: string[] = [];
		let parent = targetPort.parentModel;
		while (parent != null) {
			if (STKindChecker.isRecordField(parent.field)) {
				parentFieldNames.push(parent.field.fieldName.value);
			};
			parent = parent.parentModel;
		}
		const targetNode = targetPort.getNode() as DataMapperNodeModel;
		if (targetNode instanceof ExpressionFunctionBodyNode) {
			let mappingConstruct = targetNode.value.expression as MappingConstructor;
			let targetPos: NodePosition;
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
			targetPos = targetMappingConstruct.openBrace.position as NodePosition;
			if (targetMappingConstruct.fields.length > 0) {
				source += ",";
			}
			const modifications = [
				{
					type: "INSERT",
					config: {
						"STATEMENT": source,
					},
					endColumn: targetPos.endColumn,
					endLine: targetPos.endLine,
					startColumn: targetPos.endColumn,
					startLine: targetPos.endLine
				}
			];
			targetNode.context.applyModifications(modifications);
		}
	}
	return `${lhs} = ${rhs}`;
}
