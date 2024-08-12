/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Store } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from "mustache";
import { transformNamespaces } from "../../../commons";

export function getStoreMustacheTemplate() {
    return `<store {{#messageStore}}messageStore="{{value}}"{{#namespaces}} xmlns:{{prefix}}="{{uri}}"{{/namespaces}} {{/messageStore}}{{#onStoreSequence}}sequence="{{onStoreSequence}}" {{/onStoreSequence}}{{#description}}description="{{description}}" {{/description}} />`;
}

export function getStoreXml(data: { [key: string]: any }) {

    if (data.messageStore?.isExpression) {
        data.messageStore.value = "{" + data.messageStore.value + "}";
    }
    return Mustache.render(getStoreMustacheTemplate(), data).trim();

}

export function getStoreFormDataFromSTNode(data: { [key: string]: any }, node: Store) {

    if (node.messageStore?.startsWith("{") && node.messageStore?.endsWith("}")) {
        data.messageStore = { isExpression: true, value: node.messageStore?.substring(1, node.messageStore?.length - 1), namespaces: transformNamespaces(node.namespaces) };
    }
    else {
        data.messageStore = { isExpression: false, value: node.messageStore };
    }
    return data;
}
