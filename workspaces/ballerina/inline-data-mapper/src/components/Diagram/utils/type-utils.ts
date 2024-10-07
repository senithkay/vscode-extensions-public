/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
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
        // [valueNode, nextNode] = getValueNodeAndNextNodeForParentType(node, parentType, originalType);
    } else {
        valueNode = node;
        nextNode = node;
    }

    dmTypeWithValue = new DMTypeWithValue(type, undefined, parentType, originalType);

    if (type.kind === TypeKind.Record) {
        addChildrenTypes(type, childrenTypes, nextNode, dmTypeWithValue);
    } else if (type.kind === TypeKind.Array && type?.memberType) {
        if (nextNode) {
            // addEnrichedArrayElements(nextNode, type, dmTypeWithValue, childrenTypes);
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
            elementNode: undefined
        });
    }

    return members;
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
