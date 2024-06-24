/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Query } from "@wso2-enterprise/mi-syntax-tree/src";

export function getDSInputMappingsFromSTNode(data: { [key: string]: any }, node: Query) {
    data.inputMappings = node?.params.map((param) => {
        return [
            param.name,
            "param.query",
            param.paramType,
            param.sqlType,
            "param.defaultValue",
            "param.inOutType",
            param.ordinal,
            !param.optional
        ]
    });
    return data;
}

export function getDSQueryFromSTNode(data: { [key: string]: any }, node: Query) {
    data.queryId = node.id;
    data.sqlQuery = node?.sql?.textNode
    return data;
}

export function getDSTransformationFromSTNode(data: { [key: string]: any }, node: Query) {
    const result = node.result;

    data.rowName = result?.rowName;
    data.xsltPath = result?.xsltPath;
    return data;
}

export function getDSOutputMappingsFromSTNode(data: { [key: string]: any }, node: Query) {
    data.outputMappings = node?.params.map((param) => {
        return [
            param.name,
            "param.query",
            param.paramType,
            param.sqlType,
            "param.defaultValue",
            "param.inOutType",
            param.ordinal,
            !param.optional
        ]
    });
    return data;
}
