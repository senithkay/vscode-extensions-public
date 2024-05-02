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

export function getCallMustacheTemplate() {
  return `
  {{#isNewMediator}}
  {{^sourceOrTargetOrEndpoint}}
  <call {{#enableBlockingCalls}}blocking="{{enableBlockingCalls}}" {{^initAxis2ClientOptions}}initAxis2ClientOptions="false" {{/initAxis2ClientOptions}}{{/enableBlockingCalls}}{{#description}}description="{{description}}" {{/description}} ></call>
  {{/sourceOrTargetOrEndpoint}}
  {{#sourceOrTargetOrEndpoint}}
  <call {{#enableBlockingCalls}}blocking="{{enableBlockingCalls}}" {{/enableBlockingCalls}}{{^initAxis2ClientOptions}}initAxis2ClientOptions="false" {{/initAxis2ClientOptions}}{{#description}}description="{{description}}" {{/description}}>
{{#registryOrXpathEndpoint}}<endpoint {{#endpointXpath}}key-expression="{{endpointXpath}}" {{/endpointXpath}}{{#endpointRegistryKey}}key="{{endpointRegistryKey}}" {{/endpointRegistryKey}}/>{{/registryOrXpathEndpoint}}
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
{{/isNewMediator}}
{{^isNewMediator}}
{{#editCall}}
{{^sourceOrTargetOrEndpoint}}
<call {{#enableBlockingCalls}}blocking="{{enableBlockingCalls}}" {{^initAxis2ClientOptions}}initAxis2ClientOptions="false" {{/initAxis2ClientOptions}}{{/enableBlockingCalls}}{{#description}}description="{{description}}" {{/description}} ></call>
{{/sourceOrTargetOrEndpoint}}
{{#sourceOrTargetOrEndpoint}}
<call {{#enableBlockingCalls}}blocking="{{enableBlockingCalls}}" {{^initAxis2ClientOptions}}initAxis2ClientOptions="false" {{/initAxis2ClientOptions}}{{/enableBlockingCalls}}{{#description}}description="{{description}}" {{/description}}>
{{/sourceOrTargetOrEndpoint}}
{{/editCall}}
{{#editEndpoint}}
{{#registryOrXpathEndpoint}}  <endpoint {{#endpointXpath}}key-expression="{{value}}" {{#namespaces}}xmlns:{{prefix}}="{{uri}}" {{/namespaces}}{{/endpointXpath}}{{#endpointRegistryKey}}key="{{endpointRegistryKey}}" {{/endpointRegistryKey}}/>{{/registryOrXpathEndpoint}}
{{/editEndpoint}}
{{#editSource}}
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
{{/editSource}}
{{#editTarget}}
{{#bodyTarget}}
  <target type="{{targetType}}"/>
{{/bodyTarget}}
{{#propertyTarget}}
  <target type="{{targetType}}">{{targetProperty}}</target>
{{/propertyTarget}}
{{/editTarget}}
{{/isNewMediator}}
`
}

export function getCallXml(data: { [key: string]: any }, dirtyFields?: any, defaultValues?: any) {

  data.sourceOrTargetOrEndpoint = true;

  if ((data.sourceType == undefined || data.sourceType == "none")
    && (data.targetType == undefined || data.targetType == "none")
    && (data.endpointType == undefined || data.endpointType == "NONE" || data.endpointType == "INLINE")) {
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

  if (data.endpointType == "XPATH" || data.endpointType == "REGISTRYKEY") {
    data.registryOrXpathEndpoint = true;
  }
  if (data.endopint) {
    delete data.endpointXpath;
    data.registryOrXpathEndpoint = true;
    data.endpointRegistryKey = data.endopint;
  }
  if (data.endpointType == "XPATH") {
    delete data.endpointRegistryKey;
  } else if (data.endpointType == "REGISTRYKEY") {
    delete data.endpointXpath;
  }

  if (data.contentType && data.contentType.length == 0) {
    delete data.contentType;
  }

  if (defaultValues == undefined || Object.keys(defaultValues).length == 0) {
    return getNewMediator(data);
  }

  return getEdits(data, dirtyFields, defaultValues);
}

function getNewMediator(data: { [key: string]: any }) {
  let newData = { ...data };
  newData.isNewMediator = true;
  let output = Mustache.render(getCallMustacheTemplate(), newData).trim();
  return output;
}

function getEdits(data: { [key: string]: any }, dirtyFields: any, defaultValues: any) {

  let callTagAttributes = ["enableBlockingCalls", "initAxis2ClientOptions", "description"];
  let endpointTagAttributes = ["endpointType", "endpointXpath", "endpointRegistryKey", "endopint"];
  let sourceTagAttributes = ["sourceType", "contentType", "sourceProperty", "sourcePayload", "sourceXPath"];
  let targetTagAttributes = ["targetType", "targetProperty"];
  let dirtyKeys = Object.keys(dirtyFields);
  let edits: { [key: string]: any }[] = [];

  if (checkAttributesExist(dirtyKeys, callTagAttributes)) {
    edits.push(getEdit("Call", data, defaultValues, true));
  }
  if (checkAttributesExist(dirtyKeys, endpointTagAttributes)) {
    edits.push(getEdit("Endpoint", data, defaultValues, false));
  }
  if (checkAttributesExist(dirtyKeys, sourceTagAttributes)) {
    edits.push(getEdit("Source", data, defaultValues, false));
  }
  if (checkAttributesExist(dirtyKeys, targetTagAttributes)) {
    edits.push(getEdit("Target", data, defaultValues, false));
  }
  edits.sort((a, b) => b.range.start.line - a.range.start.line);
  return edits;
}

function getEdit(key: string, data: { [key: string]: any }, defaultValues: any, editStartTagOnly: boolean) {

  let newData = { ...data };
  newData["edit" + key] = true;
  let output = Mustache.render(getCallMustacheTemplate(), newData).trim();
  let range = defaultValues.ranges[key.toLowerCase()];
  let editRange;
  if (range) {
    editRange = {
      start: range.startTagRange.start,
      end: editStartTagOnly ? range.startTagRange.end : (range.endTagRange.end ? range.endTagRange.end : range.startTagRange.end)
    }
  } else {
    let callRange = defaultValues.ranges.call;
    editRange = {
      start: callRange.endTagRange.start,
      end: callRange.endTagRange.start
    }
  }
  let edit = {
    text: output,
    range: editRange
  }
  return edit;
}

export function getCallFormDataFromSTNode(data: { [key: string]: any }, node: Call) {
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
  data.endpointXpath = { isExpression: true, value: node.endpoint?.keyExpression, namespaces: transformNamespaces(node.endpoint?.namespaces) };
  data.endpointRegistryKey = node.endpoint?.key;
  data.endopint = node.endpoint?.key;
  if (data.endpointXpath) {
    data.endpointType = "XPATH";
  } else if (data.endpointRegistryKey) {
    data.endpointType = "REGISTRYKEY";
  } else if (node.endpoint) {
    data.endpointType = "INLINE";
  } else {
    data.endpointType = "NONE";
  }
  data.ranges = {
    call: node.range,
    endpoint: node.endpoint?.range,
    source: node.source?.range,
    target: node.target?.range
  }
  data.isCallSelfClosed = node.selfClosed;
  return data;
}
