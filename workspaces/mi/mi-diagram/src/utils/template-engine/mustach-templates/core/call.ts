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
import { checkAttributesExist, transformNamespaces } from "../../../commons";
import { RpcClient } from "@wso2-enterprise/mi-rpc-client";

export function getCallMustacheTemplate() {
  return `
  {{^sourceOrTargetOrEndpoint}}
  <call {{#enableBlockingCalls}}blocking="{{enableBlockingCalls}}" {{^initAxis2ClientOptions}}initAxis2ClientOptions="false" {{/initAxis2ClientOptions}}{{/enableBlockingCalls}}{{#description}}description="{{description}}" {{/description}}/>
  {{/sourceOrTargetOrEndpoint}}
  {{#sourceOrTargetOrEndpoint}}
  <call {{#enableBlockingCalls}}blocking="{{enableBlockingCalls}}" {{^initAxis2ClientOptions}}initAxis2ClientOptions="false" {{/initAxis2ClientOptions}} {{/enableBlockingCalls}}{{#description}}description="{{description}}" {{/description}}>
  {{#registryOrXpathEndpoint}}  <endpoint {{#endpointXpath}}key-expression="{{value}}" {{#namespaces}}xmlns:{{prefix}}="{{uri}}" {{/namespaces}}{{/endpointXpath}}{{#endpointRegistryKey}}key="{{endpointRegistryKey}}" {{/endpointRegistryKey}}/>{{/registryOrXpathEndpoint}}
  {{^registryOrXpathEndpoint}}{{{inlineEndpoint}}}{{/registryOrXpathEndpoint}}
  {{#bodySource}}
    <source type="body"/>
    {{/bodySource}}
    {{#propertySource}}
    <source {{#contentType}}contentType="{{contentType}}"{{/contentType}} type="property">{{sourceProperty}}</source>
    {{/propertySource}}
    {{#inlineSource}}
    <source {{#contentType}}contentType="{{contentType}}"{{/contentType}} type="inline">{{{sourcePayload}}}</source>
    {{/inlineSource}}
    {{#customSource}}
    <source {{#contentType}}contentType="{{contentType}}"{{/contentType}} type="custom">{{#sourceXPath}}{{value}}{{/sourceXPath}}</source>
    {{/customSource}}
    {{#bodyTarget}}
    <target type="{{targetType}}"/>
    {{/bodyTarget}}
    {{#propertyTarget}}
    <target type="{{targetType}}">{{targetProperty}}</target>
    {{/propertyTarget}}
</call>
{{/sourceOrTargetOrEndpoint}}
`
}

export function getCallXml(data: { [key: string]: any }, dirtyFields?: any, defaultValues?: any) {

  data.sourceOrTargetOrEndpoint = true;

  if ((data.sourceType == undefined || data.sourceType == "none")
    && (data.targetType == undefined || data.targetType == "none")
    && (data.endpoint && (data.endpoint.value == undefined || data.endpoint.value == "" || data.endpoint.value == "NONE"))) {
    data.sourceOrTargetOrEndpoint = false;
  }

  if (data.sourceType === 'body') {
    data.bodySource = true;
  } else if (data.sourceType == "property") {
    data.propertySource = true;
  } else if (data.sourceType == "custom") {
    data.customSource = true;
  } else if (data.sourceType == "inline") {
    data.inlineSource = true;
  }

  if (data.targetType === "body") {
    data.bodyTarget = true;
  } else if (data.targetType == "property") {
    data.propertyTarget = true;
  }

  if (data.endpoint?.value !== "INLINE") {
    delete data.inlineEndpoint;
    data.registryOrXpathEndpoint = true;
    if (data.endpoint?.isExpression) {
      data.endpointXpath = data.endpoint;
    } else {
      data.endpointRegistryKey = data.endpoint.value;
    }
  }

  if (data.contentType && data.contentType.length == 0) {
    delete data.contentType;
  }

  let output = Mustache.render(getCallMustacheTemplate(), data).trim();
  return output;
}

export async function getCallFormDataFromSTNode(data: { [key: string]: any }, node: Call, documentUri: string, rpcClient: RpcClient) {
  const endpoint = node.endpoint;
  if (endpoint && (endpoint?.key == undefined && endpoint?.keyExpression == undefined)) {
    data.endpoint = { isExpression: false, value: "INLINE" };
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
    data.endpoint = { isExpression: endpoint?.keyExpression ? true : false, value: endpoint?.key ?? endpoint?.keyExpression, namespaces: transformNamespaces(endpoint?.namespaces) }
  } else {
    data.endpoint = { isExpression: false, value: "NONE" }
  }

  data.enableBlockingCalls = node.blocking;
  data.description = node.description;
  data.contentType = node.source?.contentType;
  data.sourceType = node.source?.type;
  if (data.sourceType == "custom") {
    data.sourceXPath = { isExpression: true, value: node.source?.content };
  } else if (data.sourceType == "property") {
    data.sourceProperty = node.source?.content;
  } else if (data.sourceType == "inline") {
    data.sourcePayload = node.source?.content;
  }
  data.targetType = node.target?.type;
  data.targetProperty = node.target?.textNode;
  data.initAxis2ClientOptions = node.initAxis2ClientOptions != undefined ? node.initAxis2ClientOptions : true;
  data.ranges = {
    call: node.range,
    endpoint: endpoint?.range,
    source: node.source?.range,
    target: node.target?.range
  }
  data.isCallSelfClosed = node.selfClosed;
  return data;
}
