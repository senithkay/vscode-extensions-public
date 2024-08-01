/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { FastXSLT } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from "mustache";
import { transformNamespaces } from "../../../commons";

export function getFastXSLTMustacheTemplate() {
    return `
    <fastXSLT {{#description}}description="{{description}}"{{/description}} key="{{key}}"{{#namespaces}} xmlns:{{prefix}}="{{uri}}"{{/namespaces}}/>
    `;
}

export function getFastXSLTXml(data: { [key: string]: any }) {

    if (data.schemaKay?.isExpression) {
        data.key = "{" + data.schemaKay?.value + "}";
        data.namespaces = data.schemaKay?.namespaces;
    } else {
        data.key = data.schemaKay?.value;
    }
    const output = Mustache.render(getFastXSLTMustacheTemplate(), data)?.trim();
    return output;
}

export function getFastXSLTFormDataFromSTNode(data: { [key: string]: any }, node: FastXSLT) {

    if (node.key) {
        const regex = /{([^}]*)}/;
        const match = node.key.match(regex);
        if (match && match.length > 1) {
            data.schemaKay = { isExpression: true, value: match[1], namespaces: transformNamespaces(node.namespaces) };
        } else {
            data.schemaKay = { isExpression: false, value: node.key };
        }
    }
    return data;
}
