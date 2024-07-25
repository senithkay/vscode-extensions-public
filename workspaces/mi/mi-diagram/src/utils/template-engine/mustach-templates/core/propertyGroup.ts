/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { PropertyGroup } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from "mustache";
import { transformNamespaces } from "../../../commons";

export function getPropertyGroupMustacheTemplate() {
    return `<propertyGroup {{#description}}description="{{description}}"{{/description}}>
    {{#properties}}
    {{#OMValue}}
    <property {{#newPropertyName}}name="{{newPropertyName}}" {{/newPropertyName}}{{#propertyScope}}scope="{{propertyScope}}" {{/propertyScope}}{{#propertyDataType}}type="{{propertyDataType}}" {{/propertyDataType}}{{#expression}}expression="{{expression}}" {{#namespaces}}xmlns:{{prefix}}="{{uri}}" {{/namespaces}}{{/expression}}{{#propertyAction}}action="{{propertyAction}}" {{/propertyAction}}{{#description}}description="{{description}}" {{/description}}>{{{OMValue}}}</property>
    {{/OMValue}}
    {{^OMValue}}
    <property {{#newPropertyName}}name="{{newPropertyName}}" {{/newPropertyName}}{{#propertyScope}}scope="{{propertyScope}}" {{/propertyScope}}{{#propertyDataType}}type="{{propertyDataType}}" {{/propertyDataType}}{{#expression}}expression="{{expression}}" {{#namespaces}}xmlns:{{prefix}}="{{uri}}" {{/namespaces}}{{/expression}}{{#propertyAction}}action="{{propertyAction}}" {{/propertyAction}}{{#description}}description="{{description}}" {{/description}}{{#value}}value="{{value}}" {{/value}}{{#valueStringPattern}}pattern="{{valueStringPattern}}" {{/valueStringPattern}}{{#valueStringCapturingGroup}}group="{{valueStringCapturingGroup}}" {{/valueStringCapturingGroup}}/>
    {{/OMValue}}
    {{/properties}}
</propertyGroup>`;
}

export function getPropertyGroupXml(data: { [key: string]: any }) {
    const properties = data.properties.map((property: any[]) => {
        let hasStringPattern = property[6] != null && property[6] != "";
        return {
            newPropertyName: property[0],
            propertyAction: property[1],
            propertyDataType: property[2],
            value: property[3]?.isExpression ? undefined : property[3]?.value,
            expression: property[3]?.isExpression ? property[3]?.value : undefined,
            namespaces: property[3]?.isExpression ? property[3]?.namespaces : undefined,
            OMValue: property[1] == "OM" ? property[4] : undefined,
            propertyScope: property[5]?.toLowerCase(),
            valueStringPattern: hasStringPattern ? property[6] : undefined,
            valueStringCapturingGroup: hasStringPattern ? property[7] : undefined,
            description: property[8]
        }
    });
    const modifiedData = {
        ...data,
        properties
    }
    return Mustache.render(getPropertyGroupMustacheTemplate(), modifiedData).trim();
}

export function getPropertyGroupFormDataFromSTNode(data: { [key: string]: any }, node: PropertyGroup) {

    data.properties = node.property.map(property => {
        let isExpression = property.value ? false : true;
        let namespaces;
        if (isExpression) {
            namespaces = transformNamespaces(property?.namespaces);
        }
        return [property.name, property.action, property.type, { isExpression: isExpression, value: property.value ?? property.expression, namespaces: namespaces }, "", property.scope?.toUpperCase(), property.pattern, property.group, property.description];
    })
    return data;
}
