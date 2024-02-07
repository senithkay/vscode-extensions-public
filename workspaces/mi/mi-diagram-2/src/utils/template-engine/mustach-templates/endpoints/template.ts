/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

export function getTemplateEndpointMustacheTemplate() {
    return `<endpoint template="{{targetTemplate}}">
    <description>{{description}}</description>
    {{#properties}}
    <property name="{{propertyName}}" {{#value}}value="{{value}}"{{/value}} {{#expression}}expression="{{expression}}"{{/expression}} />
    {{/properties}}
    <description>{{description}}</description>
</endpoint>`;
}
