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
import { filterNamespaces, transformNamespaces } from "../../../commons";

export function getPropertyGroupMustacheTemplate() {
    return `<propertyGroup {{#description}}description="{{description}}"{{/description}}>
    {{#properties}}
    {{#isInlineOMValue}}
    <property {{#newPropertyName}}name="{{newPropertyName}}" {{/newPropertyName}}{{#propertyScope}}scope="{{propertyScope}}" {{/propertyScope}}{{#propertyDataType}}type="{{propertyDataType}}" {{/propertyDataType}}{{#expression}}expression="{{expression}}" {{/expression}}{{#propertyAction}}action="{{propertyAction}}" {{/propertyAction}}{{#description}}description="{{description}}" {{/description}}{{#namespaces}} xmlns:{{prefix}}="{{uri}}"{{/namespaces}}>{{{OMValue}}}</property>
    {{/isInlineOMValue}}
    {{^isInlineOMValue}}
    <property {{#newPropertyName}}name="{{newPropertyName}}" {{/newPropertyName}}{{#propertyScope}}scope="{{propertyScope}}" {{/propertyScope}}{{#propertyDataType}}type="{{propertyDataType}}" {{/propertyDataType}}{{#expression}}expression="{{expression}}" {{/expression}}{{#propertyAction}}action="{{propertyAction}}" {{/propertyAction}}{{#description}}description="{{description}}" {{/description}}{{#value}}value="{{value}}" {{/value}}{{#valueStringPattern}}pattern="{{valueStringPattern}}" {{/valueStringPattern}}{{#valueStringCapturingGroup}}group="{{valueStringCapturingGroup}}" {{/valueStringCapturingGroup}}{{#namespaces}} xmlns:{{prefix}}="{{uri}}"{{/namespaces}}/>
    {{/isInlineOMValue}}
    {{/properties}}
</propertyGroup>`;
}

export function getPropertyGroupXml(data: { [key: string]: any }) {
    const properties = data.properties.map((property: any[]) => {
        let name = property[0]?.isExpression ? "{" + property[0].value + "}" : property[0].value;
        let hasStringPattern = property[6] != null && property[6] != "";
        let value;
        let expression;
        let omValue;
        let isInlineOMValue;
        let namespaces = [];
        namespaces.push(...property[0].namespaces ? property[0].namespaces : []);
        if (property[2] == "OM") {
            if (property[4]?.isExpression) {
                expression = property[4].value;
                namespaces.push(...property[4]?.namespaces ? property[4]?.namespaces : []);
            } else {
                isInlineOMValue = true;
                omValue = property[4]?.value;
            }
        } else {
            if (property[3]?.isExpression) {
                expression = property[3].value;
                namespaces.push(...property[3]?.namespaces ? property[3]?.namespaces : []);
            } else {
                value = property[3]?.value;
            }
        }
        let filteredNamespaces = filterNamespaces(namespaces);
        return {
            newPropertyName: name,
            propertyAction: property[1],
            propertyDataType: property[2],
            value: value,
            expression: expression,
            namespaces: filteredNamespaces,
            OMValue: omValue,
            propertyScope: property[5]?.toLowerCase(),
            valueStringPattern: hasStringPattern ? property[6] : undefined,
            valueStringCapturingGroup: hasStringPattern ? property[7] : undefined,
            description: property[8],
            isInlineOMValue: isInlineOMValue
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
        let isNameExpression = property.name?.startsWith("{") && property.name.endsWith("}");
        let name = isNameExpression ? property.name?.substring(1, property.name?.length - 1) : property.name;
        let isValueExpression = property.value ? false : true;
        let namespaces = transformNamespaces(property?.namespaces);
        let omValue = property.any;
        let isOmExpression = false;
        if (property.type == "OM" && property.expression) {
            isOmExpression = true;
            omValue = property.expression;
        }
        return [{ isExpression: isNameExpression, value: name, namespaces: namespaces }, property.action, property.type, { isExpression: isValueExpression, value: property.value ?? property.expression, namespaces: namespaces }, { isExpression: isOmExpression, value: omValue, namespaces: namespaces }, property.scope?.toUpperCase(), property.pattern, property.group, property.description];
    })
    return data;
}
