/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { NodeModel } from "@projectstorm/react-diagrams";
import { DMType, TypeKind, Range } from "@wso2-enterprise/mi-core";
import {
    ts,
    ArrowFunction,
    Identifier,
    Node,
    ObjectLiteralExpression,
    ParameterDeclaration,
    PropertyAccessExpression,
    PropertyAssignment
} from "ts-morph";

import { PropertyAccessNodeFindingVisitor } from "../../Visitors/PropertyAccessNodeFindingVisitor";
import { NodePosition, getPosition, isPositionsEquals, traversNode } from "./st-utils";
import { DataMapperNodeModel } from "../Node/commons/DataMapperNode";
import { InputNode, ObjectOutputNode } from "../Node";
import { InputOutputPortModel } from "../Port";
import { ArrayElement, DMTypeWithValue } from "../Mappings/DMTypeWithValue";
import { useDMSearchStore } from "../../../store/store";
import { OBJECT_OUTPUT_TARGET_PORT_PREFIX, PRIMITIVE_TYPE_TARGET_PORT_PREFIX } from "./constants";

export function getPropertyAccessNodes(node: Node): (Identifier | PropertyAccessExpression)[] {
    const propertyAccessNodeVisitor: PropertyAccessNodeFindingVisitor = new PropertyAccessNodeFindingVisitor();
    traversNode(node, propertyAccessNodeVisitor);
    return propertyAccessNodeVisitor.getPropertyAccessNodes();
}

export function findInputNode(expr: Node, dmNode: DataMapperNodeModel) {
    const dmNodes = dmNode.getModel().getNodes();
    let paramType: InputNode;
    let paramNode: ParameterDeclaration;

    if (Node.isIdentifier(expr)) {
        paramType = (dmNodes.find((node) => {
            if (node instanceof InputNode) {
                return node?.value && expr.getText() === node.value.getName();
            }
        }) as InputNode);
        paramNode = paramType?.value;
    } else if (Node.isPropertyAccessExpression(expr)) {
        const valueExpr = getInnerExpr(expr);

        if (valueExpr && Node.isIdentifier(valueExpr)) {
            paramNode = (dmNode.context.functionST.getInitializer() as ArrowFunction).getParameters().find((param) =>
                param.getName() === valueExpr.getText()
            );
        }
    }
    if (paramNode) {
        return findNodeByValueNode(paramNode, dmNode);
    }
}

export function getInputPort(node: InputNode, expr: Node): InputOutputPortModel {
    let typeDesc = node.dmType;
    let portIdBuffer = node?.value && node.value.getName();

    if (typeDesc && typeDesc.kind === TypeKind.Interface) {

        if (Node.isPropertyAccessExpression(expr)) {
            const fieldNames = getFieldNames(expr);
            let nextTypeNode = typeDesc;

            for (let i = 1; i < fieldNames.length; i++) {
                const fieldName = fieldNames[i];
                portIdBuffer += fieldName.isOptional ? `?.${fieldName.name}` : `.${fieldName.name}`;
                const optionalField = getOptionalField(nextTypeNode);
                let fieldType: DMType;

                if (optionalField) {
                    fieldType = optionalField?.fields.find(field => field.fieldName === fieldName.name);
                } else if (nextTypeNode.kind === TypeKind.Interface) {
                    fieldType = nextTypeNode.fields.find(field => field.fieldName === fieldName.name);
                }

                if (fieldType) {
                    if (i === fieldNames.length - 1) {
                        const portId = portIdBuffer + ".OUT";
                        let port = node.getPort(portId) as InputOutputPortModel;

                        while (port && port.hidden) {
                            port = port.parentModel;
                        }
                        return port;
                    } else if (fieldType.kind === TypeKind.Interface) {
                        nextTypeNode = fieldType;
                    }
                }
            }
        } else if (Node.isIdentifier(expr)) {
            return node.getPort(portIdBuffer + ".OUT") as InputOutputPortModel;
        }
    } else if (Node.isIdentifier(expr)) {
        const portId = portIdBuffer + ".OUT";
        let port = node.getPort(portId) as InputOutputPortModel;

        while (port && port.hidden) {
            port = port.parentModel;
        }
        return port;
    }

    return null;
}

export function getOutputPort(
    fields: Node[],
    dmTypeWithValue: DMTypeWithValue,
    portPrefix: string,
    getPort: (portId: string) => InputOutputPortModel
): [InputOutputPortModel, InputOutputPortModel] {

    let portIdBuffer = portPrefix;
    let nextTypeNode = dmTypeWithValue;

    for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        const next = i + 1 < fields.length && fields[i + 1];
        const nextPosition: NodePosition = next ? getPosition(next) : getPosition(field);

        if (Node.isPropertyAssignment(field) && Node.isPropertyAssignment(nextTypeNode.value)) {
            const isLastField = i === fields.length - 1;
            const targetPosition: NodePosition = isLastField
                ? getPosition(nextTypeNode.value)
                : field?.getInitializer() && getPosition(nextTypeNode.value.getInitializer());

            if (isPositionsEquals(targetPosition, nextPosition)
                && field.getInitializer()
                && !Node.isObjectLiteralExpression(field.getInitializer())
            ) {
                portIdBuffer = `${portIdBuffer}.${field.getName()}`;
            }
        } else if (Node.isArrayLiteralExpression(field) && nextTypeNode.elements) {
            const [nextField, fieldIndex] = getNextField(nextTypeNode.elements, nextPosition);

            if (nextField && fieldIndex !== -1) {
                portIdBuffer = `${portIdBuffer}.${fieldIndex}`;
                nextTypeNode = nextField;
            }
        } else {
            if (nextTypeNode.childrenTypes) {
                const fieldIndex = nextTypeNode.childrenTypes.findIndex(recF => {
                    const innerExpr = recF?.value;
                    return innerExpr && isPositionsEquals(nextPosition, getPosition(innerExpr));
                });
                if (fieldIndex !== -1) {
                    portIdBuffer = `${portIdBuffer}${nextTypeNode.originalType?.fieldName ? `.${nextTypeNode.originalType.fieldName}` : ''}`;
                    nextTypeNode = nextTypeNode.childrenTypes[fieldIndex];
                } else if (isPositionsEquals(nextPosition, getPosition(nextTypeNode?.value))) {
                    portIdBuffer = `${portIdBuffer}${nextTypeNode.originalType?.fieldName ? `.${nextTypeNode.originalType.fieldName}` : ''}`;
                }
            } else if (nextTypeNode.elements) {
                const [nextField, fieldIndex] = getNextField(nextTypeNode.elements, nextPosition);

                if (nextField && fieldIndex !== -1) {
                    portIdBuffer = `${portIdBuffer}.${nextField.originalType?.fieldName || ''}`;
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
        && !lastPortIdSegment.toLowerCase().includes(outputSearchValue.toLowerCase())) {
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

export function findNodeByValueNode(value: Node, dmNode: DataMapperNodeModel): InputNode {
    let foundNode: InputNode;
    if (value) {
        dmNode.getModel().getNodes().find((node) => {
            if (value.getKind() === ts.SyntaxKind.Parameter
                && node instanceof InputNode
                && node?.value
                && node.value.getKind() ===  ts.SyntaxKind.Parameter
                && isPositionsEquals(getPosition(value), getPosition(node.value))
            ) {
                foundNode = node;
            }
        });
    }
    return foundNode;
}

export function getFieldNames(expr: PropertyAccessExpression) {
    const fieldNames: { name: string, isOptional: boolean }[] = [];
    let nextExp = expr;
    while (nextExp && Node.isPropertyAccessExpression(nextExp)) {
        fieldNames.push({
            name: nextExp.getName(),
            isOptional: !!nextExp.getQuestionDotTokenNode()
        });
        if (Node.isIdentifier(nextExp.getExpression())) {
            fieldNames.push({
                name: nextExp.getExpression().getText(),
                isOptional: false
            });
        }
        nextExp = Node.isPropertyAccessExpression(nextExp.getExpression())
            ? nextExp.getExpression() as PropertyAccessExpression
            : undefined;
    }
    let isRestOptional = false;
    const processedFieldNames = fieldNames.reverse().map((item) => {
        if (item.isOptional) {
            isRestOptional = true;
        }
        return {
            name: item.name,
            isOptional: isRestOptional || item.isOptional
        };
    });
    return processedFieldNames;
}


export const getOptionalField = (field: DMType): DMType | undefined => {
    if (field.typeName === TypeKind.Interface && field.optional) {
        return field;
    }
}

export function isConnectedViaLink(field: Node) {
	const inputNodes = getPropertyAccessNodes(field);

	const isObjectLiteralExpr = Node.isObjectLiteralExpression(field);
	const isArrayLiteralExpr = Node.isArrayLiteralExpression(field);
	const isIdentifier = Node.isIdentifier(field);

	return (!!inputNodes.length || isIdentifier) && !isObjectLiteralExpr && !isArrayLiteralExpr;
}

export function getDefaultValue(typeKind: TypeKind): string {
	let draftParameter = "";
	switch (typeKind) {
		case TypeKind.String:
			draftParameter = `""`;
			break;
		case TypeKind.Number:
			draftParameter = `0`;
			break;
		case TypeKind.Boolean:
			draftParameter = `true`;
			break;
		case TypeKind.Array:
			draftParameter = `[]`;
			break;
		case TypeKind.Interface:
		case TypeKind.Object:
			draftParameter = `{}`;
			break;
		default:
			draftParameter = `""`;
			break;
	}
	return draftParameter;
}

export function isEmptyValue(position: NodePosition): boolean {
	return position.start === position.end;
}

export function isDefaultValue(fieldType: DMType, value: string): boolean {
	const defaultValue = getDefaultValue(fieldType.kind);
	return defaultValue === value?.trim().replace(/(\r\n|\n|\r|\s)/g, "");
}

export function getFieldIndexes(targetPort: InputOutputPortModel): number[] {
	const fieldIndexes = [];
    const parentPort = targetPort?.parentModel;

	if (targetPort?.index !== undefined) {
		fieldIndexes.push(targetPort.index);
	}

	if (parentPort) {
		fieldIndexes.push(...getFieldIndexes(parentPort));
	}

	return fieldIndexes;
}

export function getFieldNameFromOutputPort(outputPort: InputOutputPortModel): string {
	let fieldName = outputPort.field?.fieldName;
	if (outputPort?.typeWithValue?.originalType) {
		fieldName = outputPort.typeWithValue.originalType?.fieldName;
	}
	return fieldName;
}

export function getPropertyAssignment(objectLitExpr: ObjectLiteralExpression, targetFieldName: string) {
	return objectLitExpr.getProperties()?.find((property) =>
		Node.isPropertyAssignment(property) && property.getName() === targetFieldName
	) as PropertyAssignment;
}

export function getLinebreak(){
	if (navigator.userAgent.indexOf("Windows") !== -1){
		return "\r\n";
	}
	return "\n";
}

export function isConditionalExpression (node: Node): boolean {
	return Node.isConditionalExpression(node)
			|| (Node.isBinaryExpression(node)
                && (node.getOperatorToken().getKind() === ts.SyntaxKind.QuestionQuestionToken
                    || node.getOperatorToken().getKind() === ts.SyntaxKind.AmpersandAmpersandEqualsToken
                    || node.getOperatorToken().getKind() === ts.SyntaxKind.BarBarToken
                ));
}

export function getTargetPortPrefix(node: NodeModel): string {
	switch (true) {
		case node instanceof ObjectOutputNode:
			return OBJECT_OUTPUT_TARGET_PORT_PREFIX;
        // TODO: Update cases for other node types
		default:
			return PRIMITIVE_TYPE_TARGET_PORT_PREFIX;
	}
}

export function getEditorLineAndColumn(node: Node): Range {
    const sourceFile = node.getSourceFile();

    const { line: startLine, column: startColumn } = sourceFile.getLineAndColumnAtPos(node.getStart());
    const { line: endLine, column: endColumn } = sourceFile.getLineAndColumnAtPos(node.getEnd());

    // Subtract 1 from line and column values to match the editor line and column values
    return {
        start: {
            line: startLine - 1,
            column: startColumn - 1
        },
        end: {
            line: endLine - 1,
            column: endColumn - 1
        }
    };
}

function getInnerExpr(node: PropertyAccessExpression): Node {
    let valueExpr = node.getExpression();
    while (valueExpr && Node.isPropertyAccessExpression(valueExpr)) {
        valueExpr = valueExpr.getExpression();
    }
    return valueExpr;
}

function getNextField(
    nextTypeMemberNodes: ArrayElement[],
    nextFieldPosition: NodePosition
): [DMTypeWithValue, number] {

    const fieldIndex = nextTypeMemberNodes.findIndex((node) => {
        const innerExpr = node.member?.value;
        return innerExpr && isPositionsEquals(nextFieldPosition, getPosition(innerExpr));
    });
    if (fieldIndex !== -1) {
        return [nextTypeMemberNodes[fieldIndex].member, fieldIndex];
    }
    return [undefined, undefined];
}
