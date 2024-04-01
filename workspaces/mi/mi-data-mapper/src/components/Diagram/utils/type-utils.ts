/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import * as ts from "typescript"
import { DMType, TypeKind } from "@wso2-enterprise/mi-core";

import { EditableRecordField } from "../Mappings/EditableRecordField";

export function enrichAndProcessType(
    typeToBeProcessed: DMType,
    node: ts.Node,
    selectedST?: ts.Node
): [EditableRecordField, DMType] {

    let type = {...typeToBeProcessed};
    let valueEnrichedType = getEnrichedRecordType(type, node, selectedST);
    return [valueEnrichedType, type];
}

export function getEnrichedRecordType(
    type: DMType,
    node: ts.Node | undefined,
    selectedST?: ts.Node,
    parentType?: EditableRecordField,
    childrenTypes?: EditableRecordField[]
): EditableRecordField {

    let editableRecordField: EditableRecordField;
    let valueNode: ts.Node | undefined;
    let nextNode: ts.Node | undefined;
    let originalType: DMType = type;

    if (parentType) {
        [valueNode, nextNode] = getValueNodeAndNextNodeForParentType(node, parentType, originalType, selectedST);
    } else {
        valueNode = node;
        nextNode = node;
    }

    editableRecordField = new EditableRecordField(type, valueNode, parentType, originalType);

    if (type.kind === TypeKind.Interface) {
        addChildrenTypes(type, childrenTypes, nextNode, selectedST, editableRecordField);
    } else if (type.kind === TypeKind.Array && type?.memberType) {
        // if (nextNode) {
        //     addEnrichedArrayElements(nextNode, type, selectedST, editableRecordField, childrenTypes);
        // } else {
        //     addArrayElements(type, parentType, selectedST, editableRecordField, childrenTypes);
        // }
    }

    return editableRecordField;
}

// export function getEnrichedPrimitiveType(
//     field: DMType,
//     node: ts.Node,
//     selectedST: ts.Node,
//     parentType?: EditableRecordField,
//     childrenTypes?: EditableRecordField[]
// ) {
//     const members: ArrayElement[] = [];

//     const childType = getEnrichedRecordType(field, node, selectedST, parentType, childrenTypes);

//     if (childType) {
//         members.push({
//             member: childType,
//             elementNode: node
//         });
//     }

//     return members;
// }

// export function getEnrichedArrayType(
//     field: DMType,
//     node: ListConstructor,
//     selectedST: ts.Node,
//     parentType?: EditableRecordField,
//     childrenTypes?: EditableRecordField[])
// {
//     const members: ArrayElement[] = [];

//     const expressions = node.expressions.filter((expr) => !STKindChecker.isCommaToken(expr));
//     const fields = new Array(expressions.length).fill(field);

//     expressions.forEach((expr, index) => {
//         const type = fields[index];
//         if (type) {
//             const childType = getEnrichedRecordType(type, expr, selectedST, parentType, childrenTypes);

//             if (childType) {
//                 members.push({
//                     member: childType,
//                     elementNode: expr
//                 });
//             }
//         }
//     });

//     return members;
// }

function getValueNodeAndNextNodeForParentType(
    node: ts.Node | undefined,
    parentType: EditableRecordField,
    originalType: DMType,
    selectedST: ts.Node
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
    // else if (node && STKindChecker.isListConstructor(node)) {
    //     const mappingConstructors = node.expressions.filter((val) =>
    //         STKindChecker.isMappingConstructor(val)
    //     ) as MappingConstructor[];

    //     if (mappingConstructors.length > 0) {
    //         let valueNode: ts.Node;
    //         for (const expr of mappingConstructors) {
    //             valueNode = expr.fields.find(val =>
    //                 STKindChecker.isSpecificField(val) && val.fieldName.value === getBalRecFieldName(originalType?.name)
    //             );
    //         }
    //         return [valueNode || node, !valueNode && node];
    //     } else {
    //         return [node, node];
    //     }
    // } else if (node && STKindChecker.isFunctionDefinition(selectedST)
    //     && STKindChecker.isExpressionFunctionBody(selectedST.functionBody)
    //     && isPositionsEquals(selectedST.functionBody.expression.position as NodePosition,
    //         node.position as NodePosition))
    // {
    //     return [undefined, undefined];
    // } else {
    //     return [node, undefined];
    // }
    return [undefined, undefined];
}

function addChildrenTypes(
    type: DMType,
    childrenTypes: EditableRecordField[] | undefined,
    nextNode: ts.Node | undefined,
    selectedST: ts.Node,
    editableRecordField: EditableRecordField
) {
    const fields = type.fields;
    const children = [...childrenTypes ? childrenTypes : []];
    if (fields && !!fields.length) {
        fields.map((field) => {
            const childType = getEnrichedRecordType(field, nextNode, selectedST, editableRecordField, childrenTypes);
            children.push(childType);
        });
    }
    editableRecordField.childrenTypes = children;
}

// function addEnrichedArrayElements(
//      nextNode: ts.Node | undefined,
//      type: DMType,
//      selectedST: ts.Node,
//      editableRecordField: EditableRecordField,
//      childrenTypes?: EditableRecordField[]
// ) {
    
//     if (STKindChecker.isMappingConstructor(nextNode)) {
//         if (type.memberType.typeName === PrimitiveBalType.Record) {
//             const childType = getEnrichedRecordType(type.memberType, nextNode,
//                 selectedST, editableRecordField, childrenTypes);
//             editableRecordField.elements = [{
//                 member: childType,
//                 elementNode: nextNode
//             }];
//         } else {
//             editableRecordField.elements = getEnrichedPrimitiveType(type.memberType, nextNode,
//                 selectedST, editableRecordField);
//         }
//     } else if (STKindChecker.isListConstructor(nextNode)) {
//         editableRecordField.elements = getEnrichedArrayType(type.memberType, nextNode,
//             selectedST, editableRecordField);
//     } else {
//         editableRecordField.elements = getEnrichedPrimitiveType(type.memberType, nextNode,
//             selectedST, editableRecordField);
//     }
// }

// function addArrayElements(
//     type: DMType,
//     parentType: EditableRecordField | undefined,
//     selectedST: ts.Node,
//     editableRecordField: EditableRecordField,
//     childrenTypes?: EditableRecordField[]
// ) {
//     if (type.memberType.typeName === TypeKind.Interface) {
//         const members: ArrayElement[] = [];
//         const childType = getEnrichedRecordType(type.memberType, undefined,
//             selectedST, parentType, childrenTypes);
//         members.push({
//             member: childType,
//             elementNode: undefined
//         });
//         editableRecordField.elements = members;
//     }
// }
