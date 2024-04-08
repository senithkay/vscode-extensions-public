/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { DMType, TypeKind } from "@wso2-enterprise/mi-core";
import { ts } from "ts-morph";

import { PropertyAccessNodeFindingVisitor } from "../../Visitors/PropertyAccessNodeFindingVisitor";
import { NodePosition, getPosition, isPositionsEquals, traversNode } from "./st-utils";
import { DataMapperNodeModel } from "../Node/commons/DataMapperNode";
import { InputNode } from "../Node";
import { InputOutputPortModel } from "../Port";
import { ArrayElement, DMTypeWithValue } from "../Mappings/DMTypeWithValue";
import { useDMSearchStore } from "../../../store/store";

export function getPropertyAccessNodes(node: ts.Node) {
    const propertyAccessNodeVisitor: PropertyAccessNodeFindingVisitor = new PropertyAccessNodeFindingVisitor();
    traversNode(node, propertyAccessNodeVisitor);
    return propertyAccessNodeVisitor.getPropertyAccessNodes();
}

export function findInputNode(expr: ts.Node, dmNode: DataMapperNodeModel) {
    const dmNodes = dmNode.getModel().getNodes();
    let paramType: InputNode;
    let paramNode: ts.ParameterDeclaration;

    if (ts.isIdentifier(expr)) {
        paramType = (dmNodes.find((node) => {
            if (node instanceof InputNode) {
                return node?.value && expr.text === node.value.name.getText();
            }
        }) as InputNode);
        paramNode = paramType?.value;
    } else if (ts.isPropertyAccessExpression(expr)) {
        const valueExpr = getInnerExpr(expr);

        if (valueExpr && ts.isIdentifier(valueExpr)) {
            paramNode = (dmNode.context.functionST.initializer as ts.ArrowFunction).parameters.find((param) =>
                param.name.getText() === valueExpr.text
            );
        }
    }
    if (paramNode) {
        return findNodeByValueNode(paramNode, dmNode);
    }
}

export function getInputPort(node: InputNode, expr: ts.Node): InputOutputPortModel {
    let typeDesc = node.dmType;
    let portIdBuffer = node?.value && node.value.name.getText();

    if (typeDesc && typeDesc.kind === TypeKind.Interface) {

        if (ts.isPropertyAccessExpression(expr)) {
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
        } else if (ts.isIdentifier(expr)) {
            return node.getPort(portIdBuffer + ".OUT") as InputOutputPortModel;
        }
    } else if (ts.isIdentifier(expr)) {
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
    fields: ts.Node[],
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

        if (ts.isPropertyAssignment(field) && ts.isPropertyAssignment(nextTypeNode.value)) {
            const isLastField = i === fields.length - 1;
            const targetPosition: NodePosition = isLastField
                ? getPosition(nextTypeNode.value)
                : field?.initializer && getPosition(nextTypeNode.value.initializer);

            if (isPositionsEquals(targetPosition, nextPosition)
                && field.initializer
                && !ts.isObjectLiteralExpression(field.initializer)
            ) {
                portIdBuffer = `${portIdBuffer}.${field.name.getText()}`;
            }
        } else if (ts.isArrayLiteralExpression(field) && nextTypeNode.elements) {
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

export function findNodeByValueNode(value: ts.Node, dmNode: DataMapperNodeModel): InputNode {
    let foundNode: InputNode;
    if (value) {
        dmNode.getModel().getNodes().find((node) => {
            if (ts.isParameter(value)
                && node instanceof InputNode
                && node?.value
                && ts.isParameter(node.value)
                && isPositionsEquals(getPosition(value), getPosition(node.value))
            ) {
                foundNode = node;
            }
        });
    }
    return foundNode;
}

export function getFieldNames(expr: ts.PropertyAccessExpression) {
    const fieldNames: { name: string, isOptional: boolean }[] = [];
    let nextExp = expr;
    while (nextExp && ts.isPropertyAccessExpression(nextExp)) {
        fieldNames.push({
            name: nextExp.name.getText(),
            isOptional: !!nextExp.questionDotToken
        });
        if (ts.isIdentifier(nextExp.expression)) {
            fieldNames.push({
                name: nextExp.expression.getText(),
                isOptional: false
            });
        }
        nextExp = ts.isPropertyAccessExpression(nextExp.expression) ? nextExp.expression : undefined;
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

export function isConnectedViaLink(field: ts.Node) {
	const inputNodes = getPropertyAccessNodes(field);

	const isObjectLiteralExpr = ts.isObjectLiteralExpression(field);
	const isArrayLiteralExpr = ts.isArrayLiteralExpression(field);
	const isIdentifier = ts.isIdentifier(field);

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
	return defaultValue === value?.trim();
}

function getInnerExpr(node: ts.PropertyAccessExpression): ts.Node {
    let valueExpr = node.expression;
    while (valueExpr && ts.isPropertyAccessExpression(valueExpr)) {
        valueExpr = valueExpr.expression;
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
