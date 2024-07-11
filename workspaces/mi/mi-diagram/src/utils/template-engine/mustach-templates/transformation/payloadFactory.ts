/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { PayloadFactory } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache, { name } from "mustache";
import { transformNamespaces } from "../../../commons";

export function getPayloadMustacheTemplate() {
    return `<payloadFactory {{#description}}description="{{description}}"{{/description}} media-type="{{mediaType}}" template-type="{{templateType}}">
    {{#isInlined}}
    {{#isFreemarker}}<format><![CDATA[{{{payload}}}]]></format>{{/isFreemarker}}
    {{^isFreemarker}}<format>{{{payload}}}</format>{{/isFreemarker}}
    {{/isInlined}}
    {{^isInlined}}
    <format key="{{payloadKey}}"/>
    {{/isInlined}}
    <args>
        {{#args}}
        <arg {{#literal}}literal="{{{literal}}}"{{/literal}} {{#value}}value="{{{value}}}"{{/value}} {{#expression}}expression="{{{value}}}" evaluator="{{evaluator}}" {{#namespaces}} xmlns:{{prefix}}="{{uri}}"{{/namespaces}} {{/expression}} />
        {{/args}}
    </args>
</payloadFactory>`;
}

export function getPayloadXml(data: { [key: string]: any }) {

    data.isInlined = data?.payloadFormat == "Inline" ? true : false;
    data.isFreemarker = data?.templateType == "Freemarker" ? true : false;
    const args = data.args.map((property: any[]) => {
        if (!property[0].isExpression) {
            return {
                value: property[0]?.value,
                literal: property[2]
            }
        } else {
            return {
                expression: property[0],
                evaluator: property[1],
                literal: property[2]
            }
        }
    });
    data.templateType = data.templateType.toLowerCase();
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
        let templateType = node.templateType;
        data.templateType = templateType.charAt(0).toUpperCase() + templateType.slice(1);
    }
    if (node.format) {
        data.format = node.format;
    }
    if (node.args) {
        data.args = node.args;
    }
    if (node.format?.content) {
        if (data.templateType == "Freemarker") {
            const match = node.format?.content?.match(/<!\[CDATA\[(.*?)]]>/ms);
            let content = match ? match[1] : node.format?.content;
            data.payload = content;
        }
        else {
            data.payload = node.format?.content;
        }
        data.payloadFormat = "Inline";
    } else {
        data.payloadFormat = "Registry Reference";
        data.payloadKey = node.format?.key;
    }
    if (node.args && node.args.arg) {
        data.args = node.args.arg.map((arg) => {
            let isExpression = arg.value ? false : true;
            let namespaces = transformNamespaces(arg.namespaces);
            return [{ isExpression: isExpression, value: arg.value ?? arg.expression, namespaces: namespaces }, arg.evaluator, arg.literal];
        });
    } else {
        data.args = [];
    }

    return data;
}
