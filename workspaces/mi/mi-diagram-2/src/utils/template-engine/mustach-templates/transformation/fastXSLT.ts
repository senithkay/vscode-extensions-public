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

export function getFastXSLTMustacheTemplate() {
    return `
    <fastXSLT {{#description}}description="{{description}}"{{/description}} key="{{key}}" />
    `;
}

export function getFastXSLTXml(data: { [key: string]: any }) {

    if (data.fastXsltSchemaType == "Static") {
        data.key = data.fastXsltStaticSchemaKey;
    } else if (data.fastXsltSchemaType == "Dynamic") {
        data.key = "{" + data.fastXsltDynamicSchemaKey + "}";
    }
    const output = Mustache.render(getFastXSLTMustacheTemplate(), data)?.trim();
    return output;
}

export function getFastXSLTFormDataFromSTNode(data: { [key: string]: any }, node: FastXSLT) {

    if (node.key) {
        const regex = /{([^}]*)}/;
        const match = node.key.match(regex);
        if (match && match.length > 1) {
            data.fastXsltSchemaType = "Dynamic";
            data.fastXsltDynamicSchemaKey = match[1];
        } else {
            data.fastXsltSchemaType = "Static";
            data.fastXsltStaticSchemaKey = node.key;
        }
    }
    return data;
}
