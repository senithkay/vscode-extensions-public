import {
	keywords,
	PrimitiveBalType,
	STModification,
	Type
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
	CaptureBindingPattern,
	FieldAccess,
	FromClause,
	FunctionDefinition,
	IdentifierToken,
	LetClause,
	LetVarDecl,
	ListConstructor,
	MappingConstructor,
	NodePosition,
	OptionalFieldAccess,
	QueryExpression,
	RecordField,
	RequiredParam, SimpleNameReference,
	SpecificField,
	STKindChecker,
	STNode,
	traversNode
} from "@wso2-enterprise/syntax-tree";

import { useDMStore } from "../../../store/store";
import { isPositionsEquals } from "../../../utils/st-utils";
import { isArraysSupported } from "../../DataMapper/utils";
import { ExpressionLabelModel } from "../Label";
import { DataMapperLinkModel } from "../Link";
import { ArrayElement, EditableRecordField } from "../Mappings/EditableRecordField";
import { MappingConstructorNode, RequiredParamNode } from "../Node";
import { DataMapperNodeModel, TypeDescriptor } from "../Node/commons/DataMapperNode";
import { FromClauseNode } from "../Node/FromClause";
import { LetClauseNode } from "../Node/LetClause";
import { LinkConnectorNode } from "../Node/LinkConnector";
import { ListConstructorNode } from "../Node/ListConstructor";
import { PrimitiveTypeNode } from "../Node/PrimitiveType";
import { IntermediatePortModel, RecordFieldPortModel } from "../Port";
import { InputNodeFindingVisitor } from "../visitors/InputNodeFindingVisitor";

import {
	EXPANDED_QUERY_SOURCE_PORT_PREFIX,
	LIST_CONSTRUCTOR_TARGET_PORT_PREFIX,
	MAPPING_CONSTRUCTOR_TARGET_PORT_PREFIX,
	PRIMITIVE_TYPE_TARGET_PORT_PREFIX
} from "./constants";
import { getModification } from "./modifications";
import { RecordTypeDescriptorStore } from "./record-type-descriptor-store";

export function getFieldNames(expr: FieldAccess | OptionalFieldAccess) {
	const fieldNames: string[] = [];
	let nextExp: FieldAccess | OptionalFieldAccess = expr;
	while (nextExp && (STKindChecker.isFieldAccess(nextExp) || STKindChecker.isOptionalFieldAccess(nextExp))) {
		fieldNames.push((nextExp.fieldName as SimpleNameReference).name.value);
		if (STKindChecker.isSimpleNameReference(nextExp.expression)) {
			fieldNames.push(nextExp.expression.name.value);
		}
		nextExp = (STKindChecker.isFieldAccess(nextExp.expression) || STKindChecker.isFieldAccess(nextExp.expression))
			? nextExp.expression : undefined;
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

	const sourcePort = link.getSourcePort() as RecordFieldPortModel;
	const targetPort = link.getTargetPort() as RecordFieldPortModel;
	const targetNode = targetPort.getNode() as DataMapperNodeModel;
	const applyModifications = targetNode.context.applyModifications;
	const fieldIndexes = targetPort && getFieldIndexes(targetPort);

	rhs = sourcePort.fieldFQN;

	if (isMappedToPrimitiveTypePort(targetPort)
		|| isMappedToRootListConstructor(targetPort)
		|| isMappedToMappingConstructorWithinArray(targetPort))
	{
		const valuePosition = targetPort.editableRecordField.value.position as NodePosition;
		const isValueEmpty = isEmptyValue(valuePosition);
		if (!isValueEmpty) {
			return updateValueExprSource(rhs, valuePosition, applyModifications);
		}
	} else if (isMappedToSelectClauseExprListConstructor(targetPort)) {
		const exprPosition = (targetPort.editableRecordField.value as QueryExpression)
			.selectClause.expression.position as NodePosition;
		return updateValueExprSource(rhs, exprPosition, applyModifications);
	}

	lhs = getBalRecFieldName(targetPort.field.name);

	// Inserting a new specific field
	let mappingConstruct;
	const parentFieldNames: string[] = [];
	let parent = targetPort.parentModel;
	let fromFieldIdx = -1;

	while (parent != null && parent.parentModel) {
		if (parent.field?.name
			&& !(parent.field.typeName === PrimitiveBalType.Record
				&& parent.parentModel.field.typeName === PrimitiveBalType.Array
				&& !parent.isWithinSelectClause)
		) {
			parentFieldNames.push(parent.field.name);
		}
		parent = parent.parentModel;
	}

	if (targetNode instanceof MappingConstructorNode
		&& STKindChecker.isMappingConstructor(targetNode.value.expression))
	{
		mappingConstruct = targetNode.value.expression;
	} else if (targetNode instanceof ListConstructorNode
		&& STKindChecker.isListConstructor(targetNode.value.expression)
		&& fieldIndexes !== undefined && !!fieldIndexes.length)
	{
		mappingConstruct = getNextMappingConstructor(targetNode.value.expression);
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
					return createValueExprSource(lhs, rhs, fieldNames, i, specificField.colon.position as NodePosition,
												applyModifications);
				}

				if (STKindChecker.isMappingConstructor(valueExpr)) {
					mappingConstruct = valueExpr;
				} else if (STKindChecker.isListConstructor(valueExpr)
					&& fieldIndexes !== undefined && !!fieldIndexes.length) {
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
				return createValueExprSource(lhs, rhs, [], 0, specificField.colon.position as NodePosition,
											applyModifications);
			}
			source = `${lhs}: ${rhs}`;
		}
	} else {
		const specificField = getSpecificField(targetMappingConstruct, lhs);
		if (specificField && !specificField.valueExpr.source) {
			return createValueExprSource(lhs, rhs, [], 0, specificField.colon.position as NodePosition,
										applyModifications);
		}
		source = `${lhs}: ${rhs}`;
	}

	let targetPosition: NodePosition;
	if (targetMappingConstruct) {
		const fieldsAvailable = !!targetMappingConstruct.fields.length;
		if (fieldsAvailable) {
			targetPosition = mappingConstruct.fields[mappingConstruct.fields.length - 1].position as NodePosition;
			source = `,${getLinebreak()}${source}`;
		} else {
			targetPosition = mappingConstruct.openBrace.position as NodePosition;
			source = `${getLinebreak()}${source}`
		}
		targetPosition = {
			...targetPosition,
			startLine: targetPosition.endLine,
			startColumn: targetPosition.endColumn
		}
	} else if (targetNode instanceof MappingConstructorNode) {
		targetPosition = targetNode.value.expression.position as NodePosition;
		source = `{${getLinebreak()}${source}}`;
	}

	modifications.push(getModification(source, targetPosition));
	void applyModifications(modifications);

	function createSpecificField(missingFields: string[]): string {
		return missingFields.length > 0
			? `\t${missingFields[0]}: {${getLinebreak()}${createSpecificField(missingFields.slice(1))}}`
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
												                                   applyModifications: (modifications: STModification[]) => Promise<void>) {

	let source;
	let targetMappingConstructor: STNode = mappingConstruct;
	const parentFields: string[] = [];
	let nextField = field;
	const modifications: STModification[] = [];

	while (nextField && nextField.parentType) {
		const fieldName = nextField.type.name;
		if (fieldName && !(nextField.hasValue() && STKindChecker.isMappingConstructor(nextField.value))) {
			parentFields.push(getBalRecFieldName(fieldName));
		}

		if (nextField.parentType.hasValue() && STKindChecker.isSpecificField(nextField.parentType.value)) {
			const rootField: SpecificField = nextField.parentType.value;

			if (!rootField.valueExpr.source) {
				return createValueExprSource(fieldName, newValue, parentFields.reverse(), 0,
					rootField.colon.position as NodePosition, applyModifications);
			}

			if (STKindChecker.isMappingConstructor(rootField.valueExpr)) {
				const specificField = getSpecificField(rootField.valueExpr, fieldName);
				if (specificField && !specificField.valueExpr.source) {
					return createValueExprSource(fieldName, newValue, parentFields, 1,
						specificField.colon.position as NodePosition, applyModifications);
				}
				source = createSpecificField(parentFields.reverse());
				targetMappingConstructor = rootField.valueExpr;
			} else if (STKindChecker.isListConstructor(rootField.valueExpr)
				&& STKindChecker.isMappingConstructor(rootField.valueExpr.expressions[0])) {
				for (const expr of rootField.valueExpr.expressions) {
					if (STKindChecker.isMappingConstructor(expr)
						&& isPositionsEquals(expr.position as NodePosition, mappingConstruct.position as NodePosition)) {
						const specificField = getSpecificField(expr, fieldName);
						if (specificField && !specificField.valueExpr.source) {
							return createValueExprSource(fieldName, newValue, parentFields, 1,
								specificField.colon.position as NodePosition, applyModifications);
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
		const specificField = STKindChecker.isMappingConstructor(targetMappingConstructor)
			&& getSpecificField(targetMappingConstructor, field.type.name);
		if (specificField && !specificField.valueExpr.source) {
			return createValueExprSource(field.type.name, newValue, parentFields, 1,
				specificField.colon.position as NodePosition, applyModifications);
		}
		source = createSpecificField(parentFields.reverse());
	}

	let targetPosition: NodePosition;
	if (STKindChecker.isMappingConstructor(targetMappingConstructor)) {
		const fieldsAvailable = !!targetMappingConstructor.fields.length;
		if (fieldsAvailable) {
			targetPosition = targetMappingConstructor.fields[targetMappingConstructor.fields.length - 1].position as NodePosition;
			source = `,${source}`;
		} else {
			targetPosition = targetMappingConstructor.openBrace.position as NodePosition;
		}
		targetPosition = {
			...targetPosition,
			startLine: targetPosition.endLine,
			startColumn: targetPosition.endColumn
		}
	} else {
		targetPosition = targetMappingConstructor.position as NodePosition;
		source = `{${getLinebreak()}${source}}`;
	}

	modifications.push(getModification(source, targetPosition));
	await applyModifications(modifications);

	function createSpecificField(missingFields: string[]): string {
		return missingFields.length > 1
			? `\t${missingFields[0]}: {${getLinebreak()}${createSpecificField(missingFields.slice(1))}}`
			: `\t${missingFields[0]}: ${newValue}`;
	}
}

export function modifySpecificFieldSource(link: DataMapperLinkModel) {
	let rhs = "";
	const modifications: STModification[] = [];
	const sourcePort = link.getSourcePort();
	if (sourcePort && sourcePort instanceof RecordFieldPortModel) {
		rhs = sourcePort.fieldFQN;
	}

	if (link.getTargetPort()) {
		const targetPort = link.getTargetPort();
		const targetNode = targetPort.getNode();
		if (targetNode instanceof LinkConnectorNode) {
			targetNode.value = targetNode.value + " + " + rhs;
			targetNode.updateSource();
		}
		else {
			let targetPos: NodePosition;
			Object.keys(targetPort.getLinks()).forEach((linkId) => {
				if (linkId !== link.getID()) {
					const targerPortLink = targetPort.getLinks()[linkId]
					if (sourcePort instanceof IntermediatePortModel) {
						if (sourcePort.getParent() instanceof LinkConnectorNode) {
							targetPos = (sourcePort.getParent() as LinkConnectorNode).valueNode.position as NodePosition
						}
					} else if (targerPortLink.getLabels().length > 0) {
						targetPos = (targerPortLink.getLabels()[0] as ExpressionLabelModel).valueNode.position as NodePosition;
					} else if (targetNode instanceof MappingConstructorNode) {
						const linkConnector = targetNode
							.getModel()
							.getNodes()
							.find(
								(node) =>
									node instanceof LinkConnectorNode &&
									node.targetPort.portName === (targerPortLink.getTargetPort() as RecordFieldPortModel).portName
							);
						targetPos = (linkConnector as LinkConnectorNode).valueNode.position as NodePosition;
					}

				}
			})
			if (targetPos) {
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

				void (targetNode as DataMapperNodeModel).context.applyModifications(modifications)
			}
		}
	}

}

export function findNodeByValueNode(value: RequiredParam | FromClause | LetClause, dmNode: DataMapperNodeModel)
	: RequiredParamNode | FromClauseNode | LetClauseNode {
	let foundNode: RequiredParamNode | FromClauseNode | LetClauseNode;
	dmNode.getModel().getNodes().find((node) => {
		if (((STKindChecker.isRequiredParam(value) && node instanceof RequiredParamNode
			&& STKindChecker.isRequiredParam(node.value))
			|| (STKindChecker.isFromClause(value) && node instanceof FromClauseNode
				&& STKindChecker.isFromClause(node.value))
			|| (STKindChecker.isLetClause(value) && node instanceof LetClauseNode
				&& STKindChecker.isLetClause(node.value)))
			&& isPositionsEquals(value.position as NodePosition, node.value.position as NodePosition)) {
			foundNode = node;
		}
	});
	return foundNode;
}

export function getInputNodeExpr(expr: STNode, dmNode: DataMapperNodeModel) {
	if (STKindChecker.isSimpleNameReference(expr)) {
		const dmNodes = dmNode.getModel().getNodes();
		const paramNode = (dmNodes.find((node) => {
			if (node instanceof LetClauseNode) {
				const letVarDecl = node.value.letVarDeclarations[0] as LetVarDecl;
				const bindingPattern = letVarDecl?.typedBindingPattern?.bindingPattern as CaptureBindingPattern;
				return bindingPattern?.variableName?.value === expr.source.trim();
			} else if (node instanceof RequiredParamNode) {
				return expr.name.value === node.value.paramName.value;
			} else if (node instanceof FromClauseNode) {
				const bindingPattern = node.value.typedBindingPattern.bindingPattern;
				if (STKindChecker.isCaptureBindingPattern(bindingPattern)) {
					return expr.name.value === bindingPattern.variableName.value;
				}
			}
		}) as LetClauseNode | RequiredParamNode | FromClauseNode)?.value;
		if (paramNode) {
			return findNodeByValueNode(paramNode, dmNode);
		}
	} else if (STKindChecker.isFieldAccess(expr) || STKindChecker.isOptionalFieldAccess(expr)) {
		let valueExpr = expr.expression;
		while (valueExpr && (STKindChecker.isFieldAccess(valueExpr)
			|| STKindChecker.isOptionalFieldAccess(valueExpr))) {
			valueExpr = valueExpr.expression;
		}
		if (valueExpr && STKindChecker.isSimpleNameReference(valueExpr)) {
			let paramNode: RequiredParam | FromClause | LetClause =
				dmNode.context.functionST.functionSignature.parameters.find((param) =>
					STKindChecker.isRequiredParam(param)
					&& param.paramName?.value === (valueExpr as SimpleNameReference).name.value
				) as RequiredParam;

			if (!paramNode) {
				// Check if value expression source matches with any of the let clause variable names
				const dmNodes = dmNode.getModel().getNodes();
				paramNode = (dmNodes.find((node) => {
					if (node instanceof LetClauseNode) {
						const letVarDecl = node.value.letVarDeclarations[0] as LetVarDecl;
						const bindingPattern = letVarDecl?.typedBindingPattern?.bindingPattern as CaptureBindingPattern;
						return bindingPattern?.variableName?.value === valueExpr.source;
					}
				}) as LetClauseNode)?.value;
			}

			const selectedST = dmNode.context.selection.selectedST.stNode;
			if (!paramNode) {
				if (STKindChecker.isSpecificField(selectedST) && STKindChecker.isQueryExpression(selectedST.valueExpr)) {
					paramNode = selectedST.valueExpr.queryPipeline.fromClause
				} else if (STKindChecker.isFunctionDefinition(selectedST)
					&& STKindChecker.isExpressionFunctionBody(selectedST.functionBody)
					&& STKindChecker.isQueryExpression(selectedST.functionBody.expression))
				{
					paramNode = selectedST.functionBody.expression.queryPipeline.fromClause;
				}
			}
			return findNodeByValueNode(paramNode, dmNode);
		}
	}
}

export function getInputPortsForExpr(node: RequiredParamNode | FromClauseNode | LetClauseNode, expr: STNode)
	: RecordFieldPortModel {
	const typeDesc = node.typeDef;
	let portIdBuffer = node instanceof RequiredParamNode ? node.value.paramName.value
		: EXPANDED_QUERY_SOURCE_PORT_PREFIX + "."
		+ (node as FromClauseNode).sourceBindingPattern.variableName.value;
	if (typeDesc.typeName === PrimitiveBalType.Record) {
		if (STKindChecker.isFieldAccess(expr) || STKindChecker.isOptionalFieldAccess(expr)) {
			const fieldNames = getFieldNames(expr);
			let nextTypeNode: Type = typeDesc;
			for (let i = 1; i < fieldNames.length; i++) {
				const fieldName = fieldNames[i];
				portIdBuffer += `.${fieldName}`;
				const recField = nextTypeNode.fields.find(
					(field: Type) => getBalRecFieldName(field.name) === fieldName);
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
		} else if (STKindChecker.isSimpleNameReference(expr)){
			return (node.getPort(portIdBuffer + ".OUT") as RecordFieldPortModel);
		}
	} else if (STKindChecker.isSimpleNameReference(expr)) {
		const portId = portIdBuffer + ".OUT";
		let port = (node.getPort(portId) as RecordFieldPortModel);
		while (port && port.hidden) {
			port = port.parentModel;
		}
		return port;
	}
	return null;
}

export function getOutputPortForField(fields: STNode[],
                                      node: MappingConstructorNode | PrimitiveTypeNode | ListConstructorNode)
	: [RecordFieldPortModel, RecordFieldPortModel] {

	let nextTypeNode: EditableRecordField = node.recordField;
	let portIdBuffer: string = '';

	if (node instanceof MappingConstructorNode) {
		portIdBuffer = `${MAPPING_CONSTRUCTOR_TARGET_PORT_PREFIX}`;
	} else if (node instanceof ListConstructorNode) {
		portIdBuffer = `${LIST_CONSTRUCTOR_TARGET_PORT_PREFIX}.${node.rootName}`;
	} else {
		portIdBuffer = PRIMITIVE_TYPE_TARGET_PORT_PREFIX;
	}
	for (let i = 0; i < fields.length; i++) {
		const field = fields[i];
		const next = i + 1 < fields.length && fields[i + 1];
		const nextPosition: NodePosition = next ? next.position : field.position;
		if (STKindChecker.isSpecificField(field) && STKindChecker.isSpecificField(nextTypeNode.value)) {
			const isLastField = i === fields.length - 1;
			const targetPosition: NodePosition = isLastField
				? nextTypeNode.value.position
				: field?.valueExpr && nextTypeNode.value.valueExpr.position;
			if (isPositionsEquals(targetPosition, nextPosition)
				&& field.valueExpr
				&& !STKindChecker.isMappingConstructor(field.valueExpr))
			{
				portIdBuffer = `${portIdBuffer}.${field.fieldName.value}`;
			}
		} else if (STKindChecker.isListConstructor(field) && nextTypeNode.elements) {
			const [nextField, fieldIndex] = getNextField(nextTypeNode.elements, nextPosition);
			if (nextField && fieldIndex !== -1) {
				portIdBuffer = `${portIdBuffer}.${fieldIndex}`;
				nextTypeNode = nextField;
			}
		} else {
			if (nextTypeNode.childrenTypes) {
				const fieldIndex = nextTypeNode.childrenTypes.findIndex(
					(recF) => recF?.value && isPositionsEquals(nextPosition, recF.value.position as NodePosition));
				if (fieldIndex !== -1) {
					portIdBuffer = `${portIdBuffer}${nextTypeNode.type?.name ? `.${nextTypeNode.type.name}` : ''}`;
					nextTypeNode = nextTypeNode.childrenTypes[fieldIndex];
				} else if (isPositionsEquals(nextPosition, nextTypeNode?.value.position)) {
					portIdBuffer = `${portIdBuffer}${nextTypeNode.type?.name ? `.${nextTypeNode.type.name}` : ''}`;
				}
			} else if (nextTypeNode.elements) {
				const [nextField, fieldIndex] = getNextField(nextTypeNode.elements, nextPosition);
				if (nextField && fieldIndex !== -1) {
					portIdBuffer = `${portIdBuffer}.${nextField.type?.name || ''}`;
				}
			}
		}
	}

	const portId = `${portIdBuffer}.IN`;
	const port = (node.getPort(portId) as RecordFieldPortModel);
	let mappedPort = port;
	while (mappedPort && mappedPort.hidden) {
		mappedPort = mappedPort.parentModel;
	}
	return [port, mappedPort];
}

export function getLinebreak(){
	if (navigator.userAgent.indexOf("Windows") !== -1){
		return "\r\n";
	}
	return "\n";
}

function getNextField(nextTypeMemberNodes: ArrayElement[],
                      nextFieldPosition: NodePosition): [EditableRecordField, number] {
	const fieldIndex = nextTypeMemberNodes.findIndex((node) => {
		return node.member?.value && isPositionsEquals(nextFieldPosition, node.member.value.position as NodePosition);
	});
	if (fieldIndex !== -1) {
		return [nextTypeMemberNodes[fieldIndex].member, fieldIndex];
	}
	return [undefined, undefined];
}

export function getEnrichedRecordType(type: Type,
                                      node: STNode,
                                      selectedST: STNode,
                                      parentType?: EditableRecordField,
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
				nextNode = specificField?.valueExpr ? specificField.valueExpr : undefined;
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
		} else if (node && STKindChecker.isFunctionDefinition(selectedST)
			&& STKindChecker.isExpressionFunctionBody(selectedST.functionBody)
			&& isPositionsEquals(selectedST.functionBody.expression.position as NodePosition,
								node.position as NodePosition))
		{
			nextNode = undefined;
		} else {
			valueNode = node;
		}
	} else {
		valueNode = node;
		nextNode = node;
	}

	editableRecordField = new EditableRecordField(type, valueNode, parentType);

	if (type.typeName === PrimitiveBalType.Record) {
		fields = type.fields;
		const children = [...childrenTypes ? childrenTypes : []];
		if (fields && !!fields.length) {
			fields.map((field) => {
				const childType = getEnrichedRecordType(field, nextNode, selectedST, editableRecordField, childrenTypes);
				children.push(childType);
			});
		}
		editableRecordField.childrenTypes = children;
	} else if (type.typeName === PrimitiveBalType.Array && type?.memberType) {
		if (nextNode) {
			if (STKindChecker.isQueryExpression(nextNode)) {
				const selectClauseExpr = nextNode.selectClause.expression;
				if (STKindChecker.isMappingConstructor(selectClauseExpr)) {
					const childType = getEnrichedRecordType(type.memberType, selectClauseExpr,
						selectedST, editableRecordField, childrenTypes);
					editableRecordField.elements = [{
						member: childType,
						elementNode: nextNode
					}];
				} else if (STKindChecker.isListConstructor(selectClauseExpr)) {
					editableRecordField.elements = getEnrichedArrayType(type.memberType, selectClauseExpr,
						selectedST, editableRecordField, undefined, true);
				} else {
					editableRecordField.elements = getEnrichedPrimitiveType(type.memberType, selectClauseExpr,
						selectedST, editableRecordField);
				}
			} else if (STKindChecker.isMappingConstructor(nextNode)) {
				if (type.memberType.typeName === PrimitiveBalType.Record) {
					const childType = getEnrichedRecordType(type.memberType, nextNode,
						selectedST, editableRecordField, childrenTypes);
					editableRecordField.elements = [{
						member: childType,
						elementNode: nextNode
					}];
				}
			} else if (STKindChecker.isListConstructor(nextNode)) {
				editableRecordField.elements = getEnrichedArrayType(type.memberType, nextNode,
					selectedST, editableRecordField);
			} else {
				editableRecordField.elements = getEnrichedPrimitiveType(type.memberType, nextNode,
					selectedST, editableRecordField);
			}
		} else {
			if (type.memberType.typeName === PrimitiveBalType.Record) {
				const members: ArrayElement[] = [];
				const childType = getEnrichedRecordType(type.memberType, undefined,
					selectedST, parentType, childrenTypes);
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

export function getEnrichedPrimitiveType(field: Type,
                                         node: STNode,
                                         selectedST: STNode,
                                         parentType?: EditableRecordField,
                                         childrenTypes?: EditableRecordField[]) {
	const members: ArrayElement[] = [];

	const childType = getEnrichedRecordType(field, node, selectedST, parentType, childrenTypes);

	if (childType) {
		members.push({
			member: childType,
			elementNode: node
		});
	}

	return members;
}

export function getEnrichedArrayType(field: Type,
                                     node: ListConstructor,
                                     selectedST: STNode,
                                     parentType?: EditableRecordField,
                                     childrenTypes?: EditableRecordField[],
                                     isSelectClauseExpr?: boolean) {
	const members: ArrayElement[] = [];

	if (isSelectClauseExpr && field.typeName === PrimitiveBalType.Array) {
		return getEnrichedPrimitiveType(field, node, selectedST, parentType, childrenTypes);
	}

	node.expressions.forEach((expr) => {
		if (!STKindChecker.isCommaToken(expr)) {
			if (field) {
				const childType = getEnrichedRecordType(field, expr, selectedST, parentType, childrenTypes);

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

export function getBalRecFieldName(fieldName: string) {
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
	const inputNodes = getInputNodes(field);

	const isMappingConstruct = STKindChecker.isMappingConstructor(field);
	const isListConstruct = STKindChecker.isListConstructor(field);
	const isQueryExpression = STKindChecker.isQueryExpression(field)
	const isSimpleNameRef = STKindChecker.isSimpleNameReference(field)

	return (!!inputNodes.length || isQueryExpression || isSimpleNameRef)
		&& !isMappingConstruct && !isListConstruct;
}

export function getTypeName(field: Type): string {
	if (!field) {
		return '';
	}
	const importStatements = useDMStore.getState().imports;
	if (field.typeName === PrimitiveBalType.Record) {
		if (field?.typeInfo && importStatements.some(item => item.includes(`${field?.typeInfo?.orgName}/${field.typeInfo.moduleName}`))){
			// If record is from an imported package
			return `${field?.typeInfo?.moduleName}:${field.typeInfo.name}`;
		}
		return field?.typeInfo?.name || 'record';
	} else if (field.typeName === PrimitiveBalType.Array) {
		return `${getTypeName(field.memberType)}[]`;
	} else if (field.typeName === PrimitiveBalType.Union) {
		return field.members?.map(item => getTypeName(item)).join(' | ');
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

export function getInputNodes(node: STNode) {
	const inputNodeFindingVisitor: InputNodeFindingVisitor = new InputNodeFindingVisitor();
	traversNode(node, inputNodeFindingVisitor);
	return inputNodeFindingVisitor.getFieldAccessNodes();
}

export function getFieldName(field: EditableRecordField) {
	return field.type?.name ? getBalRecFieldName(field.type.name) : '';
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

export function getTypeOfValue(editableRecField: EditableRecordField, targetPosition: NodePosition): Type {
	if (editableRecField.hasValue()) {
		if (isPositionsEquals(editableRecField.value.position, targetPosition)) {
			return editableRecField.type;
		} else if (editableRecField.elements) {
			for (const element of editableRecField.elements) {
				const type = getTypeOfValue(element.member, targetPosition);
				if (type) {
					return type;
				}
			}
		} else if (editableRecField.childrenTypes) {
			for (const child of editableRecField.childrenTypes) {
				const type = getTypeOfValue(child, targetPosition);
				if (type) {
					return type;
				}
			}
		}
	}
	return undefined;
}

export function getTypeOfInputParam(param: RequiredParam, balVersion: string): Type {
	const paramPosition = isArraysSupported(balVersion) && param?.paramName
		? param.paramName.position
		: STKindChecker.isQualifiedNameReference(param.typeName)
			? param.typeName.identifier.position
			: param.typeName.position;
	return getTypeFromStore({
		startLine: paramPosition.startLine,
		startColumn: paramPosition.startColumn,
		endLine: paramPosition.startLine,
		endColumn: paramPosition.startColumn
	});
}

export function getTypeOfOutput(typeIdentifier: TypeDescriptor | IdentifierToken, balVersion: string): Type {
	let typeIdentifierPosition = typeIdentifier.position;
	if (!isArraysSupported(balVersion) && STKindChecker.isQualifiedNameReference(typeIdentifier)) {
		typeIdentifierPosition = typeIdentifier.identifier.position;
	}
	return getTypeFromStore({
		startLine: typeIdentifierPosition.startLine,
		startColumn: typeIdentifierPosition.startColumn,
		endLine: typeIdentifierPosition.startLine,
		endColumn: typeIdentifierPosition.startColumn
	});
}

export function getTypeFromStore(position: NodePosition): Type {
	const recordTypeDescriptors = RecordTypeDescriptorStore.getInstance();
	return recordTypeDescriptors.getTypeDescriptor(position);
}

async function createValueExprSource(lhs: string, rhs: string, fieldNames: string[],
									                            fieldIndex: number,
									                            targetPosition: NodePosition,
									                            applyModifications: (modifications: STModification[]) => Promise<void>) {
	let source = "";

	if (fieldIndex >= 0 && fieldIndex <= fieldNames.length) {
		const missingFields = fieldNames.slice(fieldIndex);
		source = createValueExpr(missingFields, true);
	} else {
		source = rhs;
	}

	await applyModifications([getModification(source, {
		...targetPosition,
		startLine: targetPosition.endLine,
		startColumn: targetPosition.endColumn
	})]);

	function createValueExpr(missingFields: string[], isRoot?: boolean): string {
		return missingFields.length
			? isRoot
				? `{${getLinebreak()}${createValueExpr(missingFields.slice(1))}}`
				: `\t${missingFields[0]}: {${getLinebreak()}${createValueExpr(missingFields.slice(1))}}`
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

function getSpecificField(mappingConstruct: MappingConstructor, targetFieldName: string) {
	return mappingConstruct?.fields.find((val) =>
		STKindChecker.isSpecificField(val) && val.fieldName.value === targetFieldName
	) as SpecificField;
}

function isEmptyValue(position: NodePosition): boolean {
	return (position.startLine === position.endLine && position.startColumn === position.endColumn);
}

export function isComplexExpression (node: STNode): boolean {
	return (STKindChecker.isConditionalExpression(node)
			|| (STKindChecker.isBinaryExpression(node) && STKindChecker.isElvisToken(node.operator)))
}

function isMappedToPrimitiveTypePort(targetPort: RecordFieldPortModel): boolean {
	return !isArrayOrRecord(targetPort.field)
		&& targetPort?.editableRecordField?.value
		&& !STKindChecker.isSpecificField(targetPort.editableRecordField.value)
		&& !isEmptyValue(targetPort.editableRecordField.value.position);
}

function isMappedToRootListConstructor(targetPort: RecordFieldPortModel): boolean {
	return !targetPort.parentModel
		&& targetPort.field.typeName === PrimitiveBalType.Array
		&& targetPort?.editableRecordField?.value
		&& STKindChecker.isListConstructor(targetPort.editableRecordField.value);
}

function isMappedToMappingConstructorWithinArray(targetPort: RecordFieldPortModel): boolean {
	return targetPort.index !== undefined
		&& targetPort.field.typeName === PrimitiveBalType.Record
		&& targetPort.editableRecordField?.value
		&& STKindChecker.isMappingConstructor(targetPort.editableRecordField.value);
}

function isMappedToSelectClauseExprListConstructor(targetPort: RecordFieldPortModel): boolean {
	return !targetPort.parentModel
		&& targetPort.field.typeName === PrimitiveBalType.Array
		&& targetPort?.editableRecordField?.value
		&& STKindChecker.isQueryExpression(targetPort.editableRecordField.value)
		&& STKindChecker.isListConstructor(targetPort.editableRecordField.value.selectClause.expression);
}
