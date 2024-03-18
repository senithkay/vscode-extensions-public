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

export function getFilterMustacheTemplate() {

    return `
    {{#isNewMediator}}
    <filter {{#description}}description="{{description}}" {{/description}}{{#regularExpression}}regex="{{regularExpression}}" {{/regularExpression}}{{#source}}source="{{source}}" {{/source}}{{#xPath}}xpath="{{xPath}}" {{/xPath}}>
        <then>
        </then>
        <else>
        </else>
</filter> 
    {{/isNewMediator}}
    {{^isNewMediator}}
    {{#selfClosed}}
    <filter {{#description}}description="{{description}}" {{/description}}{{#regularExpression}}regex="{{regularExpression}}" {{/regularExpression}}{{#source}}source="{{source}}" {{/source}}{{#xPath}}xpath="{{xPath}}" {{/xPath}}/>
    {{/selfClosed}}
    {{^selfClosed}}
    <filter {{#description}}description="{{description}}" {{/description}}{{#regularExpression}}regex="{{regularExpression}}" {{/regularExpression}}{{#source}}source="{{source}}" {{/source}}{{#xPath}}xpath="{{xPath}}" {{/xPath}}>
    {{/selfClosed}}
    {{/isNewMediator}}         
    `;
}

export function getFilterXml(data: { [key: string]: any }) {
    if (data.conditionType == "Source and Regular Expression") {
        delete data.xPath;
    } else if (data.conditionType == "XPath") {
        delete data.regularExpression;
        delete data.source;
    }

    const output = Mustache.render(getFilterMustacheTemplate(), data)?.trim();
    return output;
}

export function getFilterFormDataFromSTNode(data: { [key: string]: any }, node: Filter) {
    data.description = node.description;
    data.regularExpression = node.regex;
    data.source = node.source;
    data.xPath = node.xpath;
    if (data.xPath) {
        data.conditionType = "XPath";
    } else if (data.source || data.regex) {
        data.conditionType = "Source and Regular Expression";
    }
    data.selfClosed = node.selfClosed;
    data.range = node.range;
    return data;
}
