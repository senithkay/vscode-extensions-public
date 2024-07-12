/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Filter } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from "mustache";
import { checkAttributesExist, transformNamespaces } from "../../../commons";

export function getFilterMustacheTemplate() {

    return `
    {{#isNewMediator}}
    <filter {{#description}}description="{{description}}" {{/description}}{{#regularExpression}}regex="{{{regularExpression}}}" {{/regularExpression}}{{#source}}source="{{{source}}}" {{/source}}{{#xPath}}xpath="{{{xPath}}}"{{/xPath}}{{#namespaces}} xmlns:{{{prefix}}}="{{{uri}}}"{{/namespaces}}>
        <then>
        </then>
        <else>
        </else>
</filter> 
    {{/isNewMediator}}
    {{^isNewMediator}}
    {{#selfClosed}}
    <filter {{#description}}description="{{description}}" {{/description}}{{#regularExpression}}regex="{{{regularExpression}}}" {{/regularExpression}}{{#source}}source="{{{source}}}" {{/source}}{{#xPath}}xpath="{{{xPath}}}"{{/xPath}}{{#namespaces}} xmlns:{{{prefix}}}="{{{uri}}}"{{/namespaces}}/>
    {{/selfClosed}}
    {{^selfClosed}}
    <filter {{#description}}description="{{description}}" {{/description}}{{#regularExpression}}regex="{{{regularExpression}}}" {{/regularExpression}}{{#source}}source="{{{source}}}" {{/source}}{{#xPath}}xpath="{{{xPath}}}"{{/xPath}}{{#namespaces}} xmlns:{{{prefix}}}="{{{uri}}}"{{/namespaces}}>
    {{/selfClosed}}
    {{/isNewMediator}}         
    `;
}

export function getFilterXml(data: { [key: string]: any }, dirtyFields?: any, defaultValues?: any) {
    let namespaces;
    if (data.conditionType == "Source and Regular Expression") {
        namespaces = data.source?.namespaces;
        data.source = data.source?.value;
        delete data.xPath;
    } else if (data.conditionType == "XPath") {
        namespaces = data.xPath?.namespaces;
        data.xPath = data.xPath?.value;
        delete data.regularExpression;
        delete data.source;
    }
    data.namespaces = namespaces;

    if (defaultValues == undefined || Object.keys(defaultValues).length == 0) {
        data.isNewMediator = true;
        const output = Mustache.render(getFilterMustacheTemplate(), data)?.trim();
        return output;
    }
    const output = Mustache.render(getFilterMustacheTemplate(), data)?.trim();
    let range = defaultValues.range.startTagRange;
    let edits = [{ range, text: output }];
    return edits;
}

export function getFilterFormDataFromSTNode(data: { [key: string]: any }, node: Filter) {
    data.description = node.description;
    data.regularExpression = node.regex;
    let namespaces = transformNamespaces(node.namespaces);
    data.source = { isExpression: true, value: node.source, namespaces: namespaces };
    data.xPath = { isExpression: true, value: node.xpath, namespaces: namespaces };
    if (data.xPath?.value) {
        data.conditionType = "XPath";
    } else if (data.source?.value || data.regex) {
        data.conditionType = "Source and Regular Expression";
    }
    data.selfClosed = node.selfClosed;
    data.range = node.range;
    return data;
}

export function getFilterDescription(node: Filter) {
    if (node.regex && node.source) {
        return `${node.source} matches ${node.regex}`;
    }
    if (node.regex) {
        return node.regex;
    } else if (node.source) {
        return node.source;
    } else if (node.xpath) {
        return node.xpath;
    }
}
