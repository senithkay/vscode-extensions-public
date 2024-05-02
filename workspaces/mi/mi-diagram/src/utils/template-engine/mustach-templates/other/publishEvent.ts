/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Attribute, PublishEvent } from '@wso2-enterprise/mi-syntax-tree/lib/src';
import Mustache from 'mustache';

export function getPublishEventMustacheTemplate() {

    return `
    <publishEvent async="{{async}}" description="{{description}}" timeout="{{asyncTimeout}}">
        <eventSink>{{eventSink}}</eventSink>
        <streamName>{{streamName}}</streamName>
        <streamVersion>{{streamVersion}}</streamVersion>
        <attributes>
            {{#isMetaAttribute}}
            <meta>
                {{#metaAttributes}}
                <attribute{{#defaultValue}} defaultValue="{{defaultValue}}"{{/defaultValue}} name="{{attributeName}}" type="{{attributeType}}" {{#attributeValue}}value="{{{attributeValue}}}"{{/attributeValue}} {{#attributeExpression}}expression="{{{attributeExpression}}}"{{/attributeExpression}}/>  
                {{/metaAttributes}}
            </meta>
            {{/isMetaAttribute}}
            {{^isMetaAttribute}}
            <meta/>
            {{/isMetaAttribute}}
            {{#isCorrelationAttribute}}
            <correlation>
                {{#correlationAttributes}}
                <attribute {{#defaultValue}}defaultValue="{{{defaultValue}}}" {{/defaultValue}}name="{{{attributeName}}}" type="{{attributeType}}" {{#attributeValue}}value="{{{attributeValue}}}"{{/attributeValue}} {{#attributeExpression}}expression="{{{attributeExpression}}}"{{/attributeExpression}}/>
                {{/correlationAttributes}}
            </correlation>
            {{/isCorrelationAttribute}}
            {{^isCorrelationAttribute}}
            <correlation/>
            {{/isCorrelationAttribute}}
            {{#isPayloadAttribute}}
            <payload>
                {{#payloadAttributes}}
                <attribute {{#defaultValue}}defaultValue="{{{defaultValue}}}" {{/defaultValue}}name="{{{attributeName}}}" type="{{attributeType}}" {{#attributeValue}}value="{{{attributeValue}}}"{{/attributeValue}} {{#attributeExpression}}expression="{{{attributeExpression}}}"{{/attributeExpression}}/>
                {{/payloadAttributes}}    
            </payload>
            {{/isPayloadAttribute}}
            {{^isPayloadAttribute}}
            <payload/>
            {{/isPayloadAttribute}}
            {{#isArbitaryAttributes}}
            <arbitrary>
                {{#arbitaryAttributes}}
                <attribute {{#defaultValue}}defaultValue="{{{defaultValue}}}"{{/defaultValue}} name="{{{attributeName}}}" type="{{attributeType}}" {{#attributeValue}}value="{{{attributeValue}}}"{{/attributeValue}} {{#attributeExpression}}expression="{{{attributeExpression}}}"{{/attributeExpression}} />
                {{/arbitaryAttributes}}
            </arbitrary>
            {{/isArbitaryAttributes}}
            {{^isArbitaryAttributes}}
            <arbitrary/>
            {{/isArbitaryAttributes}}
        </attributes>
    </publishEvent>
    `;
}

export function getPublishEventXml(data: { [key: string]: any }) {

    data.metaAttributes = convertTableArrayToJson(data.metaAttributes);
    data.correlationAttributes = convertTableArrayToJson(data.correlationAttributes);
    data.payloadAttributes = convertTableArrayToJson(data.payloadAttributes);
    data.arbitaryAttributes = convertTableArrayToJson(data.arbitaryAttributes);
    data.isMetaAttribute = data?.metaAttributes?.length>0 ? true : false;
    data.isCorrelationAttribute = data?.correlationAttributes?.length>0 ? true : false;
    data.isPayloadAttribute = data?.payloadAttributes?.length>0 ? true : false;
    data.isArbitaryAttributes = data?.arbitaryAttributes?.length>0 ? true : false;
    const output = Mustache.render(getPublishEventMustacheTemplate(), data)?.trim();
    return output;
}

export function getPublishEventFormDataFromSTNode(data: { [key: string]: any }, node: PublishEvent) {

    data.async = node.async;
    data.asyncTimeout = node.timeout;
    data.streamName = node.streamName;
    data.eventSink = node.eventSink;
    data.streamVersion = node.streamVersion;
    data.description = node.description;
    data.metaAttributes = convertTableJsonToArray(node.attributes.meta.attributes);
    data.correlationAttributes = convertTableJsonToArray(node.attributes.correlation.attributes);
    data.payloadAttributes = convertTableJsonToArray(node.attributes.payload.attributes);
    data.arbitaryAttributes = convertTableJsonToArray(node.attributes.arbitrary.attributes);
    return data;
}

function convertTableArrayToJson(attributes: string[][]): any {
    if (attributes) {
        return attributes.map((attribute: string[]) => {
            return {
                attributeName: attribute[0],
                attributeType: attribute[2],
                attributeValue: attribute[1] == "LITERAL" ? attribute[3] : undefined,
                attributeExpression: attribute[1] == "EXPRESSION" ? attribute[4] : undefined,
                defaultValue: attribute[5]
            }
        })
    }
}

function convertTableJsonToArray(attributes: Attribute[]) {
    if (attributes) {
        return attributes.map((attribute) => {
            return [attribute.name, attribute.expression ? "EXPRESSION" : "LITERAL", attribute.dataType, attribute.value, attribute.expression, attribute._default]
        });
    }
}
