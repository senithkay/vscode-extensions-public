/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { ArrayLiteralExpression, Node, ObjectLiteralExpression, PropertyAssignment } from "ts-morph"
import { DMType, TypeKind } from "@wso2-enterprise/mi-core";

import { ArrayElement, DMTypeWithValue } from "../Mappings/DMTypeWithValue";

export function enrichAndProcessType(typeToBeProcessed: DMType, node: Node): [DMTypeWithValue, DMType] {
    let type = { ...typeToBeProcessed };
    let valueEnrichedType = getEnrichedDMType(type, node);
    return [valueEnrichedType, type];
}

export function getDMType(propertiesExpr: string, parentType: DMType, isPropeAccessExpr?: boolean): DMType {
    const properties = getProperties(propertiesExpr, isPropeAccessExpr);

    if (!properties) return;

    let currentType = parentType;

    for (let property of properties) {
        const field = findField(currentType, property);

        if (!field) return;

        currentType = field;
    }

    return currentType;

    function getProperties(propertiesExpr: string, isPropeAccessExpr?: boolean): string[] | undefined {
        const propertyList = propertiesExpr.split('.');
        return isPropeAccessExpr ? propertyList.slice(1) : propertyList;
    }
    
    function findField(currentType: DMType, property: string): DMType | undefined {
        if (currentType.kind === TypeKind.Interface && currentType.fields) {
            return currentType.fields.find(field => field.fieldName === property);
        } else if (currentType.kind === TypeKind.Array && currentType.memberType
            && currentType.memberType.kind === TypeKind.Interface && currentType.memberType.fields) {
            return currentType.memberType.fields.find(field => field.fieldName === property);
        }
    }
}

export function getEnrichedDMType(
    type: DMType,
    node: Node | undefined,
    parentType?: DMTypeWithValue,
    childrenTypes?: DMTypeWithValue[]
): DMTypeWithValue {

    let dmTypeWithValue: DMTypeWithValue;
    let valueNode: Node | undefined;
    let nextNode: Node | undefined;
    let originalType: DMType = type;

    if (parentType) {
        [valueNode, nextNode] = getValueNodeAndNextNodeForParentType(node, parentType, originalType);
    } else {
        valueNode = node;
        nextNode = node;
    }

    dmTypeWithValue = new DMTypeWithValue(type, valueNode, parentType, originalType);

    if (type.kind === TypeKind.Interface) {
        addChildrenTypes(type, childrenTypes, nextNode, dmTypeWithValue);
    } else if (type.kind === TypeKind.Array && type?.memberType) {
        if (nextNode) {
            addEnrichedArrayElements(nextNode, type, dmTypeWithValue, childrenTypes);
        } else {
            addArrayElements(type, parentType, dmTypeWithValue, childrenTypes);
        }
    }

    return dmTypeWithValue;
}

function getEnrichedPrimitiveType(
    field: DMType,
    node: Node,
    parentType?: DMTypeWithValue,
    childrenTypes?: DMTypeWithValue[]
) {
    const members: ArrayElement[] = [];

    const childType = getEnrichedDMType(field, node, parentType, childrenTypes);

    if (childType) {
        members.push({
            member: childType,
            elementNode: node
        });
    }

    return members;
}

function getEnrichedArrayType(
    field: DMType,
    node: ArrayLiteralExpression,
    parentType?: DMTypeWithValue,
    childrenTypes?: DMTypeWithValue[]
) {
    const members: ArrayElement[] = [];

    const elements = node.getElements();
    const fields = new Array(elements.length).fill(field);

    elements.forEach((expr, index) => {
        const type = fields[index];
        if (type) {
            const childType = getEnrichedDMType(type, expr, parentType, childrenTypes);

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

function getValueNodeAndNextNodeForParentType(
    node: Node | undefined,
    parentType: DMTypeWithValue,
    originalType: DMType
): [Node?, Node?] {

    if (node && Node.isObjectLiteralExpression(node)) {
        const propertyAssignment = node.getProperties().find((val) =>
            Node.isPropertyAssignment(val)
            && originalType?.fieldName
            && val.getName() === originalType?.fieldName
        ) as PropertyAssignment;

        if (parentType.type.kind === TypeKind.Array) {
            return [node, node];
        } else if (propertyAssignment) {
            return [propertyAssignment, propertyAssignment?.getInitializer()];
        }
    } else if (node && Node.isArrayLiteralExpression(node)) {
        const objLitExprs = node.getElements().filter(element =>
            Node.isObjectLiteralExpression(element)
        ) as ObjectLiteralExpression[];

        if (objLitExprs.length > 0) {
            let propertyAssignment: Node;
            for (const expr of objLitExprs) {
                propertyAssignment = expr.getProperties().find(property =>
                    Node.isPropertyAssignment(property)
                    && property.getName() === originalType?.fieldName
                );
            }
            return [propertyAssignment || node, !propertyAssignment && node];
        } else {
            return [node, node];
        }
    } else {
        return [node, undefined];
    }
    return [undefined, undefined];
}

function addChildrenTypes(
    type: DMType,
    childrenTypes: DMTypeWithValue[] | undefined,
    nextNode: Node | undefined,
    dmTypeWithValue: DMTypeWithValue
) {
    const fields = type.fields;
    const children = [...childrenTypes ? childrenTypes : []];
    if (fields && !!fields.length) {
        fields.map((field) => {
            const childType = getEnrichedDMType(field, nextNode, dmTypeWithValue, childrenTypes);
            children.push(childType);
        });
    }
    dmTypeWithValue.childrenTypes = children;
}

function addEnrichedArrayElements(
    nextNode: Node,
    type: DMType,
    dmTypeWithValue: DMTypeWithValue,
    childrenTypes?: DMTypeWithValue[]
) {
    if (Node.isObjectLiteralExpression(nextNode)) {
        if (type.memberType.kind === TypeKind.Interface) {
            const childType = getEnrichedDMType(type.memberType, nextNode, dmTypeWithValue, childrenTypes);
            dmTypeWithValue.elements = [{
                member: childType,
                elementNode: nextNode
            }];
        } else {
            dmTypeWithValue.elements = getEnrichedPrimitiveType(type.memberType, nextNode, dmTypeWithValue);
        }
    } else if (Node.isArrayLiteralExpression(nextNode)) {
        dmTypeWithValue.elements = getEnrichedArrayType(type.memberType, nextNode, dmTypeWithValue);
    } else {
        dmTypeWithValue.elements = getEnrichedPrimitiveType(type.memberType, nextNode, dmTypeWithValue);
    }
}

function addArrayElements(
    type: DMType,
    parentType: DMTypeWithValue,
    dmTypeWithValue: DMTypeWithValue,
    childrenTypes?: DMTypeWithValue[]
) {
    if (type.memberType.kind === TypeKind.Interface) {
        const members: ArrayElement[] = [];
        const childType = getEnrichedDMType(type.memberType, undefined, parentType, childrenTypes);
        members.push({
            member: childType,
            elementNode: undefined
        });
        dmTypeWithValue.elements = members;
    }
}
