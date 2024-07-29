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
  return `
  {{#endpoint}}
  <send {{#receivingSequence}}receive="{{receivingSequence}}" {{/receivingSequence}}{{#buildMessageBeforeSending}}buildmessage="{{buildMessageBeforeSending}}" {{/buildMessageBeforeSending}}{{#namespaces}}xmlns:{{prefix}}="{{uri}}" {{/namespaces}}{{#description}}description="{{description}}" {{/description}}>
    <endpoint key="{{endpoint}}"/>
  </send>
  {{/endpoint}}
  {{^endpoint}}
  <send {{#receivingSequence}}receive="{{receivingSequence}}" {{/receivingSequence}}{{#buildMessageBeforeSending}}buildmessage="{{buildMessageBeforeSending}}" {{/buildMessageBeforeSending}}{{#namespaces}}xmlns:{{prefix}}="{{uri}}" {{/namespaces}}{{#description}}description="{{description}}" {{/description}}/>
  {{/endpoint}}
  `;
}

export function getSendXml(data: { [key: string]: any }, dirtyFields?: any, defaultValues?: any) {

  if (data.receivingSequenceType == "Static") {
    data.receivingSequence = data.staticReceivingSequence;
  } else if (data.receivingSequenceType == "Dynamic") {
    data.receivingSequence = "{" + data.dynamicReceivingSequence.value + "}";
    data.namespaces = data.dynamicReceivingSequence.namespaces;
    if (data.namespaces && Object.keys(data.namespaces).length == 0) {
      delete data.namespaces;
    }
  }
  if (!data.endpoint || data.endpoint == "") {
    delete data.endpoint;
  }
  if (data.skipSerialization) {
    delete data.receivingSequence;
    delete data.buildMessageBeforeSending;
    delete data.endpoint;
    delete data.namespaces;
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
  if (data.receivingSequenceType == "Dynamic") {
    let value = node.receive;
    const regex = /{([^}]*)}/;
    const match = value.match(regex);
    if (match && match.length > 1) {
      value = match[1];
    }
    data.dynamicReceivingSequence = { isExpression: true, value: value, namespaces: node.namespaces };
  }
  data.endpoint = node.endpoint?.key;
  if (!data.endpoint && !data.receivingSequence && !data.buildMessageBeforeSending) {
    data.skipSerialization = true;
  }
  data.range = node.range;
  return data;
}
