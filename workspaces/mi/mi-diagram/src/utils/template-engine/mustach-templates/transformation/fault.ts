/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Makefault } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from "mustache";
import { transformNamespaces } from "../../../commons";

export function getFaultMustacheTemplate() {
    return `
    <makefault {{#serializeResponse}}response="{{markAsResponse}}"{{/serializeResponse}} description="{{description}}" version="{{soapVersion}}" >
        <code value="{{soapVersion}}Env:{{code}}" xmlns:{{soapVersion}}Env="http://schemas.xmlsoap.org/soap/envelope/" />
        <reason {{#reasonValue}}value="{{reasonValue}}"{{/reasonValue}} {{#reasonExpression}}expression="{{{value}}}"{{#namespaces}} xmlns:{{prefix}}="{{uri}}"{{/namespaces}}{{/reasonExpression}} />
        {{#actor}}<role>{{{actor}}}</role>{{/actor}}
        {{#node}}<node>{{{node}}}</node>{{/node}}
        {{#role}}<role>{{{role}}}</role>{{/role}}
        {{#detailValue}}<detail>{{{detailValue}}}</detail>{{/detailValue}}
        {{#detailExpression}}<detail expression="{{{value}}}" {{#namespaces}} xmlns:{{prefix}}="{{uri}}"{{/namespaces}} />{{/detailExpression}}
    </makefault>
    `;
}

export function getFaultXml(data: { [key: string]: any }) {

    if (data.detail?.isExpression) {
        data.detailExpression = data.detail;
    }
    else {
        data.detailValue = data.detail.value;
    }

    if (data.reason?.isExpression) {
        data.reasonExpression = data.reason;
    } else {
        data.reasonValue = data.reason.value;
    }

    if (data.soapVersion == "soap11") {
        data.code = data.soap11;
        delete data.role;
        delete data.node;
    }
    else if (data.soapVersion == "soap12") {
        data.code = data.soap12;
        delete data.actor;
    }

    const output = Mustache.render(getFaultMustacheTemplate(), data)?.trim();
    return output;
}

export function getFaultFormDataFromSTNode(data: { [key: string]: any }, node: Makefault) {

    if (node.detail?.expression) {
        data.detail = { isExpression: true, value: node.detail?.expression, namespaces: transformNamespaces(node.detail?.namespaces) };
    } else {
        data.detail = { isExpression: false, value: node.detail?.textNode };
    }

    if (node.reason?.expression) {
        data.reason = { isExpression: true, value: node.reason?.expression, namespaces: transformNamespaces(node.reason?.namespaces) };
    } else {
        data.reason = { isExpression: false, value: node.reason?.value };
    }
    data.soapVersion = node.version;
    data.description = node.description;
    data.node = node.node?.textNode;
    data.role = node.role?.textNode;
    data.actor = node.role?.textNode;
    const codeValue = node.code?.value.split("Env:");
    if (data.soapVersion == "soap11") {
        data.soap11 = codeValue && codeValue.length > 1 ? codeValue[1] : undefined;
    } else {
        data.soap12 = codeValue && codeValue.length > 1 ? codeValue[1] : undefined;
    }
    data.serializeResponse = false;
    if (node.response != undefined) {
        data.serializeResponse = true;
        data.markAsResponse = node.response;
    }
    return data;
}
