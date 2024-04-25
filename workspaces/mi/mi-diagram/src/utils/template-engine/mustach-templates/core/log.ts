/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import Mustache from "mustache";
import { Log } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import { ExpressionFieldValue } from "@wso2-enterprise/ui-toolkit";

export function getLogMustacheTemplate() {
  return `<log {{#category}}category="{{category}}"{{/category}} {{#level}}level="{{level}}"{{/level}} {{#separator}}separator="{{separator}}"{{/separator}} {{#description}}description="{{description}}"{{/description}}>
{{#properties}}
    <property name="{{propertyName}}" {{#value}}value="{{value}}"{{/value}} {{#expression}}expression="{{expression}}" {{#namespaces}} xmlns:{{prefix}}="{{uri}}"{{/namespaces}} {{/expression}} />
{{/properties}}
</log>`;
}

export function getLogXml(data: { [key: string]: any }) {
  data.level = data.level.toLowerCase();
  const properties = data.properties.map((property: string | ExpressionFieldValue[]) => {
    const value = property[1] as ExpressionFieldValue;
    const isExpressionValue = value.isExpression;
    const namespaces = value.namespaces;
    return {
      propertyName: property[0],
      ...(!isExpressionValue) && { value: value.value },
      ...(isExpressionValue) && { expression: value.value },
      namespaces
    }
  });
  const modifiedData = {
    ...data,
    properties
  }

  return Mustache.render(getLogMustacheTemplate(), modifiedData);
}

export function getLogFormDataFromSTNode(data: { [key: string]: any }, node: Log) {
  if (data.level) data.level = data.level.toString().toUpperCase();

  if (node.property) {
    data.properties = node.property.map((property) => {
      return [property.name, { value: property.value || property.expression, isExpression: !!property.expression }];
    });
  }

  return data;
}

export function getLogDescription(node: Log) {
  if (node.property) {
    return node.property.map((property: any) => {
      return property.name;
    }).join(", ");
  }
}