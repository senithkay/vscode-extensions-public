/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Expression } from 'ts-morph';
import { DMType, TypeKind } from '@wso2-enterprise/mi-core';

import { ArrayOutputNode, ObjectOutputNode, PrimitiveOutputNode } from '../Node';
import { DataMapperContext } from '../../../utils/DataMapperContext/DataMapperContext';

type SubMappingOutputNode = ArrayOutputNode | ObjectOutputNode | PrimitiveOutputNode;

export function getSubMappingOutputNode(
    context: DataMapperContext,
    initializer: Expression,
    outputType: DMType
): SubMappingOutputNode {
    if (outputType.kind === TypeKind.Interface || outputType.kind === TypeKind.Object) {
        return new ObjectOutputNode(context, initializer, outputType);
    } else if (outputType.kind === TypeKind.Array) {
        return new ArrayOutputNode(context, initializer, outputType);
    }
    return new PrimitiveOutputNode(context, initializer, outputType);
}
