/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Rule } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from 'mustache';

export function getRuleMustacheTemplate() {

    return `
    <brs:rule description="{{description}}" xmlns:brs="http://wso2.org/carbon/rules">
        <brs:source xpath="{{sourceXPath}}">{{sourceValue}}</brs:source>
        <brs:target action="{{targetAction}}" resultXpath="{{targetResultXPath}}" xpath="{{targetXPath}}">{{targetValue}}</brs:target>
        <brs:ruleSet>
            <brs:properties />
            <brs:rule resourceType="{{ruleSetType}}"  sourceType="{{ruleSetSourceType}}">{{#ruleSetSourceCode}}<![CDATA[{{{ruleSetSourceCode}}}]]>{{/ruleSetSourceCode}}{{#inlineRegistryKey}}{{inlineRegistryKey}}{{/inlineRegistryKey}}{{#ruleSetURL}}{{{ruleSetURL}}}{{/ruleSetURL}}</brs:rule>
        </brs:ruleSet>
        <brs:input namespace="{{inputNamespace}}" wrapperElementName="{{inputWrapperName}}" >
            {{#facts}}
            <brs:fact elementName="{{factName}}" namespace="{{inputNamespace}}" type="{{factType}}" xpath="{{{propertyExpression}}}" />
            {{/facts}}
        </brs:input>
        <brs:output namespace="{{outputNamespace}}" wrapperElementName="{{outputWrapperName}}" >
            {{#results}}
            <brs:fact elementName="{{resultName}}" namespace="{{outputNamespace}}" type="{{resultType}}" />
            {{/results}}
        </brs:output>
    </brs:rule>
    `;
}

export function getRuleXml(data: { [key: string]: any }) {

    data.facts = data.facts.map((fact: string[]) => {
        return {
            elementName: fact[2],
            factType: fact[0],
            propertyExpression: fact[5]
        }
    });
    data.results = data.results.map((result: string[]) => {
        return {
            resultName: result[2],
            resultType: result[0],
            propertyExpression: result[5]
        }
    });
    if (data.ruleSetSourceType == "URL") {
        delete data.inlineRegistryKey;
        delete data.ruleSetSourceCode;
    } else if (data.ruleSetSourceType == "REGISTRY_REFERENCE") {
        delete data.ruleSetURL;
        delete data.ruleSetSourceCode;
    } else {
        delete data.inlineRegistryKey;
        delete data.ruleSetURL;
    }
    const output = Mustache.render(getRuleMustacheTemplate(), data)?.trim();
    return output;
}

export function getRuleFormDataFromSTNode(data: { [key: string]: any }, node: Rule) {

    data.description = node.description;
    data.sourceXPath = node.source?.xpath;
    data.sourceValue = node.source?.value;
    data.targetAction = node.target?.action;
    data.targetResultXPath = node.target?.resultXpath;
    data.targetXPath = node.target?.xpath;
    data.targetValue = node.target?.value;
    data.ruleSetType = node.ruleSet?.rule?.resourceType;
    data.ruleSetSourceType = node.ruleSet?.rule?.sourceType;
    if (data.ruleSetSourceType == "INLINE") {
        const match = node.ruleSet?.rule?.value?.match(/<!\[CDATA\[(.*?)]]>/);
        data.ruleSetSourceCode = match ? match[1] : null;
    } else if (data.ruleSetSourceType == "REGISTRY_REFERENCE") {
        data.inlineRegistryKey = node.ruleSet?.rule?.value;
    } else {
        data.ruleSetURL = node.ruleSet?.rule?.value;
    }
    data.inputNamespace = node.input?.namespace;
    data.inputWrapperName = node.input?.wrapperElementName;
    data.outputNamespace = node.output?.namespace;
    data.outputWrapperName = node.output?.wrapperElementName;
    const factTypes = ["dom", "message", "context", "omelement", "mediator"]
    data.facts = node.input?.fact?.map((fact) => {
        let type = fact.type;
        let customType;
        if (!factTypes.includes(type)) {
            customType = type;
            type = "CUSTOM";
        }
        const value = fact.xpath;
        let valueType = "LITERAL";
        let literal;
        let expression;
        let regKey;
        if (value.includes("gov:") || value.includes("conf:")) {
            regKey = value;
            valueType = "REGISTRY_REFERENCE";
        } else if (value.includes(":")) {
            valueType = "EXPRESSION";
            expression = value;
        } else {
            literal = value
        }
        return [type, customType, fact.elementName, valueType, literal, expression, regKey]
    });
    data.results = node.output?.fact?.map((result) => {
        let type = result.type;
        let customType;
        if (!factTypes.includes(type)) {
            customType = type;
            type = "CUSTOM";
        }
        return [type, customType, result.elementName, "", "", "", ""]
    });

    return data;
}
