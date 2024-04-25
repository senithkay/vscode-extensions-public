/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Send } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from "mustache";

export function getSendMustacheTemplate() {
  return `{{#isNewMediator}}
  <send {{#skipSerialization}}skipSerialization="{{skipSerialization}}" {{/skipSerialization}}{{#receivingSequence}}receive="{{receivingSequence}}" {{/receivingSequence}}{{#buildMessageBeforeSending}}buildmessage="{{buildMessageBeforeSending}}" {{/buildMessageBeforeSending}}{{#description}}description="{{description}}" {{/description}}/>
  {{/isNewMediator}}
  {{^isNewMediator}}
  {{#selfClosed}}
  <send {{#skipSerialization}}skipSerialization="{{skipSerialization}}" {{/skipSerialization}}{{#receivingSequence}}receive="{{receivingSequence}}" {{/receivingSequence}}{{#buildMessageBeforeSending}}buildmessage="{{buildMessageBeforeSending}}" {{/buildMessageBeforeSending}}{{#description}}description="{{description}}" {{/description}}/>
{{/selfClosed}}
{{^selfClosed}}
<send {{#skipSerialization}}skipSerialization="{{skipSerialization}}" {{/skipSerialization}}{{#receivingSequence}}receive="{{receivingSequence}}" {{/receivingSequence}}{{#buildMessageBeforeSending}}buildmessage="{{buildMessageBeforeSending}}" {{/buildMessageBeforeSending}}{{#description}}description="{{description}}" {{/description}}>
{{/selfClosed}}
{{/isNewMediator}}
  `;
}

export function getSendXml(data: { [key: string]: any }, dirtyFields?: any, defaultValues?: any) {
  if (data.receivingSequenceType == "Static") {
    data.receivingSequence = data.staticReceivingSequence.value;
  } else if (data.receivingSequenceType == "Dynamic") {
    data.receivingSequence = "{" + data.dynamicReceivingSequence.value + "}";
  }
  if (defaultValues == undefined || Object.keys(defaultValues).length == 0) {
    data.isNewMediator = true;
    const output = Mustache.render(getSendMustacheTemplate(), data).trim();
    return output;
  } else {
    data.selfClosed = defaultValues.selfClosed;
    const output = Mustache.render(getSendMustacheTemplate(), data).trim();
    return [{
      range: defaultValues.range.startTagRange,
      text: output
    }];
  }
}

export function getSendFormDataFromSTNode(data: { [key: string]: any }, node: Send) {
  data.skipSerialization = false;
  data.buildMessageBeforeSending = node.buildmessage;
  data.description = node.description;
  data.selfClosed = node.selfClosed;
  data.receivingSequenceType = node.receive ? (node.receive.startsWith("{") ? "Dynamic" : "Static") : "Default";
  if (data.receivingSequenceType == "Static") data.staticReceivingSequence = { isExpression: false, value: node.receive };
  if (data.receivingSequenceType == "Dynamic") {
    let value = node.receive;
    const regex = /{([^}]*)}/;
    const match = value.match(regex);
    if (match && match.length > 1) {
      value = match[1];
    }
    data.dynamicReceivingSequence = { isExpression: true, value: value };
  }
  data.range = node.range;
  return data;
}
