import { ExpressionFunctionBody, FieldAccess, MappingConstructor, NodePosition, RecordField, RecordTypeDesc, RequiredParam, SimpleNameReference, SpecificField, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import { DataMapperLinkModel } from "./Link/model/DataMapperLink";
import { DataMapperNodeModel } from "./Node/model/DataMapperNode";
import { DataMapperPortModel } from "./Port/model/DataMapperPortModel";

export function generatePortId(typeNode: RecordField|RecordTypeDesc, type: "IN" | "OUT", nodeValue: ExpressionFunctionBody|RequiredParam,
         parentModel?: DataMapperPortModel) {
    // let id: string = "." + type;
    // if (STKindChecker.isRecordField(typeNode)) {
    //     id = typeNode.fieldName.value + "." + id;
    // } else if (STKindChecker.isRecordTypeDesc(typeNode)) {
    //     if (parentModel) {
            
    //     } else {
    //         const valueNode = 
    //     }
    //     console.log("No field ID");
    // }
    // let parent = parentModel;
    // let parentTypeNode = parentModel?.typeNode;
    // while (parent !== undefined) {
    //     if (STKindChecker.isRecordField(parentTypeNode)) {
    //         id = parentTypeNode.fieldName.value + "." + id;
    //     } else if (STKindChecker.isRecordTypeDesc(parentTypeNode)) {
            
    //     }
    //     parent = parent.parentModel;
    // }
    // return id;
}

export function getFieldNames(expr: FieldAccess) {
    const fieldNames: string[] = [];
    let nextExp: FieldAccess = expr;
    while(nextExp && STKindChecker.isFieldAccess(nextExp)) {
        fieldNames.push((nextExp.fieldName as SimpleNameReference).name.value);
        nextExp = STKindChecker.isFieldAccess(nextExp.expression) ? nextExp.expression : undefined;
    } 
    return fieldNames.reverse();
}

export async function createSpecificFieldSource(link: DataMapperLinkModel) {
	let source = "";
	let lhs = "";
	let rhs = "";
	if (link.getSourcePort()) {
		const sourcePort = link.getSourcePort() as DataMapperPortModel;

		rhs = (STKindChecker.isRecordField(sourcePort.typeNode)
			? sourcePort.typeNode.fieldName.value : "");
		let parent = sourcePort.parentModel;
		while (parent != null) {
			rhs = (STKindChecker.isRecordField(parent.typeNode)
				? parent.typeNode.fieldName.value + "." : "") + rhs;
			parent = parent.parentModel;
		}
		const sourceNode = sourcePort.getNode() as DataMapperNodeModel;
		if (STKindChecker.isRequiredParam(sourceNode.value)) {
			rhs = sourceNode.value.paramName.value + "." + rhs;
		}
	}

	if (link.getTargetPort()) {
		const targetPort = link.getTargetPort() as DataMapperPortModel;
		lhs = STKindChecker.isRecordField(targetPort.typeNode)
			? targetPort.typeNode.fieldName.value : "";

		let parentFieldNames: string[] = [];
		let parent = targetPort.parentModel;
		while (parent != null) {
			if (STKindChecker.isRecordField(parent.typeNode)) {
				parentFieldNames.push(parent.typeNode.fieldName.value);
			};
			parent = parent.parentModel;
		}
		const targetNode = targetPort.getNode() as DataMapperNodeModel;
		if (STKindChecker.isExpressionFunctionBody(targetNode.value)) {
			let mappingConstruct = targetNode.value.expression as MappingConstructor;
			let targetPos: NodePosition = undefined;
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
				}
			} else {
				source = `${lhs}: ${rhs}`;
			}
			targetPos = targetMappingConstruct.openBrace.position as NodePosition;
			if (targetMappingConstruct.fields.length > 0) {
				source += ",\n";
			}
			const langClient = await targetNode.langClientPromise;
			const updateFileContent = targetNode.updateFileContent;
			const stModifyResp = await langClient.stModify({
				documentIdentifier: {
					uri: `file://${targetNode.filePath}`
				},
				astModifications: [
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
				]
			});
			updateFileContent(targetNode.filePath, stModifyResp.source);
			console.log(stModifyResp);
		}
	}
	return `${lhs} = ${rhs}`;
}