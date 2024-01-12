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

export function getLogMustacheTemplate() {
  return `<log {{#category}}category="{{category}}"{{/category}} {{#level}}level="{{level}}"{{/level}} {{#separator}}separator="{{separator}}"{{/separator}} {{#description}}description="{{description}}"{{/description}}>
{{#properties}}
    <property name="{{propertyName}}" {{#value}}value="{{value}}"{{/value}} {{#expression}}expression="{{expression}}"{{/expression}} />
{{/properties}}
</log>`;
}

export function getLogXml(data: { [key: string]: any }) {
  data.level = data.level.toLowerCase();
  const properties = data.properties.map((property: string[]) => {
    return {
      propertyName: property[0],
      value: property[2]
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
      return [property.name, property.value ? "LITERAL" : "EXPRESSION", property.value ?? property.expression];
    });
  }

  return data;
}
