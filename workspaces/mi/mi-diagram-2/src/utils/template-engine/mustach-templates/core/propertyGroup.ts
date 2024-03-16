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

export function getPropertyGroupMustacheTemplate() {
    return `<propertyGroup {{#description}}description="{{description}}"{{/description}}>
    {{#properties}}
    <property {{#newPropertyName}}name="{{newPropertyName}}" {{/newPropertyName}}{{#propertyScope}}scope="{{propertyScope}}" {{/propertyScope}}{{#propertyDataType}}type="{{propertyDataType}}" {{/propertyDataType}}{{#expression}}expression="{{expression}}" {{/expression}}{{#propertyAction}}action="{{propertyAction}}" {{/propertyAction}}{{#description}}description="{{description}}" {{/description}}{{#value}}value="{{value}}" {{/value}}{{#valueStringPattern}}pattern="{{valueStringPattern}}" {{/valueStringPattern}}{{#valueStringCapturingGroup}}group="{{valueStringCapturingGroup}}" {{/valueStringCapturingGroup}}/>
    {{/properties}}
</propertyGroup>`;
}

export function getPropertyGroupXml(data: { [key: string]: any }) {
    const properties = data.properties.map((property: string[]) => {
        return {
            newPropertyName: property[1],
            propertyDataType: property[2],
            propertyAction: property[3],
            propertyScope: property[4]?.toLowerCase(),
            value: property[5] == "LITERAL" ? property[6] : undefined,
            expression: property[5] == "EXPRESSION" ? property[7] : undefined,
            valueStringPattern: property[8],
            valueStringCapturingGroup: property[9],
            description: property[10]
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
        return [property.name, property.type, property.action, property.scope, property.value ? "LITERAL" : "EXPRESSION", property.value ?? property.expression, property.pattern, property.group, property.description];
    })
    return data;
}