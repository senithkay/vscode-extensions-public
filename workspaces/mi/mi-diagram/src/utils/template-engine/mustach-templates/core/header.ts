/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Header } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from "mustache";
import { transformNamespaces } from "../../../commons";

export function getHeaderMustacheTemplate() {
    return `<header {{#headerName}}name="{{value}}" {{#namespaces}}xmlns:{{prefix}}="{{uri}}" {{/namespaces}}{{/headerName}}{{#headerAction}}action="{{headerAction}}" {{/headerAction}}{{#scope}}scope="{{scope}}" {{/scope}}{{#valueExpression}}expression="{{value}}" {{#namespaces}}xmlns:{{prefix}}="{{uri}}" {{/namespaces}}{{/valueExpression}}{{#valueLiteral}}value="{{valueLiteral}}" {{/valueLiteral}}{{#description}}description="{{description}}" {{/description}}{{^valueInline}}/{{/valueInline}}>
    {{#valueInline}}
    {{{valueInline}}}
</header>{{/valueInline}}`;
}

export function getHeaderXml(data: { [key: string]: any }) {
    if (data.headerAction == "remove") {
        delete data.valueExpression;
        delete data.valueLiteral;
        delete data.valueInline;
    }
    if (data.valueType == "LITERAL") {
        delete data.valueExpression;
        delete data.valueInline;
    } else if (data.valueType == "EXPRESSION") {
        delete data.valueLiteral;
        delete data.valueInline;
    } else {
        delete data.valueExpression;
        delete data.valueLiteral;
    }
    const output = Mustache.render(getHeaderMustacheTemplate(), data)?.trim();
    return output;
}

export function getHeaderFormDataFromSTNode(data: { [key: string]: any }, node: Header) {
    if (node.name) {
        data.headerName = { isExpression: true, value: node.name, namespaces: transformNamespaces(node.namespaces) };
    }
    if (node.action) {
        data.headerAction = node.action;
    }
    data.valueType = node.any ? "INLINE" : node.value !== undefined ? "LITERAL" : "EXPRESSION";
    if (data.valueType == "EXPRESSION") {
        data.valueExpression = { isExpression: true, value: node.expression, namespaces: transformNamespaces(node.namespaces) };
    } else if (data.valueType == "LITERAL") {
        data.valueLiteral = node.value;
    } else {
        data.valueInline = node.any;
    }
    return data;
}
