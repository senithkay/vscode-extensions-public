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
        <brs:source {{#sourceXPath}}xpath="{{{value}}}"{{#namespaces}} xmlns:{{prefix}}="{{uri}}"{{/namespaces}}{{/sourceXPath}}>{{{sourceValue}}}</brs:source>
        <brs:target action="{{targetAction}}" resultXpath="{{{targetResultXPath}}}" xpath="{{{targetXPath}}}"{{#targetNamespaces}} xmlns:{{prefix}}="{{uri}}"{{/targetNamespaces}}>{{targetValue}}</brs:target>
        <brs:ruleSet>
            <brs:properties />
            <brs:rule resourceType="{{ruleSetType}}"  sourceType="{{ruleSetSourceType}}">{{#ruleSetSourceCode}}<![CDATA[{{{ruleSetSourceCode}}}]]>{{/ruleSetSourceCode}}{{#inlineRegistryKey}}{{inlineRegistryKey}}{{/inlineRegistryKey}}{{#ruleSetURL}}{{{ruleSetURL}}}{{/ruleSetURL}}</brs:rule>
        </brs:ruleSet>
        <brs:input {{#inputNamespace}}namespace="{{inputNamespace}}"{{/inputNamespace}} {{#inputWrapperName}}wrapperElementName="{{inputWrapperName}}"{{/inputWrapperName}} >
            {{#facts}}
            <brs:fact elementName="{{{elementName}}}" namespace="{{inputNamespace}}" type="{{factType}}" xpath="{{{propertyExpression}}}" />
            {{/facts}}
        </brs:input>
        <brs:output {{#outputNamespace}}namespace="{{outputNamespace}}"{{/outputNamespace}} {{#outputWrapperName}}wrapperElementName="{{outputWrapperName}}"{{/outputWrapperName}} >
            {{#results}}
            <brs:fact elementName="{{{resultName}}}" namespace="{{outputNamespace}}" type="{{resultType}}" />
            {{/results}}
        </brs:output>
    </brs:rule>
    `;
}

export function getRuleXml(data: { [key: string]: any }) {

    data.targetNamespaces = data.targetNamespaces?.map((namespace: any) => {
        return {
            prefix: namespace[0],
            uri: namespace[1]
        }
    });
    data.targetResultXPath = data.targetResultXPath?.value;
    data.targetXPath = data.targetXPath?.value;
    data.facts = data.factsConfiguration?.map((fact: string[]) => {
        let factType = getFactType(fact);
        return {
            elementName: fact[2],
            factType: factType,
            propertyExpression: fact[3]
        }
    });
    data.results = data.resultsConfiguration?.map((result: string[]) => {
        let factType = getFactType(result);
        return {
            resultName: result[2],
            resultType: factType
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
    data.ruleSetType = data.ruleSetType?.toLowerCase();
    data.ruleSetSourceType = data.ruleSetSourceType?.toLowerCase();
    data.targetAction = data.targetAction?.toLowerCase();
    const output = Mustache.render(getRuleMustacheTemplate(), data)?.trim();
    return output;
}

function getFactType(fact: string[]) {
    let factType = fact[0];
    if (fact[0] == "CUSTOM") {
        factType = fact[1];
    }
    return factType;
}

export function getRuleFormDataFromSTNode(data: { [key: string]: any }, node: Rule) {

    data.description = node.description;
    data.sourceXPath = { isExpression: true, value: node.source?.xpath, namespaces: transformNamespaces(node.source?.namespaces) };
    data.sourceValue = node.source?.value;
    data.targetAction = node.target?.action;
    data.targetAction = data.targetAction?.charAt(0)?.toUpperCase() + data.targetAction?.slice(1);
    data.targetNamespaces = transformNamespaces(node.target?.namespaces);
    data.targetNamespaces = data.targetNamespaces?.map((namespace: any) => [namespace.prefix, namespace.uri]);
    data.targetResultXPath = { isExpression: true, value: node.target?.resultXpath };
    data.targetXPath = { isExpression: true, value: node.target?.xpath };
    data.targetValue = node.target?.value;
    data.ruleSetType = node.ruleSet?.rule?.resourceType;
    data.ruleSetType = data.ruleSetType?.charAt(0)?.toUpperCase() + data.ruleSetType?.slice(1);
    data.ruleSetSourceType = node.ruleSet?.rule?.sourceType?.toUpperCase();
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
        return [type, customType, fact.elementName, fact.xpath]
    });
    data.resultsConfiguration = node.output?.fact?.map((result) => {
        let type = result.type;
        let customType;
        if (!factTypes.includes(type)) {
            customType = type;
            type = "CUSTOM";
        }
        return [type, customType, result.elementName]
    });

    return data;
}
