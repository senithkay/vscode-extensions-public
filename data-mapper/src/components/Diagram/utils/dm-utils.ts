import { PortModel } from "@projectstorm/react-diagrams";
import {
	keywords,
	STModification,
	Type
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
	FieldAccess,
	FromClause,
	FunctionDefinition,
	ListConstructor,
	MappingConstructor,
	NodePosition,
	RecordField,
	RequiredParam, SimpleNameReference,
	SpecificField,
	STKindChecker,
	STNode,
	traversNode
} from "@wso2-enterprise/syntax-tree";

import { isPositionsEquals } from "../../../utils/st-utils";
import { ExpressionLabelModel } from "../Label";
import { DataMapperLinkModel } from "../Link";
import { ArrayElement, EditableRecordField } from "../Mappings/EditableRecordField";
import { RequiredParamNode } from "../Node";
import { DataMapperNodeModel } from "../Node/commons/DataMapperNode";
import { EXPANDED_QUERY_SOURCE_PORT_PREFIX, FromClauseNode } from "../Node/FromClause";
import { LinkConnectorNode } from "../Node/LinkConnector";
import { MappingConstructorNode } from "../Node/MappingConstructor";
import { RecordFieldPortModel } from "../Port";
import { FieldAccessFindingVisitor } from "../visitors/FieldAccessFindingVisitor";

import { getModification } from "./modifications";

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

export async function createSourceForMapping(link: DataMapperLinkModel) {
	let source = "";
	let lhs = "";
	let rhs = "";
	const modifications: STModification[] = [];

	if (!link.getSourcePort() || !link.getTargetPort()) {
		return;
	}

	const targetPort = link.getTargetPort() as RecordFieldPortModel;
	const fieldIndexes = targetPort && getFieldIndexes(targetPort);
	rhs = getRHSFromSourcePort(link.getSourcePort());
	lhs = getBalRecFieldName(targetPort.field.name);

	// Inserting a new specific field
	let mappingConstruct;
	const parentFieldNames: string[] = [];
	let parent = targetPort.parentModel;
	let fromFieldIdx = -1;

	while (parent != null) {
		parentFieldNames.push(parent.field.name);
		parent = parent.parentModel;
	}

	const targetNode = targetPort.getNode() as DataMapperNodeModel;
	if ((targetNode instanceof MappingConstructorNode)
		&& STKindChecker.isMappingConstructor(targetNode.value.expression)
	) {
		mappingConstruct = targetNode.value.expression;
	} else {
		return;
	}

	let targetMappingConstruct = mappingConstruct;
	const applyModifications = targetNode.context.applyModifications;

	if (parentFieldNames.length > 0) {
		const fieldNames = parentFieldNames.reverse();

		for (let i = 0; i < fieldNames.length; i++) {
			const fieldName = fieldNames[i];
			const specificField = getSpecificField(mappingConstruct, fieldName);

			if (specificField && specificField.valueExpr) {
				const valueExpr = specificField.valueExpr;

				if (!valueExpr.source) {
					return createValueExprSource(lhs, rhs, fieldNames, i, specificField.colon.position, applyModifications);
				}

				if (STKindChecker.isMappingConstructor(valueExpr)) {
					mappingConstruct = valueExpr;
				} else if (STKindChecker.isListConstructor(valueExpr)
					&& fieldIndexes !== undefined && !!fieldIndexes.length)
				{
					const targetExpr = valueExpr.expressions[fieldIndexes.pop() * 2];
					if (STKindChecker.isMappingConstructor(targetExpr)) {
						mappingConstruct = targetExpr;
					}
				}

				if (i === fieldNames.length - 1) {
					targetMappingConstruct = mappingConstruct;
				}
			} else {
				fromFieldIdx = i;
				targetMappingConstruct = mappingConstruct;
				break;
			}
		}

		if (fromFieldIdx >= 0 && fromFieldIdx <= fieldNames.length) {
			const missingFields = fieldNames.slice(fromFieldIdx);
			source = createSpecificField(missingFields);
		} else {
			const specificField = getSpecificField(targetMappingConstruct, lhs);
			if (specificField && !specificField.valueExpr.source) {
				return createValueExprSource(lhs, rhs, [], 0, specificField.colon.position, applyModifications);
			}
			source = `\n${lhs}: ${rhs}`;
		}
	} else {
		const specificField = getSpecificField(targetMappingConstruct, lhs);
		if (specificField && !specificField.valueExpr.source) {
			return createValueExprSource(lhs, rhs, [], 0, specificField.colon.position, applyModifications);
		}
		source = `\n${lhs}: ${rhs}`;
	}

	const targetPosition = targetMappingConstruct.openBrace.position;
	source = !!targetMappingConstruct.fields.length ? source + "," : source;

	modifications.push(getModification(source, {
		...targetPosition,
		startColumn: targetPosition.endColumn,
		startLine: targetPosition.endLine
	}));
	applyModifications(modifications);

	function createSpecificField(missingFields: string[]): string {
		return missingFields.length > 0
			? `\t${missingFields[0]}: {\n${createSpecificField(missingFields.slice(1))}}`
			: `\t${lhs}: ${rhs}`;
	}

	return `${lhs} = ${rhs}`;
}

export function createSourceForUserInput(field: EditableRecordField, mappingConstruct: MappingConstructor,
										                               newValue: string,
										                               applyModifications: (modifications: STModification[]) => void) {

	let source;
	let targetMappingConstructor = mappingConstruct;
	const parentFields: string[] = [];
	let nextField = field;
	const modifications: STModification[] = [];

	while (nextField && nextField.parentType) {
		const fieldName = nextField.type.name;
		parentFields.push(getBalRecFieldName(fieldName));

		if (nextField.parentType.hasValue()) {
			const valueExpr = nextField.parentType.value.valueExpr;

			if (!valueExpr.source) {
				return createValueExprSource(fieldName, newValue, parentFields.reverse(), 0,
					nextField.parentType.value.colon.position, applyModifications);
			}

			if (STKindChecker.isMappingConstructor(valueExpr)) {
				const specificField = getSpecificField(valueExpr, fieldName);
				if (specificField && !specificField.valueExpr.source) {
					return createValueExprSource(fieldName, newValue, parentFields, 1,
						specificField.colon.position, applyModifications);
				}
				source = createSpecificField(parentFields.reverse());
				targetMappingConstructor = valueExpr;
			} else if (STKindChecker.isListConstructor(valueExpr)
				&& STKindChecker.isMappingConstructor(valueExpr.expressions[0])) {
				for (const expr of valueExpr.expressions) {
					if (STKindChecker.isMappingConstructor(expr)
						&& isPositionsEquals(expr.position, mappingConstruct.position))
					{
						const specificField = getSpecificField(expr, fieldName);
						if (specificField && !specificField.valueExpr.source) {
							return createValueExprSource(fieldName, newValue, parentFields, 1,
								specificField.colon.position, applyModifications);
						}
						source = createSpecificField(parentFields.reverse());
						targetMappingConstructor = expr;
					}
				}
			}
			nextField = undefined;
		} else {
			nextField = nextField?.parentType;
		}
	}

	if (!source) {
		const specificField = getSpecificField(targetMappingConstructor, field.type.name);
		if (specificField && !specificField.valueExpr.source) {
			return createValueExprSource(field.type.name, newValue, parentFields, 1,
				specificField.colon.position, applyModifications);
		}
		source = createSpecificField(parentFields.reverse());
	}
	source = !!targetMappingConstructor.fields.length ? source + "," : source;

	modifications.push(getModification(source, {
		...targetMappingConstructor.openBrace.position,
		startLine: targetMappingConstructor.openBrace.position.endLine,
		startColumn: targetMappingConstructor.openBrace.position.endColumn
	}));
	applyModifications(modifications);

	function createSpecificField(missingFields: string[]): string {
		return missingFields.length > 1
			? `\t${missingFields[0]}: {\n${createSpecificField(missingFields.slice(1))}}`
			: `\t${missingFields[0]}: ${newValue}`;
	}
}

export async function modifySpecificFieldSource(link: DataMapperLinkModel) {
	let rhs = "";
	const modifications: STModification[] = [];
	if (link.getSourcePort()) {
		rhs = getRHSFromSourcePort(link.getSourcePort());
	}

	if (link.getTargetPort()){
		const targetPort = link.getTargetPort();
		const targetNode = targetPort.getNode();
		if (targetNode instanceof LinkConnectorNode){
			targetNode.value = targetNode.value + " + " + rhs;
			targetNode.updateSource();
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

export function findNodeByValueNode(value: RequiredParam | FromClause, dmNode: DataMapperNodeModel)
									: RequiredParamNode | FromClauseNode{
	let foundNode: RequiredParamNode | FromClauseNode;
	dmNode.getModel().getNodes().find((node) => {
		if (((STKindChecker.isRequiredParam(value) && node instanceof RequiredParamNode
				&& STKindChecker.isRequiredParam(node.value))
			|| (STKindChecker.isFromClause(value) && node instanceof FromClauseNode
				&& STKindChecker.isFromClause(node.value)))
			&& isPositionsEquals(value.position, node.value.position)) {
			foundNode = node;
		}
	});
	return foundNode;
}

export function getInputNodeExpr(expr: FieldAccess | SimpleNameReference, dmNode: DataMapperNodeModel) {
	const nameRef = STKindChecker.isSimpleNameReference(expr) ? expr : undefined;
	if (!nameRef && STKindChecker.isFieldAccess(expr)) {
		let valueExpr = expr.expression;
		while (valueExpr && STKindChecker.isFieldAccess(valueExpr)) {
			valueExpr = valueExpr.expression;
		}
		if (valueExpr && STKindChecker.isSimpleNameReference(valueExpr)) {
			let paramNode: RequiredParam | FromClause =
					dmNode.context.functionST.functionSignature.parameters.find((param) =>
					STKindChecker.isRequiredParam(param)
					&& param.paramName?.value === (valueExpr as SimpleNameReference).name.value
				) as RequiredParam;
			if (STKindChecker.isSpecificField(dmNode.context.selection.selectedST)
				&& STKindChecker.isQueryExpression(dmNode.context.selection.selectedST.valueExpr)){
				paramNode = dmNode.context.selection.selectedST.valueExpr.queryPipeline.fromClause
			}
			return findNodeByValueNode(paramNode, dmNode);
		}
	}
}

export function getInputPortsForExpr(node: RequiredParamNode | FromClauseNode, expr: FieldAccess | SimpleNameReference)
									: RecordFieldPortModel {
	const typeDesc = node.typeDef;
	let portIdBuffer = node instanceof RequiredParamNode ? node.value.paramName.value
						: EXPANDED_QUERY_SOURCE_PORT_PREFIX  + "."
							+ (node as FromClauseNode).sourceBindingPattern.variableName.value;
	if (typeDesc.typeName === 'record') {
		if (STKindChecker.isFieldAccess(expr)) {
			const fieldNames = getFieldNames(expr);
			let nextTypeNode: Type = typeDesc;
			for (let i = 1; i < fieldNames.length; i++) {
				const fieldName = fieldNames[i];
				portIdBuffer += `.${fieldName}`;
				const recField = nextTypeNode.fields.find(
									(field: any) => field.name === fieldName);
				if (recField) {
					if (i === fieldNames.length - 1) {
						const portId = portIdBuffer + ".OUT";
						const port = (node.getPort(portId) as RecordFieldPortModel);
						return port;
					} else if (recField.typeName === 'record') {
						nextTypeNode = recField;
					}
				}
			}
		} else {
		// handle this when direct mapping parameters is enabled
		}
	}
	return null;
}

export function getEnrichedRecordType(type: Type, node?: STNode, parentType?: EditableRecordField,
									                             childrenTypes?: EditableRecordField[]) {
	let editableRecordField: EditableRecordField = null;
	let fields = null;
	let specificField: SpecificField;
	let nextNode: STNode;

	if (parentType) {
		if (node && STKindChecker.isMappingConstructor(node)) {
			specificField = node.fields.find((val) =>
				STKindChecker.isSpecificField(val) && val.fieldName.value === getBalRecFieldName(type?.name)
			) as SpecificField;
			nextNode = specificField && specificField.valueExpr ? specificField.valueExpr : undefined;
		} else if (node && STKindChecker.isListConstructor(node)) {
			const mappingConstructors = node.expressions.filter((val) =>
				STKindChecker.isMappingConstructor(val)
			);
			for (const expr of mappingConstructors) {
				if (STKindChecker.isMappingConstructor(expr)) {
					specificField = expr.fields.find((val) =>
						STKindChecker.isSpecificField(val) && val.fieldName.value === getBalRecFieldName(type?.name)
					) as SpecificField;
				}
			}
			// TODO: Add support for other types as well
		}
	} else {
		nextNode = node;
	}

	editableRecordField = new EditableRecordField(type, specificField, parentType);

	if (type.typeName === 'record') {
		fields = type.fields;
		const children = [...childrenTypes ? childrenTypes : []];
		if (fields && !!fields.length) {
			fields.map((field) => {
				const childType = getEnrichedRecordType(field, nextNode, editableRecordField, childrenTypes);
				children.push(childType);
			});
		}
		editableRecordField.childrenTypes = children;
	} else if (type.typeName === 'array' && type.memberType.typeName === 'record') {
		if (nextNode) {
			if (STKindChecker.isListConstructor(nextNode)) {
				editableRecordField.elements = getEnrichedArrayType(type, nextNode, editableRecordField);
			} else if (STKindChecker.isMappingConstructor(nextNode)) {
				fields = type.memberType.fields;
				const children = [...childrenTypes ? childrenTypes : []];
				if (fields && !!fields.length) {
					fields.map((field) => {
						const childType = getEnrichedRecordType(field, nextNode, editableRecordField, childrenTypes);
						children.push(childType);
					});
				}
				// Create only a single element as there is only one mapping constructor
				editableRecordField.elements = [{
					members: children,
					elementNode: nextNode
				}];
			}
		}
	}

	return editableRecordField;
}

export function getEnrichedArrayType(type: Type, node?: ListConstructor, parentType?: EditableRecordField,
									                            childrenTypes?: EditableRecordField[]) {
	let fields: Type[] = [];
	const members: ArrayElement[] = [];

	if (type.typeName === 'array' && type.memberType.typeName === 'record') {
		fields = type.memberType.fields;
	}

	node.expressions.forEach((expr) => {
		if (STKindChecker.isMappingConstructor(expr)) {
			if (fields && !!fields.length) {
				const member: EditableRecordField[] = [];
				fields.map((field) => {
					const childType = getEnrichedRecordType(field, expr, parentType, childrenTypes);
					member.push(childType);
				});
				if (!!member.length) {
					members.push({
						members: member, elementNode: expr
					});
				}
			}
		}
	});

	return members;
}

export function getBalRecFieldName(fieldName : string) {
	if (fieldName) {
		return keywords.includes(fieldName) ? `'${fieldName}` : fieldName;
	}
	return "";
}

export function getDefaultLiteralValue(typeName : string, valueExpr: STNode) {
	if (valueExpr && typeName !== 'array' && typeName !== 'record' && (
		STKindChecker.isStringLiteral(valueExpr)
		|| STKindChecker.isNumericLiteral(valueExpr)
		|| STKindChecker.isBooleanLiteral(valueExpr)
	)) {
		return valueExpr.literalToken.value;
	}
}

export function getFieldIndexes(targetPort: RecordFieldPortModel): number[] {
	const fieldIndexes = [];
	if (targetPort?.index !== undefined) {
		fieldIndexes.push(targetPort.index);
	}
	const parentPort = targetPort?.parentModel;
	if (parentPort) {
		fieldIndexes.push(...getFieldIndexes(parentPort));
	}
	return fieldIndexes;
}

export function isConnectedViaLink(field: SpecificField) {
	const fieldAccessFindingVisitor : FieldAccessFindingVisitor = new FieldAccessFindingVisitor();
	traversNode(field.valueExpr, fieldAccessFindingVisitor);
	const fieldAccessNodes = fieldAccessFindingVisitor.getFieldAccesseNodes();

	const isMappingConstruct = STKindChecker.isMappingConstructor(field.valueExpr);
	const isListConstruct = STKindChecker.isListConstructor(field.valueExpr);

	return !!fieldAccessNodes.length && !isMappingConstruct && !isListConstruct;
}

function createValueExprSource(lhs: string, rhs: string, fieldNames: string[],
							                        fieldIndex: number,
							                        targetPosition: NodePosition,
							                        applyModifications: (modifications: STModification[]) => void) {
	let source = "";

	if (fieldIndex >= 0 && fieldIndex <= fieldNames.length) {
		const missingFields = fieldNames.slice(fieldIndex);
		source = createValueExpr(missingFields, true);
	} else {
		source = rhs;
	}

	applyModifications([getModification(source, {
		...targetPosition,
		startLine: targetPosition.endLine,
		startColumn: targetPosition.endColumn
	})]);

	function createValueExpr(missingFields: string[], isRoot?: boolean): string {
		return !!missingFields.length
			? isRoot
				? `{\n${createValueExpr(missingFields.slice(1))}}`
				: `\t${missingFields[0]}: {\n${createValueExpr(missingFields.slice(1))}}`
			: isRoot
				? rhs
				: `\t${lhs}: ${rhs}`;
	}

	return `${rhs}: ${lhs}`;
}

function getRHSFromSourcePort(port: PortModel) {
	const sourcePort = port as RecordFieldPortModel;
	let rhs = getBalRecFieldName(sourcePort.field.name);
	if (sourcePort.parentFieldAccess) {
		rhs = sourcePort.parentFieldAccess + "." + rhs;
	}
	return rhs;
}

function getSpecificField(mappingConstruct: MappingConstructor, targetFieldName: string) {
	return mappingConstruct.fields.find((val) =>
		STKindChecker.isSpecificField(val) && val.fieldName.value === targetFieldName
	) as SpecificField;
}
