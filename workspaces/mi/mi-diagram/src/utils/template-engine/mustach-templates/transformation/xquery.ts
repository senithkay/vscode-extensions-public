/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Xquery } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from "mustache";
import { transformNamespaces } from "../../../commons";

export function getXqueryMustacheTemplate() {

  return `
    <xquery {{#staticScriptKey}}key="{{{staticScriptKey}}}"{{/staticScriptKey}} {{#dynamicScriptKey}}key="{{{dynamicScriptKey}}}"{{/dynamicScriptKey}} {{#targetXPath}}target="{{{value}}}"{{#namespaces}} xmlns:{{prefix}}="{{uri}}"{{/namespaces}}{{/targetXPath}} {{#description}}description="{{description}}"{{/description}} >
        {{#variables}}        
            <variable name="{{{variableName}}}" type="{{variableType}}" {{#variableKey}}key="{{variableKey}}"{{/variableKey}} {{#variableLiteral}}value="{{{variableLiteral}}}"{{/variableLiteral}} {{#variableExpression}}expression="{{{variableExpression}}}" {{#namespaces}}xmlns:{{prefix}}="{{uri}}" {{/namespaces}}{{/variableExpression}} />
        {{/variables}}
    </xquery>
    `;
}

export function getXqueryXml(data: { [key: string]: any }) {

  if (data.scriptKeyType == "Static") delete data.dynamicScriptKey;
  else {
    data.dynamicScriptKey = "{" + data.dynamicScriptKey?.value + "}";
    delete data.staticScriptKey;
  }
  data.variables = data.variables?.map((variable: any[]) => {
    return {
      variableName: variable[0],
      variableType: variable[1],
      variableLiteral: variable[2] == "LITERAL" ? variable[3] : undefined,
      variableExpression: variable[2] == "EXPRESSION" ? variable[4]?.value : undefined,
      namespaces: variable[2] == "EXPRESSION" ? variable[4]?.namespaces : undefined,
      variableKey: variable[5]
    }
  });
  const output = Mustache.render(getXqueryMustacheTemplate(), data)?.trim();
  return output;
}

export function getXqueryFormDataFromSTNode(data: { [key: string]: any }, node: Xquery) {

  if (node.key) {
    const regex = /{([^}]*)}/;
    const match = node.key.match(regex);
    if (match && match.length > 1) {
      data.scriptKeyType = "Dynamic";
      data.dynamicScriptKey = { isExpression: true, value: match[1] };
      delete data.staticScriptKey;
    } else {
      data.scriptKeyType = "Static";
      data.staticScriptKey = node.key;
      delete data.dynamicScriptKey;
    }
  }

  data.targetXPath = { isExpression: true, value: node.target, namespaces: transformNamespaces(node.namespaces) };
  data.description = node.description;
  if (node.variable) {
    data.variables = node.variable.map((var1) => {
      let namespaces = transformNamespaces(var1.namespaces);
      return [var1.name, var1.type, var1.value ? "LITERAL" : "EXPRESSION", var1.value, { isExpression: true, value: var1.expression, namespaces: namespaces }, var1.key];
    });
  }

  return data;
}
