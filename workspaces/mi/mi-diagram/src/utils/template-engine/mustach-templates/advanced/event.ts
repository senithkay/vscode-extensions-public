/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Event } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from "mustache";

export function getEventMustacheTemplate() {

    return `
    <event {{#description}}description="{{description}}" {{/description}}{{#staticTopic}}topic="{{staticTopic}}" {{/staticTopic}}{{#dynamicTopic}}expression="{{dynamicTopic}}" {{/dynamicTopic}} />
    `;
}

export function getEventXml(data: { [key: string]: any }) {

    if (data.topicType == "static") {
        delete data.dynamicTopic;
    } else {
        delete data.staticTopic;
    }

    const output = Mustache.render(getEventMustacheTemplate(), data)?.trim();
    return output;

}

export function getEventFormDataFromSTNode(data: { [key: string]: any }, node: Event) {

    if (node.expression) {
        data.topicType = "dynamic";
    } else if (node.topic) {
        data.topicType = "static";
    }
    return data;
}
