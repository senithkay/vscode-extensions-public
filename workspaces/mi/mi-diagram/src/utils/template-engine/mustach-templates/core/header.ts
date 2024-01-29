/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Header } from "@wso2-enterprise/mi-syntax-tree/lib/src";

export function getHeaderMustacheTemplate() {
    return `<header name="{{headerName}}" action="{{headerAction}}" scope="{{scope}}" {{#expression}}expression="{{expression}}"{{/expression}} {{#value}}value="{{value}}"{{/value}} {{#description}}description="{{description}}"{{/description}}/>`;
}

export function getHeaderFormDataFromSTNode(data: { [key: string]: any }, node: Header) {
    if (node.name) {
        data.headerName = node.name;
    }
    if (node.action) {
        data.headerAction = node.action;
    }
    if (node.scope) {
        data.scope = node.scope;
    }
    return data;
}