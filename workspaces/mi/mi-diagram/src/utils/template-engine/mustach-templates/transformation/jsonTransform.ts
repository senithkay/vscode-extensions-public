/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Jsontransform } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from "mustache";

export function getJsonTransformMustacheTemplate() {
  return `
  {{#hasProperties}}
    <jsontransform description="{{description}}" schema="{{{schema}}}" >
        {{#jsonTransformProperties}}
        <property name="{{propertyName}}" value="{{{propertyValue}}}" />
        {{/jsonTransformProperties}}
    </jsontransform>
  {{/hasProperties}}
  {{^hasProperties}}
    <jsontransform description="{{description}}" schema="{{{schema}}}" />
  {{/hasProperties}}
    `;
}

export function getJsonTransformXml(data: { [key: string]: any }) {

  data.jsonTransformProperties = data.jsonTransformProperties?.map((property: string[]) => {
    return {
      propertyName: property[0],
      propertyValue: property[1]
    }
  });
  if (data.jsonTransformProperties && data.jsonTransformProperties?.length > 0) {
    data.hasProperties = true;
  }
  const output = Mustache.render(getJsonTransformMustacheTemplate(), data)?.trim();
  return output;
}

export function getJsonTransformFormDataFromSTNode(data: { [key: string]: any }, node: Jsontransform) {

  data.schema = node.schema;
  data.description = node.description;
  if (node.property) {
    data.jsonTransformProperties = node.property.map((property) => {
      return [property.name, property.value];
    });
  } else {
    data.jsonTransformProperties = [];
  }
  return data;
}
