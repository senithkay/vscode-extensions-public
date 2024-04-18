/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import Mustache from "mustache";
import { CallTemplate } from "@wso2-enterprise/mi-syntax-tree/lib/src";

export function getCallTemplateMustacheTemplate() {
  return `<call-template {{#targetTemplate}}target="{{targetTemplate}}" {{/targetTemplate}}{{#onError}}onError="{{onError}}" {{/onError}}{{#description}}description="{{description}}" {{/description}}>
{{#parameterName}}
  <with-param {{#parameterName}}name="{{parameterName}}" {{/parameterName}}{{#parameterValue}}value="{{parameterValue}}" {{/parameterValue}}{{#parameterExpression}}value="{{parameterExpression}}" {{/parameterExpression}}/>
{{/parameterName}}
</call-template>`;
}

export function getCallTemplateXml(data: { [key: string]: any }) {
  const parameterName = data.parameterNameTable.map((property: string[]) => {
    return {
      parameterName: property[0],
      parameterValue: property[1] == "LITERAL" ? property[2] : undefined,
      parameterExpression: property[1] == "EXPRESSION" ? property[3] : undefined
    }
  });
  const modifiedData = {
    ...data,
    parameterName
  }

  return Mustache.render(getCallTemplateMustacheTemplate(), modifiedData).trim();
}

export function getCallTemplateFormDataFromSTNode(data: { [key: string]: any }, node: CallTemplate) {
  if (node.withParam) {
    data.parameterNameTable = node.withParam.map((property) => {
      const valueType = property.value.startsWith("{") ? "EXPRESSION" : "LITERAL";
      const regex = /{([^}]*)}/;
      const match = property.value.match(regex);
      const value = match?.length > 1 ? match[1] : property.value;
      return [property.name, valueType, value];
    });
  }

  return data;
}
