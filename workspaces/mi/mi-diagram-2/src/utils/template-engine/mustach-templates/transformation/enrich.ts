/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Enrich } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from "mustache";

export function getEnrichMustacheTemplate() {
    return `
    <enrich description="{{description}}" >
        {{#isSourceInlined}}
        {{#inlineRegistryKey}}
        <source clone="{{cloneSource}}" key="{{inlineRegistryKey}}" type="{{sourceType}}" />{{/inlineRegistryKey}}
        {{^inlineRegistryKey}}
        <source clone="{{cloneSource}}" type="{{sourceType}}">
            {{sourceXML}}
        </source>
        {{/inlineRegistryKey}}
        {{/isSourceInlined}}
        {{^isSourceInlined}}<source clone="{{cloneSource}}" {{#sourceProperty}}property="{{sourceProperty}}"{{/sourceProperty}} type="{{sourceType}}" {{#sourceXPath}}xpath="{{sourceXPath}}"{{/sourceXPath}} />{{/isSourceInlined}}
        <target {{#targetAction}}action="{{targetAction}}"{{/targetAction}}  {{#targetType}}type="{{targetType}}"{{/targetType}} {{#targetProperty}}property="{{targetProperty}}"{{/targetProperty}} {{#targetXPathJsonPath}}xpath="{{targetXPathJsonPath}}"{{/targetXPathJsonPath}}/>
    </enrich>
    `;
}

export function getEnrichXml(data: { [key: string]: any }) {

    let isSourceInlined = data.sourceType === "inline";

    if (data.sourceType == "property") delete data.sourceXPath;
    else if (data.sourceType == "custom") delete data.sourceProperty;
    else {
        delete data.sourceProperty;
        delete data.sourceXPath;
    }
    if (data.sourceType == "inline") {
        if (data.inlineType == "Inline XML/JSON") delete data.inlineRegistryKey;
        else delete data.sourceXML;
    } else {
        delete data.inlineRegistryKey;
        delete data.sourceXML;
    }

    if (data.targetType == "property") delete data.targetXPathJsonPath;
    else if (data.targetType == "custom" || data.targetType == "key") delete data.targetProperty;
    else {
        delete data.targetXPathJsonPath;
        delete data.targetProperty;
    }
    const modifiedData = {
        ...data,
        isSourceInlined: isSourceInlined
    }

    const output = Mustache.render(getEnrichMustacheTemplate(), modifiedData)?.trim();
    return output;
}

export function getEnrichFormDataFromSTNode(data: { [key: string]: any }, node: Enrich) {

    data.description = node.description;
    data.sourceType = node.source?.type;
    data.cloneSource = node.source.clone;
    if (data.sourceType == "inline") {
        if (node.source?.key) {
            data.inlineType = "RegistryKey";
            data.inlineRegistryKey = node.source?.key;
        } else {
            data.inlineType = "Inline XML/JSON";
            data.sourceXML = node.source?.content;
        }
    } else if (data.sourceType == "property") {
        data.sourceProperty = node.source?.property;
    } else if (data.sourceType == "custom") {
        data.sourceXPath = node.source?.xpath;
    }

    data.targetAction = node.target?.action;
    data.targetType = node.target?.type;
    if (data.targetType == "property") {
        data.targetProperty = node.target?.property;
    } else if (data.targetType == "custom" || data.targetType == "key") {
        data.targetXPathJsonPath = node.target?.xpath;
    }
    return data;
}
