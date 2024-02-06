/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

export function getPropertyGroupMustacheTemplate() {
    return `<propertyGroup {{#description}}description="{{description}}"{{/description}}>
    {{#properties}}
        <property 
name="{{propertyName}}" 
scope="{{propertyScope}}" 
type="{{propertyDataType}}" 
action="{{propertyAction}}"
{{#newPropertyName}} expression="{{newPropertyName}}"{{/newPropertyName}} 
{{#description}} description="{{description}}"{{/description}} 
{{#valueType}} valueType="{{valueType}}"{{/valueType}} 
{{#value}} value="{{value}}"{{/value}} 
{{#valueExpression}} valueExpression="{{valueExpression}}"{{/valueExpression}} 
{{#valueStringPattern}} pattern="{{valueStringPattern}}"{{/valueStringPattern}} 
{{#valueStringCapturingGroup}} group="{{valueStringCapturingGroup}}"{{/valueStringCapturingGroup}} 
        />
    {{/properties}}
</propertyGroup>`;
}
