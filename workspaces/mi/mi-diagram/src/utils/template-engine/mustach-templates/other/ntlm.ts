/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Ntlm } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from "mustache";

export function getNtlmMustacheTemplate() {

    return `
    <NTLM {{#description}}description="{{description}}"{{/description}} domain="{{domain}}" host="{{host}}" ntlmVersion="{{ntlmVersion}}" password="{{password}}" username="{{username}}"/>
    `;
}

export function getNtlmXml(data: { [key: string]: any }) {

    if (data.username?.isExpression) {
        data.username = "{" + data.username?.value + "}";
    } else {
        data.username = data.username?.value;
    }
    if (data.password?.isExpression) {
        data.password = "{" + data.password?.value + "}";
    } else {
        data.password = data.password?.value;
    }
    if (data.host?.isExpression) {
        data.host = "{" + data.host?.value + "}";
    } else {
        data.host = data.host?.value;
    }
    if (data.domain?.isExpression) {
        data.domain = "{" + data.domain?.value + "}";
    } else {
        data.domain = data.domain?.value;
    }
    if (data.ntlmVersion?.isExpression) {
        data.ntlmVersion = "{" + data.ntlmVersion?.value + "}";
    } else {
        data.ntlmVersion = data.ntlmVersion?.value;
    }

    const output = Mustache.render(getNtlmMustacheTemplate(), data)?.trim();
    return output;
}

export function getNtlmFormDataFromSTNode(data: { [key: string]: any }, node: Ntlm) {

    if (node.username.includes("{")) {
        data.username = node.username?.slice(1, -1);
        data.username = { isExpression: true, value: data.username };
    } else {
        data.username = node.username;
        data.username = { isExpression: false, value: data.username };
    }

    if (node.password.includes("{")) {
        data.password = node.password?.slice(1, -1);
        data.password = { isExpression: true, value: data.password };
    } else {
        data.password = node.password;
        data.password = { isExpression: false, value: data.password };
    }

    if (node.host.includes("{")) {
        data.host = node.host?.slice(1, -1);
        data.host = { isExpression: true, value: data.host };
    } else {
        data.host = node.host;
        data.host = { isExpression: false, value: data.host };
    }

    if (node.domain.includes("{")) {
        data.domain = node.domain?.slice(1, -1);
        data.domain = { isExpression: true, value: data.domain };
    } else {
        data.domain = node.domain;
        data.domain = { isExpression: false, value: data.domain };
    }

    if (node.ntlmVersion.includes("{")) {
        data.ntlmVersion = node.ntlmVersion?.slice(1, -1);
        data.ntlmVersion = { isExpression: true, value: data.ntlmVersion };
    } else {
        data.ntlmVersion = node.ntlmVersion;
        data.ntlmVersion = { isExpression: false, value: data.ntlmVersion };
    }

    return data;
}
