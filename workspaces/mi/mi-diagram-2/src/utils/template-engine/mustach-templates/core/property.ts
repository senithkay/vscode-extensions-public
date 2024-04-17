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

export function getPropertyMustacheTemplate() {
    return `<property {{#newPropertyName}}name="{{newPropertyName}}" {{/newPropertyName}}{{#propertyScope}}scope="{{propertyScope}}" {{/propertyScope}}{{#propertyDataType}}type="{{propertyDataType}}" {{/propertyDataType}}{{#expression}}expression="{{expression}}" {{/expression}}{{#propertyAction}}action="{{propertyAction}}" {{/propertyAction}}{{#description}}description="{{description}}" {{/description}}{{#value}}value="{{value}}" {{/value}}{{#valueStringPattern}}pattern="{{valueStringPattern}}" {{/valueStringPattern}}{{#valueStringCapturingGroup}}group="{{valueStringCapturingGroup}}" {{/valueStringCapturingGroup}}/>`;
}

export function getPropertyXml(data: { [key: string]: any }) {
    data.propertyScope = data.propertyScope?.toLowerCase();
    return Mustache.render(getPropertyMustacheTemplate(), data).trim();
}

export function getPropertyFormDataFromSTNode(data: { [key: string]: any }, node: Property) {
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
        data.propertyScope = node.scope;
    }
    if (node.pattern) {
        data.valueStringPattern = node.pattern;
    }
    if (node.group) {
        data.valueStringCapturingGroup = node.group;
    }

    return data;
}

export function getPropertyDescription(node: Property) {
    if (node.name) {
        return node.name;
    }
}
