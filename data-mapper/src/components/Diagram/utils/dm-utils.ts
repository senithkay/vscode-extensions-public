import { PortModel } from "@projectstorm/react-diagrams";
import {
	keywords,
	PrimitiveBalType,
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
import { MappingConstructorNode, RequiredParamNode } from "../Node";
import { DataMapperNodeModel } from "../Node/commons/DataMapperNode";
import { EXPANDED_QUERY_SOURCE_PORT_PREFIX, FromClauseNode } from "../Node/FromClause";
import { LinkConnectorNode } from "../Node/LinkConnector";
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
		name = PrimitiveBalType.Record;
	} else if (STKindChecker.isArrayTypeDesc(field.typeName)) {
		name = PrimitiveBalType.Array;
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
	const targetNode = targetPort.getNode() as DataMapperNodeModel;
	const applyModifications = targetNode.context.applyModifications;
	const fieldIndexes = targetPort && getFieldIndexes(targetPort);

	rhs = getRHSFromSourcePort(link.getSourcePort());

	if (!isArrayOrRecord(targetPort.field)
		&& targetPort.editableRecordField?.value
		&& !STKindChecker.isSpecificField(targetPort.editableRecordField.value))
	{
		return updateValueExprSource(rhs, targetPort.editableRecordField.value.position, applyModifications);
	}
	lhs = getBalRecFieldName(targetPort.field.name);

	// Inserting a new specific field
	let mappingConstruct;
	const parentFieldNames: string[] = [];
	let parent = targetPort.parentModel;
	let fromFieldIdx = -1;

	while (parent != null && parent.parentModel) {
		if (parent.field?.name) {
			parentFieldNames.push(parent.field.name);
		}
		parent = parent.parentModel;
	}

	if ((targetNode instanceof MappingConstructorNode)
		&& STKindChecker.isMappingConstructor(targetNode.value.expression)
	) {
		mappingConstruct = targetNode.value.expression;
	} else {
		return;
	}

	let targetMappingConstruct = mappingConstruct;

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
					mappingConstruct = getNextMappingConstructor(valueExpr);
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

	function getNextMappingConstructor(listConstructor: ListConstructor): MappingConstructor {
		const targetExpr = listConstructor.expressions[fieldIndexes.pop() * 2];
		if (STKindChecker.isMappingConstructor(targetExpr)) {
			return targetExpr;
		} else if (STKindChecker.isListConstructor(targetExpr)) {
			return getNextMappingConstructor(targetExpr);
		}
	}

	return `${lhs} = ${rhs}`;
}

export async function createSourceForUserInput(field: EditableRecordField, mappingConstruct: MappingConstructor,
										                                     newValue: string,
										                                     applyModifications: (modifications: STModification[]) => void) {

	let source;
	let targetMappingConstructor = mappingConstruct;
	const parentFields: string[] = [];
	let nextField = field;
	const modifications: STModification[] = [];

	while (nextField && nextField.parentType) {
		const fieldName = nextField.type.name;
		if (fieldName) {
			parentFields.push(getBalRecFieldName(fieldName));
		}

		if (nextField.parentType.hasValue() && STKindChecker.isSpecificField(nextField.parentType.value)) {
			const rootField: SpecificField = nextField.parentType.value;

			if (!rootField.valueExpr.source) {
				return createValueExprSource(fieldName, newValue, parentFields.reverse(), 0,
					rootField.colon.position, applyModifications);
			}

			if (STKindChecker.isMappingConstructor(rootField.valueExpr)) {
				const specificField = getSpecificField(rootField.valueExpr, fieldName);
				if (specificField && !specificField.valueExpr.source) {
					return createValueExprSource(fieldName, newValue, parentFields, 1,
						specificField.colon.position, applyModifications);
				}
				source = createSpecificField(parentFields.reverse());
				targetMappingConstructor = rootField.valueExpr;
			} else if (STKindChecker.isListConstructor(rootField.valueExpr)
				&& STKindChecker.isMappingConstructor(rootField.valueExpr.expressions[0])) {
				for (const expr of rootField.valueExpr.expressions) {
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

export function getInputNodeExpr(expr: STNode, dmNode: DataMapperNodeModel) {
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

export function getInputPortsForExpr(node: RequiredParamNode | FromClauseNode, expr: STNode)
									: RecordFieldPortModel {
	const typeDesc = node.typeDef;
	let portIdBuffer = node instanceof RequiredParamNode ? node.value.paramName.value
						: EXPANDED_QUERY_SOURCE_PORT_PREFIX  + "."
							+ (node as FromClauseNode).sourceBindingPattern.variableName.value;
	if (typeDesc.typeName === PrimitiveBalType.Record) {
		if (STKindChecker.isFieldAccess(expr)) {
			const fieldNames = getFieldNames(expr);
			let nextTypeNode: Type = typeDesc;
			for (let i = 1; i < fieldNames.length; i++) {
				const fieldName = fieldNames[i];
				portIdBuffer += `.${fieldName}`;
				const recField = nextTypeNode.fields.find(
									(field: any) => getBalRecFieldName(field.name) === fieldName);
				if (recField) {
					if (i === fieldNames.length - 1) {
						const portId = portIdBuffer + ".OUT";
						let port = (node.getPort(portId) as RecordFieldPortModel);
						while (port && port.hidden) {
							port = port.parentModel;
						}
						return port;
					} else if (recField.typeName === PrimitiveBalType.Record) {
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
	let valueNode: STNode;
	let nextNode: STNode;

	if (parentType) {
		if (node && STKindChecker.isMappingConstructor(node)) {
			const specificField: SpecificField = node.fields.find((val) =>
				STKindChecker.isSpecificField(val) && type?.name && val.fieldName.value === getBalRecFieldName(type.name)
			) as SpecificField;
			if (specificField) {
				valueNode = specificField;
				nextNode =  specificField?.valueExpr ? specificField.valueExpr : undefined;
			} else if (parentType && parentType.type.typeName === PrimitiveBalType.Array) {
				valueNode = node;
				nextNode = valueNode;
			}
		} else if (node && STKindChecker.isListConstructor(node)) {
			const mappingConstructors = node.expressions.filter((val) =>
				STKindChecker.isMappingConstructor(val)
			) as MappingConstructor[];
			if (mappingConstructors.length > 0) {
				for (const expr of mappingConstructors) {
					valueNode = expr.fields.find((val) =>
						STKindChecker.isSpecificField(val) && val.fieldName.value === getBalRecFieldName(type?.name)
					);
				}
				if (!valueNode) {
					valueNode = node;
					nextNode = valueNode;
				}
			} else {
				valueNode = node;
				nextNode = valueNode;
			}
		} else {
			valueNode = node;
		}
	} else {
		nextNode = node;
	}

	editableRecordField = new EditableRecordField(type, valueNode, parentType);

	if (type.typeName === PrimitiveBalType.Record) {
		fields = type.fields;
		const children = [...childrenTypes ? childrenTypes : []];
		if (fields && !!fields.length) {
			fields.map((field) => {
				const childType = getEnrichedRecordType(field, nextNode, editableRecordField, childrenTypes);
				children.push(childType);
			});
		}
		editableRecordField.childrenTypes = children;
	} else if (type.typeName === PrimitiveBalType.Array) {
		if (nextNode) {
			if (type.memberType.typeName === PrimitiveBalType.Record) {
				if (STKindChecker.isListConstructor(nextNode)) {
					editableRecordField.elements = getEnrichedArrayType(
						type.memberType, nextNode, editableRecordField);
				} else if (STKindChecker.isMappingConstructor(nextNode)) {
					const childType = getEnrichedRecordType(type.memberType, nextNode, editableRecordField, childrenTypes);
					editableRecordField.elements = [{
						member: childType,
						elementNode: nextNode
					}];
				}
			} else if (STKindChecker.isListConstructor(nextNode)) {
				editableRecordField.elements = getEnrichedArrayType(type.memberType, nextNode, editableRecordField);
			}
		} else {
			if (type.memberType.typeName === PrimitiveBalType.Record) {
				const members: ArrayElement[] = [];
				const childType = getEnrichedRecordType(type.memberType, undefined, parentType, childrenTypes);
				members.push({
					member: childType,
					elementNode: undefined
				});
				editableRecordField.elements = members;
			}
		}
	}

	return editableRecordField;
}

export function getEnrichedArrayType(field: Type, node?: ListConstructor, parentType?: EditableRecordField,
									                            childrenTypes?: EditableRecordField[]) {
	const members: ArrayElement[] = [];

	node.expressions.forEach((expr) => {
		if (!STKindChecker.isCommaToken(expr)) {
			if (field) {
				const childType = getEnrichedRecordType(field, expr, parentType, childrenTypes);

				if (childType) {
					members.push({
						member: childType,
						elementNode: expr
					});
				}
			}
		}
	});

	return members;
}

export function getNewSource(field: EditableRecordField, mappingConstruct: MappingConstructor,
							                      newValue: string, parentFields?: string[],
							                      lineNumber: number = -1): [string, MappingConstructor, number?] {

	const fieldName = getBalRecFieldName(field.type.name);

	if (field.parentType) {
		const parent = [...parentFields ? [...parentFields, fieldName] : [fieldName]];

		if (field.parentType.hasValue()) {
			if (STKindChecker.isSpecificField(field.parentType.value)) {
				const valueExpr = STKindChecker.isSpecificField(field.parentType.value) && field.parentType.value.valueExpr;

				if (STKindChecker.isMappingConstructor(valueExpr)) {
					return [createSpecificField(parent.reverse()), valueExpr, lineNumber + 1];
				} else if (STKindChecker.isListConstructor(valueExpr)
					&& STKindChecker.isMappingConstructor(valueExpr.expressions[0])) {
					for (const expr of valueExpr.expressions) {
						if (STKindChecker.isMappingConstructor(expr)
							&& isPositionsEquals(expr.position, mappingConstruct.position)) {
							return [createSpecificField(parent.reverse()), expr, lineNumber + 1];
						}
					}
				}
			} else if (STKindChecker.isMappingConstructor(field.parentType.value)) {
				return [createSpecificField(parent.reverse()), field.parentType.value, lineNumber + 1];
			}
			// TODO: Implement this to update already existing non-mapping-constructor values
			return null;
		}
		return getNewSource(field.parentType, mappingConstruct, newValue, parent, lineNumber + 1);
	}
	return [createSpecificField(parentFields.reverse()), mappingConstruct, lineNumber];

	function createSpecificField(missingFields: string[]): string {
		return missingFields.length > 1
			? `\t${missingFields[0]}: {\n${createSpecificField(missingFields.slice(1))}}`
			: `\t${missingFields[0]}: ${newValue}`;
	}
}

export function getBalRecFieldName(fieldName : string) {
	if (fieldName) {
		return keywords.includes(fieldName) ? `'${fieldName}` : fieldName;
	}
	return "";
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

export function isConnectedViaLink(field: STNode) {
	const fieldAccessNodes = getFieldAccessNodes(field);

	const isMappingConstruct = STKindChecker.isMappingConstructor(field);
	const isListConstruct = STKindChecker.isListConstructor(field);

	return !!fieldAccessNodes.length && !isMappingConstruct && !isListConstruct;
}

export function getTypeName(field: Type): string {
	if (field.typeName === PrimitiveBalType.Record) {
		return field?.typeInfo ? field.typeInfo.name : 'record';
	} else if (field.typeName === PrimitiveBalType.Array) {
		return `${getTypeName(field.memberType)}[]`;
	}
	return field.typeName;
}

export function getDefaultValue(field: Type): string {
	let draftParameter = "";
	switch (field.typeName) {
		case PrimitiveBalType.String:
			draftParameter = `""`;
			break;
		case PrimitiveBalType.Int:
		case PrimitiveBalType.Float:
		case PrimitiveBalType.Decimal:
			draftParameter = `0`;
			break;
		case PrimitiveBalType.Boolean:
			draftParameter = `true`;
			break;
		case PrimitiveBalType.Array:
			draftParameter = `[]`;
			break;
		case PrimitiveBalType.Xml:
			draftParameter = "xml ``";
			break;
		case PrimitiveBalType.Nil:
		case "anydata":
		case "()":
			draftParameter = `()`;
			break;
		case PrimitiveBalType.Record:
		case PrimitiveBalType.Json:
		case "map":
			draftParameter = `{}`;
			break;
		case PrimitiveBalType.Enum:
		case PrimitiveBalType.Union:
			break;
		default:
			draftParameter = `""`;
			break;
	}
	return draftParameter;
}

export function isArrayOrRecord(field: Type) {
	return field.typeName === PrimitiveBalType.Array || field.typeName === PrimitiveBalType.Record;
}

export function getFieldAccessNodes(node: STNode) {
	const fieldAccessFindingVisitor : FieldAccessFindingVisitor = new FieldAccessFindingVisitor();
	traversNode(node, fieldAccessFindingVisitor);
	return fieldAccessFindingVisitor.getFieldAccessNodes();
}

export function getFieldLabel(fieldId: string) {
	const parts = fieldId.split('.').slice(1);
	let fieldLabel = '';
	for (const [i, part] of parts.entries()) {
		if (isNaN(+part)) {
			fieldLabel += i === 0 ? part : `.${part}`;
		} else {
			fieldLabel += `[${part}]`;
		}
	}
	return fieldLabel;
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

function updateValueExprSource(value: string, targetPosition: NodePosition,
							                        applyModifications: (modifications: STModification[]) => void) {
	applyModifications([getModification(value, {
		...targetPosition
	})]);

	return value;
}

function getRHSFromSourcePort(port: PortModel) {
	const sourcePort = port as RecordFieldPortModel;
	let rhs = sourcePort.fieldName ? getBalRecFieldName(sourcePort.fieldName) :  getBalRecFieldName(sourcePort.field.name);
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
