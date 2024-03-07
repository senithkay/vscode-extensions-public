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
            newPropertyName: property[0],
            propertyDataType: property[1],
            propertyAction: property[2],
            propertyScope: property[3].toLowerCase(),
            value: property[4] == "LITERAL" ? property[5] : undefined,
            expression: property[4] == "EXPRESSION" ? property[5] : undefined,
            valueStringPattern: property[6],
            valueStringCapturingGroup: property[7],
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

    return data;
}