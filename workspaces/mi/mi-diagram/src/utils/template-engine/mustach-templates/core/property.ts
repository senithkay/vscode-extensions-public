/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import Mustache from "mustache";
import { Property } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import { transformNamespaces } from "../../../commons";

export function getPropertyMustacheTemplate() {
    return `{{#isOM}}
    <property {{#propertyName}}name="{{propertyName}}" {{/propertyName}}{{#propertyScope}}scope="{{propertyScope}}" {{/propertyScope}}{{#propertyDataType}}type="{{propertyDataType}}" {{/propertyDataType}}{{#expression}}expression="{{expression}}" {{/expression}}{{#propertyAction}}action="{{propertyAction}}" {{/propertyAction}}{{#description}}description="{{description}}" {{/description}}{{#value}}value="{{value}}" {{/value}}{{#valueStringPattern}}pattern="{{valueStringPattern}}" {{/valueStringPattern}}{{#valueStringCapturingGroup}}group="{{valueStringCapturingGroup}}" {{/valueStringCapturingGroup}}>{{{OMValue}}}</property>    
    {{/isOM}}
    {{^isOM}}
    <property {{#propertyName}}name="{{propertyName}}" {{/propertyName}}{{#propertyScope}}scope="{{propertyScope}}" {{/propertyScope}}{{#propertyDataType}}type="{{propertyDataType}}" {{/propertyDataType}}{{#expression}}expression="{{expression}}"{{#namespaces}} xmlns:{{prefix}}="{{uri}}" {{/namespaces}}{{/expression}}{{#propertyAction}}action="{{propertyAction}}" {{/propertyAction}}{{#description}}description="{{description}}" {{/description}}{{#value}}value="{{value}}" {{/value}}{{#valueStringPattern}}pattern="{{valueStringPattern}}" {{/valueStringPattern}}{{#valueStringCapturingGroup}}group="{{valueStringCapturingGroup}}" {{/valueStringCapturingGroup}}/>
    {{/isOM}}`;
}

export function getPropertyXml(data: { [key: string]: any }) {
    if (data.propertyDataType == "OM") {
        data.isOM = true;
    }
    if (data.propertyDataType == "STRING") {
        if (!data.valueStringPattern) {
            delete data.valueStringCapturingGroup;
        }
    } else {
        delete data.valueStringPattern;
        delete data.valueStringCapturingGroup;
    }
    if (data.propertyAction == "set") {
        delete data.propertyAction;
    } else {
        delete data.value;
        delete data.propertyDataType;
        delete data.valueStringPattern;
        delete data.valueStringCapturingGroup;
    }
    if (data.value?.isExpression) {
        data.expression = data.value?.value;
        data.namespaces = data.value?.namespaces;
        delete data.value;
    } else {
        data.value = data.value?.value;
    }
    data.propertyScope = data.propertyScope?.toLowerCase();
    return Mustache.render(getPropertyMustacheTemplate(), data).trim();
}

export function getPropertyFormDataFromSTNode(data: { [key: string]: any }, node: Property) {
    data.OMValue = node.any;
    data.description = node.description;
    if (node.name) {
        data.propertyName = node.name;
        data.newPropertyName = node.name;
    }
    if (node.type) {
        data.propertyDataType = node.type;
    }
    if (node.action) {
        data.propertyAction = node.action;
    }
    if (node.scope) {
        data.propertyScope = node.scope.toUpperCase();
    }
    if (node.pattern) {
        data.valueStringPattern = node.pattern;
    }
    if (node.group) {
        data.valueStringCapturingGroup = node.group;
    }
    data.value = { isExpression: false, value: "" };
    if (node.value) {
        data.value.isExpression = false;
        data.value.value = node.value;
    } else if (node.expression) {
        data.value.isExpression = true;
        data.value.value = node.expression;
        data.value.namespaces = transformNamespaces(node.namespaces);
    }
    return data;
}

export function getPropertyDescription(node: Property) {
    if (node.name) {
        return node.name;
    }
}
