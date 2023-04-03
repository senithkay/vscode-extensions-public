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

import { PrimitiveBalType, Type } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
	STKindChecker,
	STNode
} from "@wso2-enterprise/syntax-tree";

import { TypeDescriptor } from "../Node/commons/DataMapperNode";

import { getTypeName } from "./dm-utils";

export function getResolvedType(type: Type, typeDesc: TypeDescriptor): Type {
	if (type.typeName === PrimitiveBalType.Array && STKindChecker.isArrayTypeDesc(typeDesc)) {
		const dimensions = typeDesc.dimensions.length;
		let memberType = type;
		for (let i = 0; i < dimensions; i++) {
			memberType = memberType?.memberType ? memberType.memberType : undefined;
		}
		if (memberType && isTypesMatched(memberType, typeDesc, dimensions)) {
			return type;
		}
	} else if (type.typeName === PrimitiveBalType.Union) {
		for (const member of type.members) {
			if (member.typeName === PrimitiveBalType.Union) {
				getResolvedType(member, typeDesc);
			} else if (isTypesMatched(member, typeDesc)) {
				return member;
			}
		}
	} else if (isTypesMatched(type, typeDesc)) {
		return type;
	}
}

export function getUnsupportedTypes(typeDesc: STNode): string[] {
	const unsupportedTypes: string[] = [];
	if (STKindChecker.isUnionTypeDesc(typeDesc)) {
		const { leftTypeDesc, rightTypeDesc } = typeDesc;
		unsupportedTypes.push(...getUnsupportedTypes(leftTypeDesc), ...getUnsupportedTypes(rightTypeDesc));
	} else if (STKindChecker.isArrayTypeDesc(typeDesc)) {
		const filteredTypes = getUnsupportedTypes(typeDesc.memberTypeDesc).map(type => `${type}[]`);
		unsupportedTypes.push(...filteredTypes);
	} else if (STKindChecker.isParenthesisedTypeDesc(typeDesc)) {
		unsupportedTypes.push(...getUnsupportedTypes(typeDesc.typedesc));
	} else if (isUnsupportedType(typeDesc)) {
		unsupportedTypes.push(typeDesc.source);
	}
	return unsupportedTypes;
}

export function getSupportedUnionTypes(typeDesc: STNode, typeDef: Type): string[] {
	const unsupportedTypes = getUnsupportedTypes(typeDesc);
	const allUnionTypes = getTypeName(typeDef).split("|");

	const filteredTypes = allUnionTypes.map(unionType => {
		const type = unionType.trim();
		if (!unsupportedTypes.includes(type) && type !== "()" && type !== "error") {
			return type;
		}
	}).filter(type => type !== undefined);

	return Array.from(new Set(filteredTypes));
}

function isUnsupportedType(typeDesc: STNode): boolean {
	return STKindChecker.isByteTypeDesc(typeDesc)
		|| STKindChecker.isDistinctTypeDesc(typeDesc)
		|| STKindChecker.isFunctionTypeDesc(typeDesc)
		|| STKindChecker.isFutureTypeDesc(typeDesc)
		|| STKindChecker.isHandleTypeDesc(typeDesc)
		|| STKindChecker.isIntersectionTypeDesc(typeDesc)
		|| STKindChecker.isJsonTypeDesc(typeDesc)
		|| STKindChecker.isMapTypeDesc(typeDesc)
		|| STKindChecker.isNeverTypeDesc(typeDesc)
		|| STKindChecker.isNilTypeDesc(typeDesc)
		|| STKindChecker.isObjectTypeDesc(typeDesc)
		|| STKindChecker.isReadonlyTypeDesc(typeDesc)
		|| STKindChecker.isSingletonTypeDesc(typeDesc)
		|| STKindChecker.isStreamTypeDesc(typeDesc)
		|| STKindChecker.isTableTypeDesc(typeDesc)
		|| STKindChecker.isTupleTypeDesc(typeDesc)
		|| STKindChecker.isTypedescTypeDesc(typeDesc)
		|| STKindChecker.isXmlTypeDesc(typeDesc)
		|| typeDesc?.typeData?.symbol?.definition?.kind === "ENUM";
}

function isTypesMatched(type: Type, typeDesc: TypeDescriptor, dimensions?: number): boolean {
	const typeName = type?.name
		? `${type.name}${dimensions ? '[]'.repeat(dimensions) : ''}`
		: `${type.typeName}${dimensions ? '[]'.repeat(dimensions) : ''}`;

	return typeName === typeDesc.source;
}
