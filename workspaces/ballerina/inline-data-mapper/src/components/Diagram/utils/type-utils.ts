/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { ArrayLiteralExpression, Block, FunctionDeclaration, Node, ObjectLiteralExpression, PropertyAssignment, VariableDeclaration } from "ts-morph"
import { IDMType, TypeKind } from "@wso2-enterprise/ballerina-core";

import { ArrayElement, DMTypeWithValue } from "../Mappings/DMTypeWithValue";
import { BallerinaRpcClient } from "@wso2-enterprise/ballerina-rpc-client";

export function enrichAndProcessType(
    typeToBeProcessed: IDMType,
    node: Node
): [DMTypeWithValue, IDMType] {
    let type = { ...typeToBeProcessed };
    let valueEnrichedType = getEnrichedDMType(type, node);
    return [valueEnrichedType, type];
}

export function getDMType(
    propertiesExpr: string,
    parentType: IDMType,
    mapFnIndex?: number,
    isPropeAccessExpr?: boolean
): IDMType {
    /*
        Extract the IDMType from the parent type, corresponding to the given properties expression.
        If the mapFnIndex is undefined, the IDMType of the last property in the properties expression is returned.
        Otherwise, from the already found IDMType, the IDMType of the map function at the given index is returned.
    */
    const properties = getProperties(propertiesExpr, isPropeAccessExpr);

    if (!properties) return;

    let currentType = parentType;

    for (let property of properties) {
        if (!isNaN(Number(property))) continue;
        const field = findField(currentType, property);

        if (!field) return;

        currentType = field;
    }

    if (mapFnIndex !== undefined && currentType.kind === TypeKind.Array) {
        for (let i = 0; i < mapFnIndex; i++) {
            currentType = currentType.memberType;
        }
    }
    return currentType;

    function getProperties(propertiesExpr: string, isPropeAccessExpr?: boolean): string[] | undefined {
        const propertyList = propertiesExpr.match(/(?:[^\s".']|"(?:\\"|[^"])*"|'(?:\\'|[^'])*')+/g) || [];
        return isPropeAccessExpr ? propertyList.slice(1) : propertyList;
    }

    function findField(currentType: IDMType, property: string): IDMType | undefined {
        if (currentType.kind === TypeKind.Record && currentType.fields) {
            return currentType.fields.find(field => field.fieldName === property);
        } else if (currentType.kind === TypeKind.Array && currentType.memberType) {
            return findField(currentType.memberType, property);
        }
        return currentType;
    }
}

export function getDMTypeForRootChaninedMapFunction(
    dmType: IDMType,
    mapFnIndex: number
): IDMType {
    /*
        Find the IDMType corresponding to the the given index.
        The focused map function is a decsendant of the map function defined at the
        return statement of the transformation function
    */
    let currentType = dmType;    
    if (currentType.kind === TypeKind.Array) {
        for (let i = 0; i < mapFnIndex; i++) {
            currentType = currentType.memberType;
        }
    }
    return currentType;
}

export function getDMTypeOfSubMappingItem(
    functionST:FunctionDeclaration,
    subMappingName: string,
    subMappingTypes: Record<string, IDMType>
) {
    const varStmt = (functionST.getBody() as Block).getVariableStatement(subMappingName);

    if (!varStmt) return;

    const varDecl = varStmt.getDeclarations()[0];
    return getTypeForVariable(subMappingTypes, varDecl);
}

export function getTypeForVariable(
    varTypes: Record<string, IDMType | undefined>,
    varDecl: VariableDeclaration,
    subMappingMapFnIndex?: number
): IDMType {
    const key = varDecl.getStart().toString() + varDecl.getEnd().toString();
    let varType = varTypes[key];

    if (subMappingMapFnIndex !== undefined && varType.kind === TypeKind.Array) {
        for (let i = 0; i < subMappingMapFnIndex + 1; i++) {
            varType = varType.memberType;
        }
    }
    return varType;
}

export function getEnrichedDMType(
    type: IDMType,
    node: Node | undefined,
    parentType?: DMTypeWithValue,
    childrenTypes?: DMTypeWithValue[]
): DMTypeWithValue {

    let dmTypeWithValue: DMTypeWithValue;
    let valueNode: Node | undefined;
    let nextNode: Node | undefined;
    let originalType: IDMType = type;

    if (parentType) {
        [valueNode, nextNode] = getValueNodeAndNextNodeForParentType(node, parentType, originalType);
    } else {
        valueNode = node;
        nextNode = node;
    }

    dmTypeWithValue = new DMTypeWithValue(type, valueNode, parentType, originalType);

    if (type.kind === TypeKind.Record) {
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

export async function getSubMappingTypes(
    rpcClient: BallerinaRpcClient,
    filePath: string,
    functionName: string
): Promise<Record<string, IDMType>> {
    // const smTypesResp = await rpcClient
    // .getMiDataMapperRpcClient()
    // .getSubMappingTypes({ filePath, functionName: functionName });

    // return smTypesResp.variableTypes;
    return undefined;
}

function getEnrichedPrimitiveType(
    field: IDMType,
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
    field: IDMType,
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
    originalType: IDMType
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
    type: IDMType,
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
    type: IDMType,
    dmTypeWithValue: DMTypeWithValue,
    childrenTypes?: DMTypeWithValue[]
) {
    if (Node.isObjectLiteralExpression(nextNode)) {
        if (type.memberType.kind === TypeKind.Record) {
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
    type: IDMType,
    parentType: DMTypeWithValue,
    dmTypeWithValue: DMTypeWithValue,
    childrenTypes?: DMTypeWithValue[]
) {
    if (type.memberType.kind === TypeKind.Record) {
        const members: ArrayElement[] = [];
        const childType = getEnrichedDMType(type.memberType, undefined, parentType, childrenTypes);
        members.push({
            member: childType,
            elementNode: undefined
        });
        dmTypeWithValue.elements = members;
    }
}
