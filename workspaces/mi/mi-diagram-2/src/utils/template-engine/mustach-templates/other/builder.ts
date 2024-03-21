/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Builder } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from 'mustache';

export function getBuilderMustacheTemplate() {

    return `
    <builder{{#description}} description="{{description}}" {{/description}}>
        {{#messageBuilders}}
        <messageBuilder class="{{builderClass}}" contentType="{{contentType}}" formatterClass="{{formatterClass}}"/>
        {{/messageBuilders}}
    </builder>
    `;
}

export function getBuilderXml(data: { [key: string]: any }) {
    data.messageBuilders = data.messageBuilders.map((builder: string[]) => {
        return {
            contentType: builder[0],
            builderClass: builder[1],
            formatterClass: builder[2]
        }
    });

    const output = Mustache.render(getBuilderMustacheTemplate(), data)?.trim();
    return output;
}

export function getBuilderFormDataFromSTNode(data: { [key: string]: any }, node: Builder) {

    data.messageBuilders = node.messageBuilders?.map((builder) => {
        return [builder.contentType, builder.clazz, builder.formatterClass]
    });
    data.messageBuilders = data.messageBuilders ? data.messageBuilders : [];
    return data;
}
