/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { NodeModel } from "@projectstorm/react-diagrams";
import {
	AnydataType,
	keywords,
	LinePosition,
	PrimitiveBalType,
	STModification,
	STSymbolInfo,
	Type
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
	CaptureBindingPattern,
	ExpressionFunctionBody,
	FieldAccess,
	FromClause,
	FunctionCall,
	IdentifierToken,
	JoinClause,
	LetClause,
	LetExpression,
	LetVarDecl,
	ListConstructor,
	MappingConstructor,
	MethodCall,
	NodePosition,
	OptionalFieldAccess,
	QueryExpression,
	RequiredParam,
	SimpleNameReference,
	SpecificField,
	STKindChecker,
	STNode,
	traversNode,
	TypeCastExpression
} from "@wso2-enterprise/syntax-tree";

import { useDMSearchStore, useDMStore } from "../../../store/store";
import { isPositionsEquals } from "../../../utils/st-utils";
import { DMNode } from "../../DataMapper/DataMapper";
import { isArraysSupported } from "../../DataMapper/utils";
import { ExpressionLabelModel } from "../Label";
import { DataMapperLinkModel } from "../Link";
import { ArrayElement, EditableRecordField } from "../Mappings/EditableRecordField";
import { FieldAccessToSpecificFied } from "../Mappings/FieldAccessToSpecificFied";
import { MappingConstructorNode, QueryExpressionNode, RequiredParamNode } from "../Node";
import { DataMapperNodeModel, TypeDescriptor } from "../Node/commons/DataMapperNode";
import { ExpandedMappingHeaderNode } from "../Node/ExpandedMappingHeader";
import { FromClauseNode } from "../Node/FromClause";
import { JoinClauseNode } from "../Node/JoinClause";
import { LetClauseNode } from "../Node/LetClause";
import { LetExpressionNode } from "../Node/LetExpression";
import { LinkConnectorNode } from "../Node/LinkConnector";
import { ListConstructorNode } from "../Node/ListConstructor";
import { ModuleVariable, ModuleVariableNode } from "../Node/ModuleVariable";
import { PrimitiveTypeNode } from "../Node/PrimitiveType";
import { UnionTypeNode } from "../Node/UnionType";
import { IntermediatePortModel, RecordFieldPortModel } from "../Port";
import { InputNodeFindingVisitor } from "../visitors/InputNodeFindingVisitor";
import { ModuleVariablesFindingVisitor } from "../visitors/ModuleVariablesFindingVisitor";

import {
	EXPANDED_QUERY_SOURCE_PORT_PREFIX,
	LET_EXPRESSION_SOURCE_PORT_PREFIX,
	LIST_CONSTRUCTOR_TARGET_PORT_PREFIX,
	MAPPING_CONSTRUCTOR_TARGET_PORT_PREFIX,
	MODULE_VARIABLE_SOURCE_PORT_PREFIX,
	PRIMITIVE_TYPE_TARGET_PORT_PREFIX,
	UNION_TYPE_TARGET_PORT_PREFIX,
} from "./constants";
import { FnDefInfo, FunctionDefinitionStore } from "./fn-definition-store";
import { getModification } from "./modifications";
import { TypeDescriptorStore } from "./type-descriptor-store";
import { resolveUnionType } from "./union-type-utils";

export function getFieldNames(expr: FieldAccess | OptionalFieldAccess) {
	const fieldNames: { name: string, isOptional: boolean }[] = [];
	let nextExp: FieldAccess | OptionalFieldAccess = expr;
	while (nextExp && (STKindChecker.isFieldAccess(nextExp) || STKindChecker.isOptionalFieldAccess(nextExp))) {
		if (STKindChecker.isIndexedExpression(nextExp.expression) && STKindChecker.isFieldAccess(nextExp.expression?.containerExpression)) {
			nextExp = nextExp.expression?.containerExpression;
		} else {
			fieldNames.push({ name: (nextExp.fieldName as SimpleNameReference).name.value, isOptional: STKindChecker.isOptionalFieldAccess(nextExp) });
			if (STKindChecker.isSimpleNameReference(nextExp.expression)) {
				fieldNames.push({ name: nextExp.expression.name.value, isOptional: false });
			}
			nextExp = (STKindChecker.isFieldAccess(nextExp.expression) || STKindChecker.isOptionalFieldAccess(nextExp.expression))
				? nextExp.expression : undefined;
		}
	}
	let isRestOptional = false;
	const fieldsToReturn = fieldNames.reverse().map((item) => {
		if (item.isOptional) {
			isRestOptional = true;
		}
		return { name: item.name, isOptional: isRestOptional || item.isOptional };
	});
	return fieldsToReturn
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
		|| isMappedToRootMappingConstructor(targetPort)
		|| isMappedToMappingConstructorWithinArray(targetPort)
		|| isMappedToExprFuncBody(targetPort, targetNode.context.selection.selectedST.stNode)) {
		let targetExpr: STNode;
		if (STKindChecker.isLetExpression(targetPort.editableRecordField.value)) {
			targetExpr = getExprBodyFromLetExpression(targetPort.editableRecordField.value);
		} else if (STKindChecker.isQueryExpression(targetPort.editableRecordField.value)) {
			targetExpr = targetPort.editableRecordField.value?.selectClause.expression;
		} else {
			targetExpr = targetPort.editableRecordField.value;
		}
		const valuePosition = targetExpr.position as NodePosition;
		const isValueEmpty = isEmptyValue(valuePosition);
		if (!isValueEmpty) {
			return updateValueExprSource(rhs, valuePosition, applyModifications);
		}
	} else if (isMappedToSelectClauseExprConstructor(targetPort)) {
		const exprPosition = (targetPort.editableRecordField.value as QueryExpression)
			.selectClause.expression.position as NodePosition;
		return updateValueExprSource(rhs, exprPosition, applyModifications);
	} else if (isMappedToRootUnionType(targetPort)) {
		const exprPosition = (targetPort.getParent() as UnionTypeNode).innermostExpr.position as NodePosition;
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
				&& ([PrimitiveBalType.Array, PrimitiveBalType.Union].includes(parent.parentModel.field.typeName as PrimitiveBalType))
				&& !parent.isWithinSelectClause)
		) {
			parentFieldNames.push(getBalRecFieldName(parent.field.name));
		}
		parent = parent.parentModel;
	}

	if (targetNode instanceof MappingConstructorNode
		|| (targetNode instanceof UnionTypeNode && targetNode.resolvedType.typeName === PrimitiveBalType.Record)) {
		const targetExpr = targetNode.innermostExpr;
		if (STKindChecker.isMappingConstructor(targetExpr)) {
			mappingConstruct = targetExpr;
		} else if (STKindChecker.isLetExpression(targetExpr)) {
			const exprBody = getExprBodyFromLetExpression(targetExpr);
			if (STKindChecker.isMappingConstructor(exprBody)) {
				mappingConstruct = exprBody;
			}
		}
	} else if (targetNode instanceof ListConstructorNode
		|| (targetNode instanceof UnionTypeNode && targetNode.resolvedType.typeName === PrimitiveBalType.Array)) {
		const targetExpr = targetNode.innermostExpr;
		if (STKindChecker.isListConstructor(targetExpr) && fieldIndexes !== undefined && !!fieldIndexes.length) {
			mappingConstruct = getNextMappingConstructor(targetExpr);
		} else if (STKindChecker.isLetExpression(targetExpr)
			&& fieldIndexes !== undefined
			&& !!fieldIndexes.length) {
			const exprBody = getExprBodyFromLetExpression(targetExpr);
			if (STKindChecker.isListConstructor(exprBody)) {
				mappingConstruct = getNextMappingConstructor(exprBody);
			}
		}
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
			const lastField = mappingConstruct.fields[mappingConstruct.fields.length - 1];
			targetPosition = lastField.position as NodePosition;
			source = STKindChecker.isSpecificField(lastField) && isEmptyValue(lastField.position)
				? source
				: `,${getLinebreak()}${source}`;
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
		targetPosition = targetNode.innermostExpr.position as NodePosition;
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
		const innerExpr = getInnermostExpressionBody(targetExpr);
		if (STKindChecker.isMappingConstructor(innerExpr)) {
			return innerExpr;
		} else if (STKindChecker.isListConstructor(innerExpr)) {
			return getNextMappingConstructor(innerExpr);
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
		const fieldName = getFieldName(nextField);
		const innerExpr = nextField.hasValue() && getInnermostExpressionBody(nextField.value);
		if (fieldName && !(innerExpr && STKindChecker.isMappingConstructor(innerExpr))) {
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
			&& getSpecificField(targetMappingConstructor, getFieldName(field));
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
					} else if (targetNode instanceof MappingConstructorNode
						|| targetNode instanceof PrimitiveTypeNode
						|| targetNode instanceof ListConstructorNode)
					{
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

export function findNodeByValueNode(value: STNode,
	                                   dmNode: DataMapperNodeModel
): RequiredParamNode | FromClauseNode | LetClauseNode | JoinClauseNode | LetExpressionNode {
	let foundNode: RequiredParamNode | FromClauseNode | LetClauseNode | JoinClauseNode | LetExpressionNode;
	if (value) {
		dmNode.getModel().getNodes().find((node) => {
			if (((STKindChecker.isRequiredParam(value) && node instanceof RequiredParamNode
				&& STKindChecker.isRequiredParam(node.value))
				|| (STKindChecker.isFromClause(value) && node instanceof FromClauseNode
					&& STKindChecker.isFromClause(node.value))
				|| (STKindChecker.isLetClause(value) && node instanceof LetClauseNode
					&& STKindChecker.isLetClause(node.value))
				|| (STKindChecker.isJoinClause(value) && node instanceof JoinClauseNode
					&& STKindChecker.isJoinClause(node.value))
				|| (STKindChecker.isExpressionFunctionBody(value) && node instanceof LetExpressionNode
					&& STKindChecker.isExpressionFunctionBody(node.value)))
				&& isPositionsEquals(value.position as NodePosition, node.value.position as NodePosition)) {
				foundNode = node;
			}
		});
	}
	return foundNode;
}

export function getInputNodeExpr(expr: STNode, dmNode: DataMapperNodeModel) {
	const dmNodes = dmNode.getModel().getNodes();
	let paramNode: RequiredParam | FromClause | LetClause | JoinClause | ExpressionFunctionBody | Map<string, ModuleVariable>;
	if (STKindChecker.isSimpleNameReference(expr)) {
		paramNode = (dmNodes.find((node) => {
			if (node instanceof LetClauseNode) {
				const letVarDecl = node.value.letVarDeclarations[0] as LetVarDecl;
				const bindingPattern = letVarDecl?.typedBindingPattern?.bindingPattern as CaptureBindingPattern;
				return bindingPattern?.variableName?.value === expr.source.trim();
			} else if (node instanceof LetExpressionNode) {
				return node.letVarDecls.some(decl => decl.varName === expr.source.trim());
			} else if (node instanceof ModuleVariableNode) {
				return node.value.has(expr.source.trim());
			} else if (node instanceof JoinClauseNode) {
				const bindingPattern = (node.value as JoinClause)?.typedBindingPattern?.bindingPattern as CaptureBindingPattern
				return bindingPattern?.source?.trim() === expr.source?.trim()
			} else if (node instanceof RequiredParamNode) {
				return expr.name.value === node.value.paramName.value;
			} else if (node instanceof FromClauseNode) {
				const bindingPattern = node.value.typedBindingPattern.bindingPattern;
				if (STKindChecker.isCaptureBindingPattern(bindingPattern)) {
					return expr.name.value === bindingPattern.variableName.value;
				}
			}
		}) as LetClauseNode | LetExpressionNode | RequiredParamNode | FromClauseNode | ModuleVariableNode)?.value;
	} else if (STKindChecker.isFieldAccess(expr) || STKindChecker.isOptionalFieldAccess(expr)) {
		let valueExpr = expr.expression;
		while (valueExpr && (STKindChecker.isFieldAccess(valueExpr)
			|| STKindChecker.isOptionalFieldAccess(valueExpr))) {
			valueExpr = valueExpr.expression;
		}
		if (valueExpr && STKindChecker.isSimpleNameReference(valueExpr)) {
			paramNode = dmNode.context.functionST.functionSignature.parameters.find((param) =>
					STKindChecker.isRequiredParam(param)
					&& param.paramName?.value === (valueExpr as SimpleNameReference).name.value
				) as RequiredParam;

			if (!paramNode) {
				// Check if value expression source matches with any of the let clause, let expr or module variable names
				paramNode = (dmNodes.find((node) => {
					if (node instanceof LetClauseNode) {
						const letVarDecl = node.value.letVarDeclarations[0] as LetVarDecl;
						const bindingPattern = letVarDecl?.typedBindingPattern?.bindingPattern as CaptureBindingPattern;
						return bindingPattern?.variableName?.value === valueExpr.source;
					} else if (node instanceof LetExpressionNode) {
						return node.letVarDecls.some(decl => {
							if (decl.type.typeName === PrimitiveBalType.Record) {
								return decl.varName === expr.source.trim().split(".")[0]
							}
							return decl.varName === expr.source.trim()
						});
					} else if (node instanceof ModuleVariableNode) {
						return node.moduleVarDecls.some(decl => {
							if (decl.type.typeName === PrimitiveBalType.Record) {
								return decl.varName === expr.source.trim().split(".")[0]
							}
							return decl.varName === expr.source.trim()
						});
					} else if (node instanceof JoinClauseNode) {
						const bindingPattern = (node.value as JoinClause)?.typedBindingPattern?.bindingPattern as CaptureBindingPattern
						return bindingPattern?.source?.trim() === valueExpr.source
					}
				}) as LetClauseNode | JoinClauseNode | LetExpressionNode | ModuleVariableNode)?.value;
			}

			const selectedST = dmNode.context.selection.selectedST.stNode;
			if (!paramNode) {
				if (STKindChecker.isSpecificField(selectedST) && STKindChecker.isQueryExpression(selectedST.valueExpr)) {
					paramNode = selectedST.valueExpr.queryPipeline.fromClause;
				} else if (STKindChecker.isSpecificField(selectedST)
					&& STKindChecker.isBracedExpression(selectedST.valueExpr)
					&& STKindChecker.isQueryExpression(selectedST.valueExpr.expression)) {
					paramNode = selectedST.valueExpr.expression.queryPipeline.fromClause;
				} else if (STKindChecker.isSpecificField(selectedST)
					&& STKindChecker.isIndexedExpression(selectedST.valueExpr)
					&& STKindChecker.isBracedExpression(selectedST.valueExpr.containerExpression)
					&& STKindChecker.isQueryExpression(selectedST.valueExpr.containerExpression.expression)) {
					paramNode = selectedST.valueExpr.containerExpression.expression.queryPipeline.fromClause;
				} else if (STKindChecker.isFunctionDefinition(selectedST)
					&& STKindChecker.isExpressionFunctionBody(selectedST.functionBody)
					&& STKindChecker.isIndexedExpression(selectedST.functionBody.expression)
					&& STKindChecker.isBracedExpression(selectedST.functionBody.expression.containerExpression)
					&& STKindChecker.isQueryExpression(selectedST.functionBody.expression.containerExpression.expression)) {
					paramNode = selectedST.functionBody.expression.containerExpression.expression.queryPipeline.fromClause;
				} else if (STKindChecker.isLetVarDecl(selectedST) && STKindChecker.isQueryExpression(selectedST.expression)) {
					paramNode = selectedST.expression.queryPipeline.fromClause;
				} else if (STKindChecker.isFunctionDefinition(selectedST)
					&& STKindChecker.isExpressionFunctionBody(selectedST.functionBody)) {
					const bodyExpr = STKindChecker.isLetExpression(selectedST.functionBody.expression)
						? getExprBodyFromLetExpression(selectedST.functionBody.expression)
						: selectedST.functionBody.expression;
					if (STKindChecker.isQueryExpression(bodyExpr)) {
						paramNode = bodyExpr.queryPipeline.fromClause;
					}
				}
			}
		}
	}
	if (paramNode) {
		if (paramNode instanceof Map) {
			return dmNodes.find(node => node instanceof ModuleVariableNode) as ModuleVariableNode;
		}
		return findNodeByValueNode(paramNode, dmNode);
	}
}

export function getInputPortsForExpr(node: RequiredParamNode
										 | FromClauseNode
										 | LetClauseNode
										 | JoinClauseNode
										 | LetExpressionNode
										 | ModuleVariableNode,
                                     expr: STNode): RecordFieldPortModel {
	let typeDesc = !(node instanceof LetExpressionNode || node instanceof ModuleVariableNode) && node.typeDef;
	let portIdBuffer;
	if (node instanceof RequiredParamNode) {
		portIdBuffer = node.value.paramName.value
	} else if (node instanceof LetExpressionNode) {
		const varDecl = node.letVarDecls.find(decl => {
			if (decl.type.typeName === PrimitiveBalType.Record) {
				return decl.varName === expr.source.trim().split(".")[0];
			}
			return decl.varName === expr.source.trim()
		});
		typeDesc = varDecl.type;
		portIdBuffer = varDecl && LET_EXPRESSION_SOURCE_PORT_PREFIX + "." + varDecl.varName;
	} else if (node instanceof ModuleVariableNode) {
		const moduleVar = node.moduleVarDecls.find(decl => {
			if (decl.type.typeName === PrimitiveBalType.Record) {
				return decl.varName === expr.source.trim().split(".")[0];
			}
			return decl.varName === expr.source.trim();
		});
		typeDesc = moduleVar.type;
		portIdBuffer = moduleVar && MODULE_VARIABLE_SOURCE_PORT_PREFIX + "." + moduleVar.varName;
	} else {
		portIdBuffer = EXPANDED_QUERY_SOURCE_PORT_PREFIX + "."
			+ (node as FromClauseNode).sourceBindingPattern.variableName.value
	}
	if (typeDesc && typeDesc.typeName === PrimitiveBalType.Record) {
		if (STKindChecker.isFieldAccess(expr) || STKindChecker.isOptionalFieldAccess(expr)) {
			const fieldNames = getFieldNames(expr);
			let nextTypeNode: Type = typeDesc;
			for (let i = 1; i < fieldNames.length; i++) {
				const fieldName = fieldNames[i];
				portIdBuffer += fieldName.isOptional ? `?.${fieldName.name}` : `.${fieldName.name}`;
				let recField: Type;
				const optionalRecordField = getOptionalRecordField(nextTypeNode);
				if (optionalRecordField) {
					recField = optionalRecordField?.fields.find((field: Type) => getBalRecFieldName(field.name) === fieldName.name);
				} else if (nextTypeNode.typeName === PrimitiveBalType.Record) {
					recField = nextTypeNode.fields.find(
						(field: Type) => getBalRecFieldName(field.name) === fieldName.name);
				}

				if (recField) {
					if (i === fieldNames.length - 1) {
						const portId = portIdBuffer + ".OUT";
						let port = (node.getPort(portId) as RecordFieldPortModel);
						while (port && port.hidden) {
							port = port.parentModel;
						}
						return port;
					} else if ([PrimitiveBalType.Record, PrimitiveBalType.Union].includes(recField.typeName as PrimitiveBalType)) {
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
                                      editableRecordField: EditableRecordField,
                                      portPrefix: string,
                                      getPort: (portId: string) => RecordFieldPortModel,
                                      listConstructorRootName?: string): [RecordFieldPortModel, RecordFieldPortModel] {
	let portIdBuffer = `${portPrefix}${listConstructorRootName ? `.${getBalRecFieldName(listConstructorRootName)}` : ''}`;
	let nextTypeNode: EditableRecordField = editableRecordField;

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
				portIdBuffer = `${portIdBuffer}.${getBalRecFieldName(field.fieldName.value)}`;
			}
		} else if (STKindChecker.isListConstructor(field) && nextTypeNode.elements) {
			const [nextField, fieldIndex] = getNextField(nextTypeNode.elements, nextPosition);
			if (nextField && fieldIndex !== -1) {
				portIdBuffer = `${portIdBuffer}.${fieldIndex}`;
				nextTypeNode = nextField;
			}
		} else {
			if (nextTypeNode.childrenTypes) {
				const fieldIndex = nextTypeNode.childrenTypes.findIndex(recF => {
					const innerExpr = recF?.value && getInnermostExpressionBody(recF.value);
					return innerExpr && isPositionsEquals(nextPosition, innerExpr.position as NodePosition);
				});
				if (fieldIndex !== -1) {
					portIdBuffer = `${portIdBuffer}${nextTypeNode.type?.name ? `.${getBalRecFieldName(nextTypeNode.type.name)}` : ''}`;
					nextTypeNode = nextTypeNode.childrenTypes[fieldIndex];
				} else if (isPositionsEquals(nextPosition, nextTypeNode?.value.position)) {
					portIdBuffer = `${portIdBuffer}${nextTypeNode.type?.name ? `.${getBalRecFieldName(nextTypeNode.type.name)}` : ''}`;
				}
			} else if (nextTypeNode.elements) {
				const [nextField, fieldIndex] = getNextField(nextTypeNode.elements, nextPosition);
				if (nextField && fieldIndex !== -1) {
					portIdBuffer = `${portIdBuffer}.${getBalRecFieldName(nextField.type?.name) || ''}`;
				}
			}
		}
	}

	const outputSearchValue = useDMSearchStore.getState().outputSearch;
	const memberAccessRegex = /\.\d+$/;
	const isMemberAccessPattern = memberAccessRegex.test(portIdBuffer);
	const lastPortIdSegment = portIdBuffer.split('.').slice(-1)[0];
	if (outputSearchValue !== ''
		&& !isMemberAccessPattern
		&& !lastPortIdSegment.toLowerCase().includes(outputSearchValue.toLowerCase()))
	{
		return [undefined, undefined];
	}
	const portId = `${portIdBuffer}.IN`;
	const port = getPort(portId);
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
		const innerExpr = node.member?.value && getInnermostExpressionBody(node.member.value);
		return innerExpr && isPositionsEquals(nextFieldPosition, innerExpr.position as NodePosition);
	});
	if (fieldIndex !== -1) {
		return [nextTypeMemberNodes[fieldIndex].member, fieldIndex];
	}
	return [undefined, undefined];
}

export function enrichAndProcessType(typeToBeProcessed: Type, node: STNode,
                                     selectedST: STNode): [EditableRecordField, Type] {
	let type = {...typeToBeProcessed};
	let valueEnrichedType = getEnrichedRecordType(type, node, selectedST);
	const [updatedType, isUpdated] = addMissingTypes(valueEnrichedType);
	if (isUpdated) {
		type = updatedType;
		valueEnrichedType = getEnrichedRecordType(type, node, selectedST);
	}
	const [updatedType2, hasEnrichedWithUnionType] = addResolvedUnionTypes(valueEnrichedType);
	if (hasEnrichedWithUnionType) {
		type = updatedType2;
		valueEnrichedType = getEnrichedRecordType(type, node, selectedST);
	}
	return [valueEnrichedType, type];
}

export function getEnrichedRecordType(type: Type,
                                      node: STNode,
                                      selectedST: STNode,
                                      parentType?: EditableRecordField,
                                      childrenTypes?: EditableRecordField[]): EditableRecordField {
	const innerExpr = getInnermostExpressionBody(node);
	let editableRecordField: EditableRecordField = null;
	let fields: Type[] = null;
	let valueNode: STNode;
	let nextNode: STNode;

	if (type.typeName === PrimitiveBalType.Union && type?.resolvedUnionType) {
		type = !Array.isArray(type.resolvedUnionType) && type.resolvedUnionType;
	}

	if (parentType) {
		if (innerExpr && STKindChecker.isMappingConstructor(innerExpr)) {
			const specificField: SpecificField = innerExpr.fields.find((val) =>
				STKindChecker.isSpecificField(val) && type?.name && val.fieldName.value === getBalRecFieldName(type.name)
			) as SpecificField;
			if (specificField) {
				valueNode = specificField;
				nextNode = specificField?.valueExpr ? specificField.valueExpr : undefined;
			} else if (parentType && parentType.type.typeName === PrimitiveBalType.Array) {
				valueNode = node;
				nextNode = valueNode;
			}
		} else if (innerExpr && STKindChecker.isListConstructor(innerExpr)) {
			const mappingConstructors = innerExpr.expressions.filter((val) =>
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
		} else if (innerExpr && STKindChecker.isFunctionDefinition(selectedST)
			&& STKindChecker.isExpressionFunctionBody(selectedST.functionBody)
			&& isPositionsEquals(selectedST.functionBody.expression.position as NodePosition,
				innerExpr.position as NodePosition))
		{
			nextNode = undefined;
		} else {
			valueNode = node;
		}
	} else {
		valueNode = node;
		nextNode = STKindChecker.isQueryExpression(innerExpr)
			&& STKindChecker.isMappingConstructor(innerExpr.selectClause.expression)
				? innerExpr.selectClause.expression
				: node;
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
			const innerExprOfNextNode = getInnermostExpressionBody(nextNode);
			if (STKindChecker.isQueryExpression(innerExprOfNextNode)) {
				const selectClauseExpr = innerExprOfNextNode.selectClause.expression;
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
			} else if (STKindChecker.isMappingConstructor(innerExprOfNextNode)) {
				if (type.memberType.typeName === PrimitiveBalType.Record) {
					const childType = getEnrichedRecordType(type.memberType, innerExprOfNextNode,
						selectedST, editableRecordField, childrenTypes);
					editableRecordField.elements = [{
						member: childType,
						elementNode: nextNode
					}];
				}
			} else if (STKindChecker.isListConstructor(innerExprOfNextNode)) {
				editableRecordField.elements = getEnrichedArrayType(type.memberType, innerExprOfNextNode,
					selectedST, editableRecordField);
			} else {
				editableRecordField.elements = getEnrichedPrimitiveType(type.memberType, innerExprOfNextNode,
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

	const expressions = node.expressions.filter((expr) => !STKindChecker.isCommaToken(expr));
	const fields = new Array(expressions.length).fill(field);
	if (isSelectClauseExpr && field.typeName === PrimitiveBalType.Array) {
		return getEnrichedPrimitiveType(field, node, selectedST, parentType, childrenTypes);
	} else if (field.typeName === PrimitiveBalType.Union && Array.isArray(field.resolvedUnionType)) {
		field.resolvedUnionType.forEach((type, index) => {
			if (type) {
				fields[index] = type;
			} else {
				fields[index].resolvedUnionType = undefined;
			}
		});
	}

	expressions.forEach((expr, index) => {
		const type = fields[index];
		if (type) {
			const childType = getEnrichedRecordType(type, expr, selectedST, parentType, childrenTypes);

			if (childType) {
				members.push({
					member: childType,
					elementNode: expr
				});
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
	const isQueryExpression = STKindChecker.isQueryExpression(field);
	const isSimpleNameRef = STKindChecker.isSimpleNameReference(field);

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
	} else if (field.typeName === PrimitiveBalType.Array && field?.memberType) {
		const typeName = `${getTypeName(field.memberType)}`;
		return field.memberType.typeName === PrimitiveBalType.Union ? `(${typeName})[]` : `${typeName}[]`;
	} else if (field.typeName === PrimitiveBalType.Union) {
		return field.members?.map(item => getTypeName(item)).join('|');
	}
	return field.typeName;
}

export function getDefaultValue(typeName: string): string {
	let draftParameter = "";
	switch (typeName) {
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

export function getModuleVariables(node: STNode, symbolInfo: STSymbolInfo) {
	const moduleVarFindingVisitor: ModuleVariablesFindingVisitor = new ModuleVariablesFindingVisitor(symbolInfo);
	traversNode(node, moduleVarFindingVisitor);
	return moduleVarFindingVisitor.getModuleVariables();
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
	const recordTypeDescriptors = TypeDescriptorStore.getInstance();
	return recordTypeDescriptors.getTypeDescriptor(position);
}

export function getFnDefFromStore(position: LinePosition): FnDefInfo {
	const functionDefinitionStore = FunctionDefinitionStore.getInstance();
	return functionDefinitionStore.getFnDefinitions(position);
}

export function isEmptyValue(position: NodePosition): boolean {
	return (position.startLine === position.endLine && position.startColumn === position.endColumn);
}

export function getExprBodyFromLetExpression(letExpr: LetExpression): STNode {
	if (STKindChecker.isLetExpression(letExpr.expression)) {
		return getExprBodyFromLetExpression(letExpr.expression);
	}
	return letExpr.expression;
}

export function getExprBodyFromTypeCastExpression(typeCastExpression: TypeCastExpression): STNode {
	if (STKindChecker.isTypeCastExpression(typeCastExpression.expression)) {
		return getExprBodyFromTypeCastExpression(typeCastExpression.expression);
	}
	return typeCastExpression.expression;
}

export function constructTypeFromSTNode(node: STNode, fieldName?: string): Type {
	let type: Type;
	if (STKindChecker.isMappingConstructor(node)) {
		type = {
			typeName: PrimitiveBalType.Record,
			name: fieldName ? fieldName : null,
			fields: (node.fields.filter(field => STKindChecker.isSpecificField(field)) as SpecificField[]).map(field => {
				return constructTypeFromSTNode(field);
			}),
			originalTypeName: AnydataType
		}
	} else if (STKindChecker.isListConstructor(node)) {
		type = {
			typeName: PrimitiveBalType.Array,
			name: fieldName ? fieldName : null,
			originalTypeName: AnydataType
		}
		if (node.expressions.length > 0) {
			type.memberType = constructTypeFromSTNode(node.expressions[0]);
		}
	} else if (STKindChecker.isQueryExpression(node)) {
		type = {
			typeName: PrimitiveBalType.Array,
			name: fieldName ? fieldName : null,
			memberType: constructTypeFromSTNode(node.selectClause.expression)
		}
	} else if (STKindChecker.isSpecificField(node)) {
		const valueExpr = node.valueExpr;
		if (!STKindChecker.isMappingConstructor(valueExpr)
			&& !STKindChecker.isListConstructor(valueExpr)
			&& !STKindChecker.isQueryExpression(valueExpr))
		{
			type = {
				typeName: AnydataType,
				name: node.fieldName.value
			}
		} else {
			return constructTypeFromSTNode(node.valueExpr, node.fieldName.value);
		}
	} else {
		type = {
			typeName: AnydataType
		}
	}

	return type;
}

export function addMissingTypes(field: EditableRecordField): [Type, boolean] {
	let type = { ...field.type };
	const value = field.value;
	let hasTypeUpdated = false;

	if (type.typeName === AnydataType && value) {
		type = constructTypeFromSTNode(value, type?.name);
		hasTypeUpdated = true;
	} else if (type.typeName === PrimitiveBalType.Record) {
		type.fields = field.childrenTypes.map((child) => {
			const [updatedType, isUpdated] = addMissingTypes(child);
			hasTypeUpdated = hasTypeUpdated || isUpdated;
			return updatedType;
		});
	} else if (type.typeName === PrimitiveBalType.Array) {
		if (field?.elements && field.elements.length > 0) {
			const [updatedType, isUpdated] = addMissingTypes(field.elements[0].member);
			hasTypeUpdated = hasTypeUpdated || isUpdated;
			type.memberType = updatedType;
		}
	}

	return [type, hasTypeUpdated];
}

export function addResolvedUnionTypes(field: EditableRecordField): [Type, boolean] {
	const type = { ...field.type };
	const value = field.value;
	let hasTypeUpdated = false;

	if (type.typeName === PrimitiveBalType.Union && value) {
		const resolvedType = resolveUnionType(value, type);
		if (resolvedType) {
			type.resolvedUnionType = resolvedType;
			hasTypeUpdated = true;
		}
	} else if (type.typeName === PrimitiveBalType.Record) {
		type.fields = field.childrenTypes.map((child) => {
			const [updatedType, isUpdated] = addResolvedUnionTypes(child);
			hasTypeUpdated = hasTypeUpdated || isUpdated;
			return updatedType;
		});
	} else if (type.typeName === PrimitiveBalType.Array) {
		if (type.memberType.typeName === PrimitiveBalType.Union && value) {
			type.memberType.resolvedUnionType = field.elements.map(element => {
				const [updatedType, isUpdated] = addResolvedUnionTypes(element.member);
				hasTypeUpdated = hasTypeUpdated || isUpdated;
				element.member.type = updatedType;
				return !Array.isArray(updatedType.resolvedUnionType) && updatedType.resolvedUnionType;
			});
		} else if (field?.elements && field.elements.length > 0) {
			const [updatedType, isUpdated] = addResolvedUnionTypes(field.elements[0].member);
			hasTypeUpdated = hasTypeUpdated || isUpdated;
			type.memberType = updatedType;
		}
	}

	return [type, hasTypeUpdated];
}

export function getPrevOutputType(prevSTNodes: DMNode[], ballerinaVersion: string): Type {
	if (prevSTNodes.length === 0) {
		return undefined;
	}
	const prevST = prevSTNodes[prevSTNodes.length - 1].stNode;
	const prevOutput = STKindChecker.isSpecificField(prevST)
		? prevST.fieldName as IdentifierToken
		: STKindChecker.isFunctionDefinition(prevST)
			? prevST.functionSignature.returnTypeDesc.type
			: undefined;
	const prevOutputType = prevOutput && getTypeOfOutput(prevOutput, ballerinaVersion);
	if (!prevOutputType) {
		return getPrevOutputType(prevSTNodes.slice(0, -1), ballerinaVersion)
	}
	return prevOutputType;
}

export function hasIONodesPresent(nodes: DataMapperNodeModel[]) {
	return nodes.filter(node => !(
		node instanceof LetExpressionNode
		|| node instanceof QueryExpressionNode
		|| node instanceof LinkConnectorNode
		|| node instanceof JoinClauseNode
		|| node instanceof ExpandedMappingHeaderNode
		|| node instanceof LetClauseNode
		|| node instanceof ModuleVariableNode)
	).length >= 2;
}

export function hasNoMatchFound(originalTypeDef: Type, valueEnrichedType: EditableRecordField): boolean {
	const searchValue = useDMSearchStore.getState().outputSearch;
	const filteredTypeDef = valueEnrichedType.type;
	if (!searchValue) {
		return false;
	} else if (originalTypeDef.typeName === PrimitiveBalType.Record && filteredTypeDef.typeName === PrimitiveBalType.Record) {
		return valueEnrichedType?.childrenTypes.length === 0;
	} else if (originalTypeDef.typeName === PrimitiveBalType.Array && filteredTypeDef.typeName === PrimitiveBalType.Array) {
		return hasNoMatchFoundInArray(valueEnrichedType?.elements, searchValue);
	} else if (originalTypeDef.typeName === PrimitiveBalType.Union) {
		if (filteredTypeDef.typeName === PrimitiveBalType.Record) {
			return valueEnrichedType?.childrenTypes.length === 0;
		} else if (filteredTypeDef.typeName === PrimitiveBalType.Array) {
			return hasNoMatchFoundInArray(valueEnrichedType?.elements, searchValue);
		}
	}
	return false;
}

export function getMethodCallElements(methodCall: MethodCall): string[] {
	const { expression } = methodCall;
	const elements: string[] = [];

	if (STKindChecker.isFieldAccess(expression) || STKindChecker.isOptionalFieldAccess(expression)) {
		const fieldNames = getFieldNames(expression).map(item => item.name);
		elements.push(...fieldNames);
	} else if (STKindChecker.isSimpleNameReference(expression)) {
		elements.push(expression.name.value)
	} else if (STKindChecker.isMethodCall(expression)) {
		elements.push(...getMethodCallElements(expression));
	}

	return elements;
}

function hasNoMatchFoundInArray(elements: ArrayElement[], searchValue: string): boolean {
	if (!elements) {
		return false;
	} else if (elements.length === 0) {
		return true;
	}
	return elements.every(element => {
		if (element.member.type.typeName === PrimitiveBalType.Record) {
			return element.member?.childrenTypes.length === 0;
		} else if (element.member.type.typeName === PrimitiveBalType.Array) {
			return element.member.elements && element.member.elements.length === 0
		} else if (element.member.value) {
			const value = element.member.value.value || element.member.value.source;
			return !value.toLowerCase().includes(searchValue.toLowerCase());
		}
	});
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

export function isComplexExpression (node: STNode): boolean {
	return (STKindChecker.isConditionalExpression(node)
			|| (STKindChecker.isBinaryExpression(node) && STKindChecker.isElvisToken(node.operator)))
}

export function getFnDefForFnCall(node: FunctionCall): FnDefInfo {
	const fnCallPosition: LinePosition = {
		line: node.position.startLine,
		offset: node.position.startColumn
	};
	return getFnDefFromStore(fnCallPosition);
}

export function getFilteredMappings(mappings: FieldAccessToSpecificFied[], searchValue: string) {
	return mappings.filter(mapping => {
		if (mapping) {
			const lastField = mapping.fields[mapping.fields.length - 1];
			const fieldName = STKindChecker.isSpecificField(lastField)
				? lastField.fieldName?.value || lastField.fieldName.source
				: lastField.source;
			return searchValue === "" || fieldName.toLowerCase().includes(searchValue.toLowerCase());
		}
	});
}

export function getInnermostExpressionBody(expr: STNode): STNode {
	let innerExpr =	expr;
	if (innerExpr && STKindChecker.isLetExpression(innerExpr)) {
		innerExpr = getExprBodyFromLetExpression(innerExpr);
	}
	if (innerExpr && STKindChecker.isTypeCastExpression(innerExpr)) {
		innerExpr = getExprBodyFromTypeCastExpression(innerExpr);
	}
	return innerExpr;
}

export function getInnermostMemberTypeFromArrayType(arrayType: Type): Type {
	let memberType = arrayType.memberType;
	while (memberType.typeName === PrimitiveBalType.Array) {
		memberType = memberType.memberType;
	}
	return memberType;
}

export function getTargetPortPrefix(node: NodeModel): string {
	switch (true) {
		case node instanceof MappingConstructorNode:
			return MAPPING_CONSTRUCTOR_TARGET_PORT_PREFIX;
		case node instanceof ListConstructorNode:
			return LIST_CONSTRUCTOR_TARGET_PORT_PREFIX;
		case node instanceof PrimitiveTypeNode:
			return PRIMITIVE_TYPE_TARGET_PORT_PREFIX;
		case node instanceof UnionTypeNode:
			const unionTypeNode = node as UnionTypeNode;
			const resolvedType = unionTypeNode.resolvedType;
			if (unionTypeNode.shouldRenderUnionType()) {
				return UNION_TYPE_TARGET_PORT_PREFIX;
			} else if (resolvedType && resolvedType.typeName === PrimitiveBalType.Record) {
				return MAPPING_CONSTRUCTOR_TARGET_PORT_PREFIX;
			} else if (resolvedType && resolvedType.typeName === PrimitiveBalType.Array) {
				return LIST_CONSTRUCTOR_TARGET_PORT_PREFIX;
			} else {
				return PRIMITIVE_TYPE_TARGET_PORT_PREFIX;
			}
		default:
			return PRIMITIVE_TYPE_TARGET_PORT_PREFIX;
	}
}

export function getDiagnosticsPosition(outPortField: EditableRecordField, mapping: FieldAccessToSpecificFied): NodePosition {
	const {type, value: outPortFieldValue} = outPortField;
	const {value: mappedValue, otherVal} = mapping;
	let diagnosticsPosition: NodePosition = (otherVal.position || mappedValue.position) as NodePosition;
	if (type.typeName === PrimitiveBalType.Union && !type?.resolvedUnionType && outPortFieldValue) {
		diagnosticsPosition = outPortFieldValue.position;
	}
	return diagnosticsPosition;
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

function isMappedToRootMappingConstructor(targetPort: RecordFieldPortModel): boolean {
	return !targetPort.parentModel
		&& targetPort.field.typeName === PrimitiveBalType.Record
		&& targetPort?.editableRecordField?.value
		&& STKindChecker.isMappingConstructor(targetPort.editableRecordField.value);
}

function isMappedToRootUnionType(targetPort: RecordFieldPortModel): boolean {
	return !targetPort.parentModel
		&& targetPort.field.typeName === PrimitiveBalType.Union
		&& !targetPort?.editableRecordField;
}

function isMappedToExprFuncBody(targetPort: RecordFieldPortModel, selectedSTNode: STNode): boolean {
	const exprPosition: NodePosition = STKindChecker.isFunctionDefinition(selectedSTNode)
		&& STKindChecker.isExpressionFunctionBody(selectedSTNode.functionBody)
		&& selectedSTNode.functionBody.expression.position;
	return !targetPort.parentModel
		&& targetPort?.editableRecordField?.value
		&& !STKindChecker.isQueryExpression(targetPort.editableRecordField.value)
		&& isPositionsEquals(targetPort?.editableRecordField?.value.position as NodePosition, exprPosition);
}

function isMappedToMappingConstructorWithinArray(targetPort: RecordFieldPortModel): boolean {
	return targetPort.index !== undefined
		&& targetPort.field.typeName === PrimitiveBalType.Record
		&& targetPort.editableRecordField?.value
		&& STKindChecker.isMappingConstructor(getInnermostExpressionBody(targetPort.editableRecordField.value));
}

function isMappedToSelectClauseExprConstructor(targetPort: RecordFieldPortModel): boolean {
	return !targetPort.parentModel
		&& targetPort.field.typeName === PrimitiveBalType.Array
		&& targetPort?.editableRecordField?.value
		&& STKindChecker.isQueryExpression(targetPort.editableRecordField.value)
		&& (STKindChecker.isListConstructor(targetPort.editableRecordField.value.selectClause.expression)
			|| STKindChecker.isMappingConstructor(targetPort.editableRecordField.value.selectClause.expression)
		);
}

export const getOptionalRecordField = (field: Type): Type | undefined => {
	if (PrimitiveBalType.Record === field.typeName && field.optional) {
		return field;
	} else if (PrimitiveBalType.Union === field.typeName) {
		const isSimpleOptionalType = field.members?.some(member => member.typeName === '()');
		if (isSimpleOptionalType && field.members?.length === 2){
			return field.members?.find(member => member.typeName === PrimitiveBalType.Record);
		}
	}
}

export const getOptionalArrayField = (field: Type): Type | undefined => {
	if (PrimitiveBalType.Array === field.typeName && field.optional) {
		return field;
	} else if (PrimitiveBalType.Union === field.typeName) {
		const isSimpleOptionalType = field.members?.some(member => member.typeName === '()');
		if (isSimpleOptionalType && field.members?.length === 2){
			return field.members?.find(member => member.typeName === PrimitiveBalType.Array);
		}
	}
}

/** Filter out error and nill types and return only the types that can be displayed as mapping as target nodes */
export const getFilteredUnionOutputTypes = (type: Type) => type.members?.filter(member => member && !["error", "()"].includes(member.typeName));


export const getNewFieldAdditionModification = (node: STNode, fieldName: string, fieldValue = '') => {
	let insertPosition: NodePosition;
	let modificationStatement = "";
	let mappingConstruct: MappingConstructor;

	if (STKindChecker.isMappingConstructor(node)) {
		mappingConstruct = node;
	} else if (STKindChecker.isSpecificField(node) && STKindChecker.isMappingConstructor(node.valueExpr)) {
		mappingConstruct = node.valueExpr
	}

	if (mappingConstruct) {
		if (mappingConstruct.fields?.length) {
			const lastField = mappingConstruct.fields[mappingConstruct.fields?.length - 1]
			insertPosition = {
				...lastField.position,
				startLine: lastField.position.endLine,
				startColumn: lastField.position.endColumn,
			}
			modificationStatement = `,${getLinebreak()}\t${fieldName}:${fieldValue}${getLinebreak()}`
		} else {
			insertPosition = mappingConstruct.position
			modificationStatement = `{${getLinebreak()}\t${fieldName}:${fieldValue}${getLinebreak()}}`
		}
	}

	if (insertPosition && modificationStatement) {
		return [getModification(modificationStatement, insertPosition)];
	}
}

export const getSearchFilteredInput = (typeDef: Type, varName?: string) => {
	const searchValue = useDMSearchStore.getState().inputSearch;
	if (!searchValue) {
		return typeDef;
	}

	if (varName?.toLowerCase()?.includes(searchValue.toLowerCase())) {
		return typeDef
	} else if (typeDef?.typeName === PrimitiveBalType.Record || typeDef?.typeName === PrimitiveBalType.Array) {
		const filteredRecordType = getFilteredSubFields(typeDef, searchValue);
		if (filteredRecordType) {
			return filteredRecordType
		}
	}
}

export const getFilteredSubFields = (type: Type, searchValue: string) => {
	if (!type) {
		return null;
	}

	if (!searchValue) {
		return type;
	}

	const optionalRecordField = getOptionalRecordField(type);
	if (optionalRecordField && type?.typeName === PrimitiveBalType.Union) {
		const matchedSubFields: Type[] = optionalRecordField?.fields?.map(fieldItem => getFilteredSubFields(fieldItem, searchValue)).filter(fieldItem => fieldItem);
		const matchingName = type?.name?.toLowerCase().includes(searchValue.toLowerCase());
		if (matchingName || matchedSubFields?.length > 0) {
			return {
				...type,
				members: [
					{ ...optionalRecordField, fields: matchingName ? optionalRecordField?.fields : matchedSubFields },
					...type?.members?.filter(member => member.typeName !== PrimitiveBalType.Record)
				]
			};
		}
	} else if (type?.typeName === PrimitiveBalType.Record) {
		const matchedSubFields: Type[] = type?.fields?.map(fieldItem => getFilteredSubFields(fieldItem, searchValue)).filter(fieldItem => fieldItem);
		const matchingName = type?.name?.toLowerCase().includes(searchValue.toLowerCase());
		if (matchingName || matchedSubFields?.length > 0) {
			return {
				...type,
				fields: matchingName ? type?.fields : matchedSubFields
			}
		}
	} else if (type?.typeName === PrimitiveBalType.Array) {
		const matchedSubFields: Type[] = type?.memberType?.fields?.map(fieldItem => getFilteredSubFields(fieldItem, searchValue)).filter(fieldItem => fieldItem);
		const matchingName = type?.name?.toLowerCase().includes(searchValue.toLowerCase());
		if (matchingName || matchedSubFields?.length > 0) {
			return {
				...type,
				memberType: {
					...type?.memberType,
					fields: matchingName ? type?.memberType?.fields : matchedSubFields
				}
			}
		}
	} else {
		return type?.name?.toLowerCase()?.includes(searchValue.toLowerCase()) ? type : null
	}

	return null;
}

export const getSearchFilteredOutput = (type: Type) => {
	const searchValue = useDMSearchStore.getState().outputSearch;
	if (!type) {
		return null
	}
	if (!searchValue) {
		return type;
	}

	let searchType: Type = type;

	if (type?.typeName === PrimitiveBalType.Union) {
		const filteredTypes = getFilteredUnionOutputTypes(type);
		if (filteredTypes?.length === 1) {
			searchType = filteredTypes[0];
		}
	}

	if (searchType.typeName === PrimitiveBalType.Array) {
		const subFields = searchType.memberType?.fields?.map(item => getFilteredSubFields(item, searchValue)).filter(item => item);

		return {
			...searchType,
			memberType: {
				...searchType.memberType,
				fields: subFields || []
			}
		}
	} else if (searchType.typeName === PrimitiveBalType.Record) {
		const subFields = searchType.fields?.map(item => getFilteredSubFields(item, searchValue)).filter(item => item);

		return {
			...searchType,
			fields: subFields || []
		}
	}
	return  null;
}
