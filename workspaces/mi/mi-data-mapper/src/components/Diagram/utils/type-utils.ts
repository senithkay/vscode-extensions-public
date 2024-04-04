/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import * as ts from "typescript"
import { DMType, TypeKind } from "@wso2-enterprise/mi-core";

import { DMTypeWithValue } from "../Mappings/DMTypeWithValue";

export function enrichAndProcessType(typeToBeProcessed: DMType, node: ts.Node): [DMTypeWithValue, DMType] {
    let type = {...typeToBeProcessed};
    let valueEnrichedType = getEnrichedDMType(type, node);
    return [valueEnrichedType, type];
}

export function getEnrichedDMType(
    type: DMType,
    node: ts.Node | undefined,
    parentType?: DMTypeWithValue,
    childrenTypes?: DMTypeWithValue[]
): DMTypeWithValue {

    let dmTypeWithValue: DMTypeWithValue;
    let valueNode: ts.Node | undefined;
    let nextNode: ts.Node | undefined;
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
    node: ts.Node | undefined,
    parentType: DMTypeWithValue,
    originalType: DMType
): [ts.Node?, ts.Node?] {

    if (node && ts.isObjectLiteralExpression(node)) {
        const propertyAssignment = node.properties.find((val) =>
            ts.isPropertyAssignment(val)
            && originalType?.fieldName
            && val.name.getText() === originalType?.fieldName
        ) as ts.PropertyAssignment;

        if (parentType.type.typeName === TypeKind.Array) {
            return [node, node];
        } else if (propertyAssignment) {
            return [propertyAssignment, propertyAssignment?.initializer];
        }
    }
    return [undefined, undefined];
}

function addChildrenTypes(
    type: DMType,
    childrenTypes: DMTypeWithValue[] | undefined,
    nextNode: ts.Node | undefined,
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
