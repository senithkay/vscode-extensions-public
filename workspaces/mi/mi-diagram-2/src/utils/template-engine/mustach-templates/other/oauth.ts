/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { OauthService } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from "mustache";

export function getOauthMustacheTemplate() {
    return `
    <oauthService {{#description}}description="{{description}}"{{/description}} password="{{password}}" remoteServiceUrl="{{{remoteServiceURL}}}" username="{{username}}"/>
    `;
}

export function getOauthXml(data: { [key: string]: any }) {

    if (!data.remoteServiceURL.endsWith("/")) {
        data.remoteServiceURL += "/";
    }

    const output = Mustache.render(getOauthMustacheTemplate(), data).trim();
    return output;
}

export function getOauthFormDataFromSTNode(data: { [key: string]: any }, node: OauthService) {

    data.password = node.password;
    data.username = node.username;
    data.remoteServiceURL = node.remoteServiceUrl;
    return data;
}
