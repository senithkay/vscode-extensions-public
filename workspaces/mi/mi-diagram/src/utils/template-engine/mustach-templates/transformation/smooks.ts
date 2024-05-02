/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Smooks } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from "mustache";
import { transformNamespaces } from "../../../commons";

export function getSmooksMustacheTemplate() {
    return `
    <smooks config-key="{{configurationKey}}" description="{{description}}" >
        <input {{#inputExpression}}expression="{{{value}}}"{{#namespaces}} xmlns:{{prefix}}="{{uri}}"{{/namespaces}}{{/inputExpression}} {{#inputType}}type="{{inputType}}"{{/inputType}} />
        <output {{#outputAction}}action="{{outputAction}}"{{/outputAction}} {{#outputExpression}}expression="{{{outputExpression}}}"{{/outputExpression}} {{#outputProperty}}property="{{outputProperty}}"{{/outputProperty}} type="{{outputType}}" />
    </smooks>
    `;
}

export function getSmooksXml(data: { [key: string]: any }) {

    if (data.outputMethod == "Property") {
        delete data.outputExpression;
    } else if (data.outputMethod == "Expression") {
        delete data.outputProperty;
    } else {
        delete data.outputProperty;
        delete data.outputExpression;
    }
    const output = Mustache.render(getSmooksMustacheTemplate(), data)?.trim();
    return output;
}

export function getSmooksFormDataFromSTNode(data: { [key: string]: any }, node: Smooks) {

    data.description = node.description;
    data.configurationKey = node.configKey;
    data.inputExpression = { isExpression: true, value: node.input?.expression, namespaces: transformNamespaces(node.input?.namespaces) };
    data.inputType = node.input?.type;
    data.outputType = node.output?.type;
    if (node.output?.expression) {
        data.outputMethod = "Expression";
        data.outputExpression = node.output.expression;
        data.outputAction = node.output?.action;
    } else if (node.output?.property) {
        data.outputMethod = "Property";
        data.outputProperty = node.output.property;
    } else {
        data.outputMethod = "Default";
    }
    return data;
}
