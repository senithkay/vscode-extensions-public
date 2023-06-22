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
import { AnydataType, PrimitiveBalType, Type } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    ListConstructor,
    MappingConstructor,
    NodePosition,
    SpecificField,
    STKindChecker,
    STNode
} from "@wso2-enterprise/syntax-tree";

import { isPositionsEquals } from "../../../utils/st-utils";
import { ArrayElement, EditableRecordField } from "../Mappings/EditableRecordField";

import {
    getBalRecFieldName,
    getInnermostExpressionBody
} from "./dm-utils";
import { resolveUnionType } from "./union-type-utils";

export function enrichAndProcessType(typeToBeProcessed: Type, node: STNode,
                                     selectedST: STNode): [EditableRecordField, Type] {
    let type = {...typeToBeProcessed};
    let valueEnrichedType = getEnrichedRecordType(type, node, selectedST);
    const [updatedType, isUpdated] = addMissingTypes(valueEnrichedType);
    if (isUpdated) {
        type = updatedType;
        valueEnrichedType = getEnrichedRecordType(type, node, selectedST);
    }
    return [valueEnrichedType, type];
}

export function getEnrichedRecordType(type: Type,
                                      node: STNode,
                                      selectedST: STNode,
                                      parentType?: EditableRecordField,
                                      childrenTypes?: EditableRecordField[]): EditableRecordField {
    let editableRecordField: EditableRecordField = null;
    let valueNode: STNode;
    let nextNode: STNode;
    let originalType: Type = type;

    if (type.typeName === PrimitiveBalType.Union && type?.resolvedUnionType && !Array.isArray(type?.resolvedUnionType)) {
        originalType = type;
        type = type.resolvedUnionType;
    }

    if (parentType) {
        [valueNode, nextNode] = getValueNodeAndNextNodeForParentType(node, parentType, originalType, selectedST);
    } else {
        valueNode = node;
        nextNode = getNextNodeForNoParentType(node);
    }

    editableRecordField = new EditableRecordField(type, valueNode, parentType, originalType);

    if (type.typeName === PrimitiveBalType.Record) {
        addChildrenTypes(type, childrenTypes, nextNode, selectedST, editableRecordField);
    } else if (type.typeName === PrimitiveBalType.Array && type?.memberType) {
        if (nextNode) {
            addEnrichedArrayElements(nextNode, type, selectedST, editableRecordField, childrenTypes);
        } else {
            addArrayElements(type, parentType, selectedST, editableRecordField, childrenTypes);
        }
    }

    const [updatedType, hasEnrichedWithUnionType] = addResolvedUnionTypes(editableRecordField)
    if (hasEnrichedWithUnionType) {
        type = updatedType;
        editableRecordField = getEnrichedRecordType(type, node, selectedST, parentType, childrenTypes);
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

function getValueNodeAndNextNodeForParentType(node: STNode,
                                              parentType: EditableRecordField,
                                              originalType: Type,
                                              selectedST: STNode): [STNode, STNode] {
    const innerExpr = getInnermostExpressionBody(node);
    if (innerExpr && STKindChecker.isMappingConstructor(innerExpr)) {
        const specificField: SpecificField = innerExpr.fields.find((val) =>
            STKindChecker.isSpecificField(val)
            && originalType?.name
            && val.fieldName.value === getBalRecFieldName(originalType.name)
        ) as SpecificField;

        if (specificField) {
            return [specificField, specificField?.valueExpr];
        } else if (parentType.type.typeName === PrimitiveBalType.Array) {
            return [node, node];
        }
    } else if (innerExpr && STKindChecker.isListConstructor(innerExpr)) {
        const mappingConstructors = innerExpr.expressions.filter((val) =>
            STKindChecker.isMappingConstructor(val)
        ) as MappingConstructor[];

        if (mappingConstructors.length > 0) {
            let valueNode: STNode;
            for (const expr of mappingConstructors) {
                valueNode = expr.fields.find(val =>
                    STKindChecker.isSpecificField(val) && val.fieldName.value === getBalRecFieldName(originalType?.name)
                );
            }
            return [valueNode || node, !valueNode && node];
        } else {
            return [node, node];
        }
    } else if (innerExpr && STKindChecker.isFunctionDefinition(selectedST)
        && STKindChecker.isExpressionFunctionBody(selectedST.functionBody)
        && isPositionsEquals(selectedST.functionBody.expression.position as NodePosition,
            innerExpr.position as NodePosition))
    {
        return [undefined, undefined];
    } else {
        return [node, undefined];
    }
    return [undefined, undefined];
}

function getNextNodeForNoParentType(node: STNode): STNode {
    const innerExpr = getInnermostExpressionBody(node);
    return STKindChecker.isQueryExpression(innerExpr)
    && STKindChecker.isMappingConstructor(innerExpr.selectClause.expression)
        ? innerExpr.selectClause.expression
        : node;
}

function addChildrenTypes(type: Type,
                          childrenTypes: EditableRecordField[],
                          nextNode: STNode,
                          selectedST: STNode,
                          editableRecordField: EditableRecordField) {
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

function addEnrichedArrayElements(nextNode: STNode,
                                  type: Type,
                                  selectedST: STNode,
                                  editableRecordField: EditableRecordField,
                                  childrenTypes?: EditableRecordField[]) {
    const innerExpr = getInnermostExpressionBody(nextNode);

    if (STKindChecker.isQueryExpression(innerExpr)) {
        const selectClauseExpr = innerExpr.selectClause.expression;

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
    } else if (STKindChecker.isMappingConstructor(innerExpr)) {
        if (type.memberType.typeName === PrimitiveBalType.Record) {
            const childType = getEnrichedRecordType(type.memberType, innerExpr,
                selectedST, editableRecordField, childrenTypes);
            editableRecordField.elements = [{
                member: childType,
                elementNode: nextNode
            }];
        } else {
            editableRecordField.elements = getEnrichedPrimitiveType(type.memberType, innerExpr,
                selectedST, editableRecordField);
        }
    } else if (STKindChecker.isListConstructor(innerExpr)) {
        editableRecordField.elements = getEnrichedArrayType(type.memberType, innerExpr,
            selectedST, editableRecordField);
    } else {
        editableRecordField.elements = getEnrichedPrimitiveType(type.memberType, innerExpr,
            selectedST, editableRecordField);
    }
}

function addArrayElements(type: Type,
                          parentType: EditableRecordField,
                          selectedST: STNode,
                          editableRecordField: EditableRecordField,
                          childrenTypes?: EditableRecordField[]) {
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
