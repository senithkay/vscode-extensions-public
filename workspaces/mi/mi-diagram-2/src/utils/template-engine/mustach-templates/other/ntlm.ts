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
    <ntlm {{#description}}description="{{description}}"{{/description}} domain="{{domain}}" host="{{host}}" ntlmVersion="{{ntlmVersion}}" password="{{password}}" username="{{username}}"/>
    `;
}

export function getNtlmXml(data: { [key: string]: any }) {

    if (data.usernameValueType == "EXPRESSION") data.username = "{" + data.username + "}";
    if (data.passwordValueType == "EXPRESSION") data.password = "{" + data.password + "}";
    if (data.hostValueType == "EXPRESSION") data.host = "{" + data.host + "}";
    if (data.domainValueType == "EXPRESSION") data.domain = "{" + data.domain + "}";
    if (data.ntlmVersionValueType == "EXPRESSION") data.ntlmVersion = "{" + data.ntlmVersion + "}";

    const output = Mustache.render(getNtlmMustacheTemplate(), data)?.trim();
    return output;
}

export function getNtlmFormDataFromSTNode(data: { [key: string]: any }, node: Ntlm) {

    if (node.username.includes("{")) {
        data.usernameValueType = "EXPRESSION";
        data.username = node.username?.slice(1, -1);
    } else {
        data.usernameValueType = "LITERAL";
        data.username = node.username;
    }

    if (node.password.includes("{")) {
        data.passwordValueType = "EXPRESSION";
        data.password = node.password?.slice(1, -1);
    } else {
        data.passwordValueType = "LITERAL";
        data.password = node.password;
    }

    if (node.host.includes("{")) {
        data.hostValueType = "EXPRESSION";
        data.host = node.host?.slice(1, -1);
    } else {
        data.hostValueType = "LITERAL";
        data.host = node.host;
    }

    if (node.domain.includes("{")) {
        data.domainValueType = "EXPRESSION";
        data.domain = node.domain?.slice(1, -1);
    } else {
        data.domainValueType = "LITERAL";
        data.domain = node.domain;
    }

    if (node.ntlmVersion.includes("{")) {
        data.ntlmVersionValueType = "EXPRESSION";
        data.ntlmVersion = node.ntlmVersion?.slice(1, -1);
    } else {
        data.versionValueType = "LITERAL";
        data.version = node.ntlmVersion;
    }


    return data;
}
