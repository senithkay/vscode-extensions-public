/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import Mustache from "mustache";
import { Call } from "@wso2-enterprise/mi-syntax-tree/lib/src";

export function getCallMustacheTemplate() {
  return `<call blocking="{{enableBlockingCalls}}"{{#description}} description="{{description}}"{{/description}}>
<endpoint {{#keyExpression}} key-expression="{{keyExpression}}"{{/keyExpression}}/>
    {{#bodySource}}
    <source contentType="{{contentType}}" type="{{sourceType}}"/>
    {{/bodySource}}
    {{#propertySource}}
    <source contentType="{{contentType}}" type="{{sourceType}}">{{sourceProperty}}</source>
    {{/propertySource}}
    {{#bodyTarget}}
    <target type="{{targetType}}"/>
    {{/bodyTarget}}
    {{#propertySource}}
    <target type="{{targetType}}">{{targetProperty}}</target>
{{/propertySource}}
</call>`
}

export function getCallXml(data: { [key: string]: any }) {
  let bodySource;
  let propertySource;
  let bodyTarget;
  let propertyTarget;
  const enableBlockingCalls = Boolean(data.enableBlockingCalls);
  if (data.sourceType === 'body') {
    bodySource = true; // Set a flag for bodySource if sourceType is 'body'
  } else {
    propertySource = true; // Set a flag for propertySource otherwise
  }
  if (data.targetType === "body") {
    bodyTarget = true;
  } else {
    propertyTarget = true;
  }
  const modifiedData = {
    ...data,
    bodySource: bodySource,
    propertySource: propertySource,
    bodyTarget: bodyTarget,
    propertyTarget: propertyTarget,
    enableBlockingCalls: enableBlockingCalls,
  }

  return Mustache.render(getCallMustacheTemplate(), modifiedData)
}

export function getCallFormDataFromSTNode(data: { [key: string]: any }, node: Call) {
  data.enableBlockingCalls = node.blocking;
  if (node.description) {
    data.description = node.description;
  }
  if (node.source?.contentType) {
    data.contentType = node.source.contentType;
  }
  if (node.source?.type) {
    data.sourceType = node.source.type;
  }
  if (node.source?.content) {
    data.sourceProperty = node.source.content;
  }
  if (node.target?.type) {
    data.targetType = node.target.type;
  }
  if (node.target?.content) {
    data.targetProperty = node.target.content;
  }

  return data;
}
