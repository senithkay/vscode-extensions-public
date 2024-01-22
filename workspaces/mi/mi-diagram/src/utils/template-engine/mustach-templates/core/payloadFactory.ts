/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { PayloadFactory } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from "mustache";

export function getPayloadMustacheTemplate() {
    return `<payloadFactory {{#description}}description="{{description}}"{{/description}} media-type="{{mediaType}}" template-type="{{templateType}}">
    {{#isInlined}}
    <format>
    {{payload}}
    </format>
    {{/isInlined}}
    {{^isInlined}}
    {{#payloadKey}}<format key="{{payloadKey}}"/>{{/payloadKey}}
    {{#payload}}<format>
        {{{payload}}}
    </format>
    {{/payload}}
    {{/isInlined}}
    <args>
        {{#args}}
        <arg {{#value}}value="{{value}}"{{/value}} {{#expression}}expression="{{expression}}" evaluator="{{evaluator}}" {{/expression}} />
        {{/args}}
    </args>
</payloadFactory>`;
}

export function getPayloadXml(data: { [key: string]: any }) {
    const args = data.args.map((property: string[]) => {
        if (property[1] === "Value") {
            return {
                value: property[2]
            }
        } else {
            return {
                expression: property[2]
            }
        }
    });
    const modifiedData = {
        ...data,
        args
    }

    return Mustache.render(getPayloadMustacheTemplate(), modifiedData);
}

export function getPayloadFormDataFromSTNode(data: { [key: string]: any }, node: PayloadFactory) {
    if (node.mediaType) {
        data.mediaType = node.mediaType;
    }
    if (node.templateType) {
        data.templateType = node.templateType;
    }
    if (node.format) {
        data.format = node.format;
    }
    if (node.args) {
        data.args = node.args;
    }
    if (node.format?.content) {
        data.payload = node.format.content;
        data.payloadFormat = "inline";
    }
    if (node.args) {
        data.args = node.args.arg.map((arg) => {
            return [null, arg.value ? "Value" : "Expression", arg.value ?? arg.expression];
        });
    }

    return data;
}
