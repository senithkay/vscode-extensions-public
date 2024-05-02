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
import { transformNamespaces } from "../../../commons";

export function getRuleMustacheTemplate() {

    return `
    <brs:rule description="{{description}}" xmlns:brs="http://wso2.org/carbon/rules">
        <brs:source {{#sourceXPath}}xpath="{{{value}}}"{{#namespaces}} xmlns:{{prefix}}="{{uri}}"{{/namespaces}}{{/sourceXPath}}>{{sourceValue}}</brs:source>
        <brs:target action="{{targetAction}}" resultXpath="{{{targetResultXPath}}}" xpath="{{{targetXPath}}}"{{#targetNamespaces}} xmlns:{{prefix}}="{{uri}}"{{/targetNamespaces}}>{{targetValue}}</brs:target>
        <brs:ruleSet>
            <brs:properties />
            <brs:rule resourceType="{{ruleSetType}}"  sourceType="{{ruleSetSourceType}}">{{#ruleSetSourceCode}}<![CDATA[{{{ruleSetSourceCode}}}]]>{{/ruleSetSourceCode}}{{#inlineRegistryKey}}{{inlineRegistryKey}}{{/inlineRegistryKey}}{{#ruleSetURL}}{{{ruleSetURL}}}{{/ruleSetURL}}</brs:rule>
        </brs:ruleSet>
        <brs:input namespace="{{inputNamespace}}" wrapperElementName="{{inputWrapperName}}" >
            {{#facts}}
            <brs:fact elementName="{{elementName}}" namespace="{{inputNamespace}}" type="{{factType}}" xpath="{{{propertyExpression}}}" />
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

    let targetNamespaces = [];
    if (data.targetXPath?.namespaces) {
        targetNamespaces.push(...data.targetXPath.namespaces);
    }
    if (data.targetResultXPath?.namespaces) {
        targetNamespaces.push(...data.targetResultXPath.namespaces);
    }
    data.targetNamespaces = targetNamespaces;
    data.targetResultXPath = data.targetResultXPath?.value;
    data.targetXPath = data.targetXPath?.value;
    data.facts = data.factsConfiguration?.map((fact: string[]) => {
        let type_value = getTypeAndValue(fact);
        return {
            elementName: fact[2],
            factType: type_value[0],
            propertyExpression: type_value[1]
        }
    });
    data.results = data.resultsConfiguration?.map((result: string[]) => {
        let type_value = getTypeAndValue(result);
        return {
            resultName: result[2],
            resultType: type_value[0],
            propertyExpression: type_value[1]
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

function getTypeAndValue(fact: string[]) {
    let factType = fact[0];
    if (fact[0] == "CUSTOM") {
        factType = fact[1];
    }
    let value;
    if (fact[3] == "LITERAL") {
        value = fact[4];
    } else if (fact[3] == "EXPRESSION") {
        value = fact[5];
    } else if (fact[3] == "REGISTRY_REFERENCE") {
        value = fact[6];
    }
    return [factType, value];
}

export function getRuleFormDataFromSTNode(data: { [key: string]: any }, node: Rule) {

    data.description = node.description;
    data.sourceXPath = { isExpression: true, value: node.source?.xpath, namespaces: transformNamespaces(node.source?.namespaces) };
    data.sourceValue = node.source?.value;
    data.targetAction = node.target?.action;
    let namespaces = transformNamespaces(node.target?.namespaces);
    data.targetResultXPath = { isExpression: true, value: node.target?.resultXpath, namespaces: namespaces };
    data.targetXPath = { isExpression: true, value: node.target?.xpath, namespaces: namespaces };
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
    data.factsConfiguration = node.input?.fact?.map((fact) => {
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
    data.resultsConfiguration = node.output?.fact?.map((result) => {
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
