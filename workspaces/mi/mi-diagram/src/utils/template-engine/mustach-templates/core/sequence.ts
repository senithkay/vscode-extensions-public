/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { FilterSequence } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from "mustache";
import { transformNamespaces } from "../../../commons";

export function getSequenceMustacheTemplate() {
    return `<sequence {{#referringSequence}}key="{{{value}}}"{{#namespaces}} xmlns:{{{prefix}}}="{{{uri}}}"{{/namespaces}}{{/referringSequence}} {{#description}}description="{{description}}"{{/description}}/>`;
}

export function getSequenceXml(data: { [key: string]: any }) {

    if (data.referringSequence?.isExpression) {
        data.referringSequence.value = "{" + data.referringSequence.value + "}";
    } else {
        data.referringSequence.value = data.referringSequence.value;
    }
    return Mustache.render(getSequenceMustacheTemplate(), data);
}

export function getSequenceDataFromSTNode(data: { [key: string]: any }, node: FilterSequence) {
    let isExpression = node.key?.startsWith("{") && node.key?.endsWith("}");
    let value = node.key;
    if (isExpression) {
        value = node.key?.substring(1, node.key?.length - 1);
    }
    data.referringSequence = { isExpression: isExpression, value: value, namespaces: transformNamespaces(node.namespaces) };
    return data;
}

export function getSequenceDescription(data: { [key: string]: any }) {
    const description = data.staticReferenceKey || data.dynamicReferenceKey || data.key;
    if (description) {
        return description.split(".")[0];
    }
}
