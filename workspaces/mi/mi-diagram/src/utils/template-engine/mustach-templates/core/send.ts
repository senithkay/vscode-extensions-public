/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { RpcClient } from "@wso2-enterprise/mi-rpc-client";
import { Send } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from "mustache";
import { transformNamespaces } from "../../../commons";

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
  if (!data.endpoint || data.endpoint == "" || data.endpoint == "NONE") {
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

export async function getSendFormDataFromSTNode(data: { [key: string]: any }, node: Send, documentUri: string, rpcClient: RpcClient) {
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
    data.dynamicReceivingSequence = { isExpression: true, value: value, namespaces: transformNamespaces(node.namespaces) };
  }
  const endpoint = node.endpoint;
  if (endpoint && (endpoint?.key == undefined && endpoint?.keyExpression == undefined)) {
    data.endpoint = "INLINE";
    let endpointClosePosition = endpoint.selfClosed ? endpoint.range.startTagRange.end : endpoint.range.endTagRange?.end;
    if (!endpointClosePosition) {
      endpointClosePosition = node.range.endTagRange.start;
    }
    const xml = await rpcClient.getMiDiagramRpcClient().getTextAtRange({
      documentUri,
      range: {
        start: endpoint.spaces.startingTagSpace.leadingSpace.range.start,
        end: endpointClosePosition
      }
    });
    const leadingSpaces = xml.text.match(/^(\s+)<endpoint/)[1].replace(/\n/g, '').replaceAll('\t', '    ');
    data.inlineEndpoint = xml.text
      .split('\n')
      .map(line => line.length > 0 ? line.replace(/^(\s+)/, (match, p1) => p1.replaceAll('\t', '    ').replace(leadingSpaces, '')) : '')
      .join('\n')
      .trim();
  } else if (endpoint) {
    data.endpoint = endpoint.key ?? endpoint.keyExpression;
  } else {
    data.endpoint = "NONE";
  }
  data.range = node.range;
  return data;
}
