/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Node, PropertyAssignment } from "ts-morph"
import { DMType, TypeKind } from "@wso2-enterprise/mi-core";

import { DMTypeWithValue } from "../Mappings/DMTypeWithValue";

export function enrichAndProcessType(typeToBeProcessed: DMType, node: Node): [DMTypeWithValue, DMType] {
    let type = {...typeToBeProcessed};
    let valueEnrichedType = getEnrichedDMType(type, node);
    return [valueEnrichedType, type];
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
        // TODO: Handle enriching array elements
    }

    return dmTypeWithValue;
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

        if (parentType.type.typeName === TypeKind.Array) {
            return [node, node];
        } else if (propertyAssignment) {
            return [propertyAssignment, propertyAssignment?.getInitializer()];
        }
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
