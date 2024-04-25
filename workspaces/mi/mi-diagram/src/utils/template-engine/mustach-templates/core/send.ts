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

export function getSendXml(data: { [key: string]: any }) {
  if (data.receivingSequenceType == "Static") {
    data.receivingSequence = data.staticReceivingSequence;
  } else if (data.receivingSequenceType == "Dynamic") {
    data.receivingSequence = "{" + data.dynamicReceivingSequence + "}";
  }

  const output = Mustache.render(getSendMustacheTemplate(), data).trim();
  return output;

}

export function getSendFormDataFromSTNode(data: { [key: string]: any }, node: Send) {
  data.skipSerialization = false;
  data.buildMessageBeforeSending = node.buildmessage;
  data.description = node.description;
  data.selfClosed = node.selfClosed;
  data.receivingSequenceType = node.receive ? (node.receive.startsWith("{") ? "Dynamic" : "Static") : "Default";
  if (data.receivingSequenceType == "Static") data.staticReceivingSequence = node.receive;
  if (data.receivingSequenceType == "Dynamic") data.dynamicReceivingSequence = node.receive;
  data.range = node.range;
  return data;
}