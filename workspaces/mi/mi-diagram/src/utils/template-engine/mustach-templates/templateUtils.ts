/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import Mustache from "mustache";
import { MEDIATORS } from "../../../constants";
import { getCallFormDataFromSTNode, getCallXml } from "./core/call";
import { Call, Callout, Header, Log, STNode } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import { getLogFormDataFromSTNode, getLogXml } from "./core/log";
import { getCalloutFormDataFromSTNode, getCalloutXml } from "./core/callout";
import { getHeaderFormDataFromSTNode } from "./core/header";

export function getMustacheTemplate(name: string) {
    switch (name) {
        case MEDIATORS.CALLTEMPLATE:
            return `<call-template target="{{targetTemplate}}"{{#onError}} onError="{{onError}}"{{/onError}}{{#description}} description="{{description}}"{{/description}}>
{{#parameterName}}
<with-param name="{{parameterName}}" {{#parameterValue}}value="{{parameterValue}}"{{/parameterValue}} {{#parameterExpression}}value="{{parameterExpression}}"{{/parameterExpression}}/>
{{/parameterName}}
</call-template>`;
        case MEDIATORS.CALL:
            return `<call blocking="{{enableBlockingCalls}}"{{#description}} description="{{description}}"{{/description}}>
<endpoint {{#keyExpression}} key-expression="{{keyExpression}}"{{/keyExpression}}/>
    {{#bodySource}}
    <source contentType="{{contentType}}" type="{{sourceType}}"/>
    {{/bodySource}}
    {{#propertySource}}
    <source contentType="{{contentType}}" type="{{sourceType}}">{{sourceProperty}}</source>
    {{/propertySource}}
    {{#bodyTarget}}
    <target type="{{targetType}}"/>
    {{/bodyTarget}}
    {{#propertySource}}
    <target type="{{targetType}}">{{targetProperty}}</target>
{{/propertySource}}
</call>`;
        case MEDIATORS.CALLOUT:
            return `<callout{{#serviceURL}} serviceURL="{{serviceURL}}"{{/serviceURL}}{{#soapAction}} action="{{soapAction}}"{{/soapAction}}{{#initAxis2ClientOptions}} initAxis2ClientOptions="{{initAxis2ClientOptions}}"{{/initAxis2ClientOptions}}{{#addressEndpoint}} endpointKey="{{addressEndpoint}}"{{/addressEndpoint}}{{#description}} description="{{description}}"{{/description}}>
  {{#configurationEnabled}}
  <configuration axis2xml="{{pathToAxis2xml}}" repository="{{pathToAxis2Repository}}"/>
  {{/configurationEnabled}}
  {{#xpathPayload}}
  <source xpath="{{payloadMessageXPath}}"/>
  {{/xpathPayload}}
  {{#propertyPayload}}
  <source key="{{payloadProperty}}"/>
  {{/propertyPayload}}
  {{#envelopePayload}}
  <source type="envelope"/>
  {{/envelopePayload}}
  {{#xpathTarget}}
  <target xpath="{{targetMessageXPath}}"/>
  {{/xpathTarget}}
  {{#propertyTarget}}
  <target key="{{targetProperty}}"/>
  {{/propertyTarget}}
  {{#securityEnabled}}
  {{#policies}}
  <enableSec inboundPolicy="{{inboundPolicyKey}}" outboundPolicy="{{outboundPolicyKey}}"/>
  {{/policies}}
  {{^policies}}
  <enableSec policy="{{policyKey}}"/>
  {{/policies}}
  {{/securityEnabled}}
</callout>`;
        case MEDIATORS.DROP:
            return `<drop{{#description}} description="{{description}}"{{/description}}/>`;
        case MEDIATORS.HEADER:
            return `<header name="{{headerName}}" action="{{headerAction}}" scope="{{scope}}" {{#expression}}expression="{{expression}}"{{/expression}} {{#value}}value="{{value}}"{{/value}} {{#description}}description="{{description}}"{{/description}}/>`;
        case MEDIATORS.LOG:
            return `<log {{#category}}category="{{category}}"{{/category}} {{#level}}level="{{level}}"{{/level}} {{#separator}}separator="{{separator}}"{{/separator}} {{#description}}description="{{description}}"{{/description}}>
{{#properties}}
    <property name="{{propertyName}}" {{#value}}value="{{value}}"{{/value}} {{#expression}}expression="{{expression}}"{{/expression}} />
{{/properties}}
</log>`;
        case MEDIATORS.LOOPBACK:
            return `<loopback{{#description}} description="{{description}}"{{/description}} />`;
        case MEDIATORS.PROPERTY:
            return `<property 
    name="{{propertyName}}" 
    scope="{{propertyScope}}" 
    type="{{propertyDataType}}" 
    {{#newPropertyName}} expression="{{newPropertyName}}"{{/newPropertyName}} 
    action="{{propertyAction}}"
    {{#description}} description="{{description}}"{{/description}} 
    {{#value}} value="{{value}}"{{/value}}
    {{#valueStringPattern}} pattern="{{valueStringPattern}}"{{/valueStringPattern}}
    {{#valueStringCapturingGroup}} group="{{valueStringCapturingGroup}}"{{/valueStringCapturingGroup}}
/>`;
        case MEDIATORS.PROPERTYGROUP:
            return `<propertyGroup {{#description}}description="{{description}}"{{/description}}>
    {{#properties}}
        <property 
name="{{propertyName}}" 
scope="{{propertyScope}}" 
type="{{propertyDataType}}" 
action="{{propertyAction}}"
{{#newPropertyName}} expression="{{newPropertyName}}"{{/newPropertyName}} 
{{#description}} description="{{description}}"{{/description}} 
{{#valueType}} valueType="{{valueType}}"{{/valueType}} 
{{#value}} value="{{value}}"{{/value}} 
{{#valueExpression}} valueExpression="{{valueExpression}}"{{/valueExpression}} 
{{#valueStringPattern}} pattern="{{valueStringPattern}}"{{/valueStringPattern}} 
{{#valueStringCapturingGroup}} group="{{valueStringCapturingGroup}}"{{/valueStringCapturingGroup}} 
        />
    {{/properties}}
</propertyGroup>`;
        case MEDIATORS.RESPOND:
            return `<respond{{#description}} description="{{description}}"{{/description}} />`;
        case MEDIATORS.SEND:
            return `<send {{#skipSerialization}}skipSerialization="{{skipSerialization}}"{{/skipSerialization}}
      {{#buildMessageBeforeSending}}buildmessage="{{buildMessageBeforeSending}}"{{/buildMessageBeforeSending}}
      {{#description}}description="{{description}}"{{/description}}>
    {{#endpoint}}<endpoint key="{{key}}" {{#inline}}inline="{{inline}}"{{/inline}}/>{{/endpoint}}
</send>`;
        case MEDIATORS.SEQUENCE:
            return `<sequence {{#staticReferenceKey}}key="{{staticReferenceKey}}"{{/staticReferenceKey}} {{#dynamicReferenceKey}}key="{{dynamicReferenceKey}}"{{/dynamicReferenceKey}} {{#description}}description="{{description}}"{{/description}}/>`;
        case MEDIATORS.STORE:
            return `<store messageStore="{{messageStore}}" 
       {{#sequence}}sequence="{{sequence}}"{{/sequence}} 
       {{#description}}description="{{description}}"{{/description}}>
    {{#parameters}}
    <parameter name="{{name}}" value="{{value}}" {{#description}}description="{{description}}"{{/description}}/>
    {{/parameters}}
</store>`;
        case MEDIATORS.VALIDATE:
            return `<validate {{#source}}source="{{source}}"{{/source}} 
          {{#cache-schema}}cache-schema="{{cache-schema}}"{{/cache-schema}} 
          {{#description}}description="{{description}}"{{/description}}>
    {{#schema}}
    <schema key="{{key}}" optional="{{optional}}" type="{{type}}" pattern="{{pattern}}" max="{{max}}" min="{{min}}" 
{{#values}}values="{{values}}"{{/values}} {{#source}}source="{{source}}"{{/source}} {{#target}}target="{{target}}"{{/target}} 
{{#cache}}cache="{{cache}}"{{/cache}} {{#description}}description="{{description}}"{{/description}}/>
    {{/schema}}
    {{#on-fail}}
    <on-fail>
        {{#sequence}}
        <sequence key="{{key}}" {{#source}}source="{{source}}"{{/source}} {{#target}}target="{{target}}"{{/target}} 
      {{#cache}}cache="{{cache}}"{{/cache}} {{#description}}description="{{description}}"{{/description}}>
{{#mediator}}
<{{type}} key="{{key}}" {{#source}}source="{{source}}"{{/source}} {{#target}}target="{{target}}"{{/target}} 
           {{#cache}}cache="{{cache}}"{{/cache}} {{#description}}description="{{description}}"{{/description}}>
    {{#args}}
    <arg value="{{value}}" {{#description}}description="{{description}}"{{/description}}/>
    {{/args}}
</{{type}}>
{{/mediator}}
        </sequence>
        {{/sequence}}
    </on-fail>
    {{/on-fail}}
</validate>`;
    }
}

export function getXML(name: string, data: { [key: string]: any }) {
    switch (name) {
        case MEDIATORS.CALL:
            return getCallXml(data);
        case MEDIATORS.LOG:
            return getLogXml(data);
        case MEDIATORS.CALLOUT:
            return getCalloutXml(data);
        default:
            return Mustache.render(getMustacheTemplate(name), data);
    }
}

export function getDataFromXML(name: string, node: STNode) {
    const template = getMustacheTemplate(name);
    const formData = reverseMustache(template, node);

    switch (name) {
        case MEDIATORS.CALL:
            return getCallFormDataFromSTNode(formData, node as Call);
        case MEDIATORS.CALLOUT:
            return getCalloutFormDataFromSTNode(formData, node as Callout);
        case MEDIATORS.HEADER:
            return getHeaderFormDataFromSTNode(formData, node as Header);
        case MEDIATORS.LOG:
            return getLogFormDataFromSTNode(formData, node as Log);    
        default:
            return formData;
    }

}

function reverseMustache(template: string, node: any): { [key: string]: any } {
    const parsedTemplate = Mustache.parse(template);
    const foundVariables: { [key: string]: any } = {};

    parsedTemplate.forEach((item: any) => {
        if (item[0] !== 'text') {
            if (item[4] && item[4].length > 1) {
                const templateKey = item[4][0][1];
                const formKey = item[4][1][1];
                const keyRegex = new RegExp(`\\w+\\s*(?==)`); // Regex to extract the key from the tag
                let key;
                if ((key = keyRegex.exec(templateKey)) !== null && formKey !== null) {
                    if (node[key[0]] !== undefined) {
                        foundVariables[formKey] = node[key[0]];
                    }
                }
            }
        }
    });
    return foundVariables;
}
