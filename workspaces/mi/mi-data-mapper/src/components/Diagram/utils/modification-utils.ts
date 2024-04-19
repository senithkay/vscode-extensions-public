/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { TypeKind } from "@wso2-enterprise/mi-core";
import { ArrayLiteralExpression, Block, Node, ObjectLiteralExpression, ReturnStatement, Type } from "ts-morph";

import { DataMapperLinkModel } from "../Link";
import { InputOutputPortModel, IntermediatePortModel } from "../Port";
import { DataMapperNodeModel } from "../Node/commons/DataMapperNode";
import { getFieldIndexes, getFieldNameFromOutputPort, getLinebreak, getPropertyAssignment } from "./common-utils";
import { LinkConnectorNode, ObjectOutputNode } from "../Node";
import { ExpressionLabelModel } from "../Label";

export async function createSourceForMapping(link: DataMapperLinkModel) {
    if (!link.getSourcePort() || !link.getTargetPort()) {
		return;
	}

    let source = "";
	let lhs = "";
	let rhs = "";

	const sourcePort = link.getSourcePort() as InputOutputPortModel;
	const targetPort = link.getTargetPort() as InputOutputPortModel;
	const targetNode = targetPort.getNode() as DataMapperNodeModel;
	const fieldIndexes = targetPort && getFieldIndexes(targetPort);
	const parentFieldNames: string[] = [];
	const { applyModifications } = targetNode.context;

	rhs = sourcePort.fieldFQN;
	lhs = getFieldNameFromOutputPort(targetPort);

	let objectLitExpr;
	let parent = targetPort.parentModel;
	let fromFieldIndex = -1;

	while (parent != null && parent.parentModel) {
		const parentFieldName = getFieldNameFromOutputPort(parent);
		if (parentFieldName
			&& !(parent.field.kind === TypeKind.Interface && parent.parentModel.field.kind === TypeKind.Array)
		) {
			parentFieldNames.push(parentFieldName);
		}
		parent = parent.parentModel;
	}

	if (targetNode instanceof ObjectOutputNode) {
		if (targetNode.value) {
			const targetExpr = targetNode.value.getExpression();
			if (Node.isObjectLiteralExpression(targetExpr)) {
				objectLitExpr = targetExpr;
			}
		} else {
			// When the return statement is not available in the function body
			const fnBody = targetNode.context.functionST.getBody() as Block;
			fnBody.addStatements([`return {}`]);
			const returnStatement = fnBody.getStatements()
				.find(statement => Node.isReturnStatement(statement)) as ReturnStatement;
			objectLitExpr = returnStatement.getExpression() as ObjectLiteralExpression;
		}
	}

	let targetObjectLitExpr = objectLitExpr;

	if (parentFieldNames.length > 0) {
		const fieldNames = parentFieldNames.reverse();

		for (let i = 0; i < fieldNames.length; i++) {
			const fieldName = fieldNames[i];
			const propAssignment = getPropertyAssignment(objectLitExpr, fieldName);

			if (propAssignment && propAssignment.getInitializer()) {
				const valueExpr = propAssignment.getInitializer();

				if (!valueExpr.getText()) {
					const valueExprSource = constructValueExprSource(lhs, rhs, fieldNames, i);
                    valueExpr.replaceWithText(valueExprSource);
                    applyModifications();
                    return valueExprSource;
				}

				if (Node.isObjectLiteralExpression(valueExpr))  {
					objectLitExpr = valueExpr;
				} else if (Node.isArrayLiteralExpression(valueExpr)
					&& fieldIndexes !== undefined && !!fieldIndexes.length) {
					objectLitExpr = getNextObjectLitExpr(valueExpr);
				}

				if (i === fieldNames.length - 1) {
					targetObjectLitExpr = objectLitExpr;
				}
			} else {
				fromFieldIndex = i;
				targetObjectLitExpr = objectLitExpr;
				break;
			}
		}

		if (fromFieldIndex >= 0 && fromFieldIndex <= fieldNames.length) {
			const missingFields = fieldNames.slice(fromFieldIndex);
			source = createPropAssignment(missingFields);
		} else {
			const propAssignment = getPropertyAssignment(targetObjectLitExpr, lhs);

			if (propAssignment && !propAssignment.getInitializer().getText()) {
				const valueExprSource = constructValueExprSource(lhs, rhs, [], 0);
                propAssignment.getInitializer().replaceWithText(valueExprSource);
                applyModifications();
                return valueExprSource;
			}
			source = `${lhs}: ${rhs}`;
		}
	} else {
		const propAssignment = getPropertyAssignment(targetObjectLitExpr, lhs);

		if (propAssignment && !propAssignment.getInitializer().getText()) {
			const valueExprSource = constructValueExprSource(lhs, rhs, [], 0);
            propAssignment.getInitializer().replaceWithText(valueExprSource);
            applyModifications();
            return valueExprSource;
		}
		source = `${lhs}: ${rhs}`;
	}

	if (targetObjectLitExpr) {
        targetObjectLitExpr.addProperty(writer => {
            writer.writeLine(source);
        });
	} else if (targetNode instanceof ObjectOutputNode) {
        targetNode.value.getExpression().replaceWithText(`{${getLinebreak()}${source}}`);
	}

    applyModifications();

	function createPropAssignment(missingFields: string[]): string {
		return missingFields.length > 0
			? `${missingFields[0]}: {${getLinebreak()}${createPropAssignment(missingFields.slice(1))}}`
			: `${lhs}: ${rhs}`;
	}

	function getNextObjectLitExpr(arrayLitExpr: ArrayLiteralExpression): ObjectLiteralExpression {
		const targetExpr = arrayLitExpr.getElements()[fieldIndexes.pop() * 2];
		if (Node.isObjectLiteralExpression(targetExpr)) {
			return targetExpr;
		} else if (Node.isArrayLiteralExpression(targetExpr)) {
			return getNextObjectLitExpr(targetExpr);
		}
	}

	return `${lhs} = ${rhs}`;
}

function constructValueExprSource(lhs: string, rhs: string, fieldNames: string[], fieldIndex: number) {
	let source = "";

	if (fieldIndex >= 0 && fieldIndex <= fieldNames.length) {
		const missingFields = fieldNames.slice(fieldIndex);
		source = createValueExpr(missingFields, true);
	} else {
		source = rhs;
	}

	function createValueExpr(missingFields: string[], isRoot?: boolean): string {
		return missingFields.length
			? isRoot
				? `{${getLinebreak()}${createValueExpr(missingFields.slice(1))}}`
				: `${missingFields[0]}: {${getLinebreak()}${createValueExpr(missingFields.slice(1))}}`
			: isRoot
				? rhs
				: `${lhs}: ${rhs}`;
	}

	return source;
}

export function modifySourceForMultipleMappings(link: DataMapperLinkModel) {
	const targetPort = link.getTargetPort();
	if (!targetPort) {
		return;
	}

	let rhs = "";
	const sourcePort = link.getSourcePort();
	const targetNode = targetPort.getNode();

	if (sourcePort && sourcePort instanceof InputOutputPortModel) {
		rhs = sourcePort.fieldFQN;
	}

	if (targetNode instanceof LinkConnectorNode) {
		targetNode.updateSource(rhs);
	} else {
		Object.keys(targetPort.getLinks()).forEach((linkId) => {

			if (linkId !== link.getID()) {
				const targerPortLink = targetPort.getLinks()[linkId];
				let valueNode: Node;
	
				if (sourcePort instanceof IntermediatePortModel) {
					if (sourcePort.getParent() instanceof LinkConnectorNode) {
						valueNode = (sourcePort.getParent() as LinkConnectorNode).valueNode;
					}
				} else if (targerPortLink.getLabels().length > 0) {
					valueNode = (targerPortLink.getLabels()[0] as ExpressionLabelModel).valueNode;
				} else if (targetNode instanceof ObjectOutputNode) {
					const linkConnector = targetNode.getModel().getNodes().find(node =>
						node instanceof LinkConnectorNode
						&& node.targetPort.portName === (targerPortLink.getTargetPort() as InputOutputPortModel).portName
					);
					valueNode = (linkConnector as LinkConnectorNode).valueNode;
				}

				const newSource = `${valueNode.getText()} + ${rhs}`;
				valueNode.replaceWithText(newSource);
				(targetNode as DataMapperNodeModel).context.applyModifications();
			}
		});
	}
}
