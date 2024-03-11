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

export function getStoreMustacheTemplate() {
    return `<store {{#messageStore}}messageStore="{{messageStore}}" {{/messageStore}}{{#onStoreSequence}}sequence="{{onStoreSequence}}" {{/onStoreSequence}}{{#description}}description="{{description}}" {{/description}} />`;
}

export function getStoreXml(data: { [key: string]: any }) {
    if (data.expression && !data.expression?.startsWith("{")) {
        data.messageStore = "{" + data.expression + "}";
    }

    return Mustache.render(getStoreMustacheTemplate(), data).trim();

}

export function getStoreFormDataFromSTNode(data: { [key: string]: any }, node: Store) {
    if (data.messageStore?.startsWith("{")) {
        data.specifyAs = "Expression";
        const regex = /{([^}]*)}/;
        const match = data.messageStore.match(regex);
        data.expression = match.length > 1 ? match[1] : data.messageStore;
    } else {
        data.specifyAs = "Value";
    }
    return data;
}

