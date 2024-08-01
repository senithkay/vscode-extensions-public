/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Aggregate } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from "mustache";
import { checkAttributesExist, transformNamespaces } from "../../../commons";

export function getAggregateMustacheTemplate() {
    return `
    {{#isNewMediator}}
    <aggregate{{#aggregateID}} id="{{aggregateID}}"{{/aggregateID}}{{#description}} description="{{description}}"{{/description}}>
{{#correlationExpression}}<correlateOn expression="{{value}}" {{#namespaces}}xmlns:{{prefix}}="{{uri}}" {{/namespaces}}/>{{/correlationExpression}}
        <completeCondition{{#completionTimeout}} timeout="{{completionTimeout}}"{{/completionTimeout}}>
            <messageCount {{#completionMax}}max="{{completionMax}}" {{/completionMax}}{{#completionMin}}min="{{completionMin}}" {{/completionMin}}{{#messageCountNamespaces}}xmlns:{{prefix}}="{{uri}}" {{/messageCountNamespaces}}/>
        </completeCondition>
        {{#sequenceKey}}
        <onComplete{{#aggregateElementType}} aggregateElementType="{{aggregateElementType}}"{{/aggregateElementType}} {{#enclosingElementProperty}}enclosingElementProperty="{{enclosingElementProperty}}"{{/enclosingElementProperty}} {{#aggregationExpression}}expression="{{value}}" {{#namespaces}}xmlns:{{prefix}}="{{uri}}" {{/namespaces}}{{/aggregationExpression}}{{#sequenceKey}}sequence="{{sequenceKey}}"{{/sequenceKey}}/>
        {{/sequenceKey}}
        {{^sequenceKey}}
        <onComplete{{#aggregateElementType}} aggregateElementType="{{aggregateElementType}}"{{/aggregateElementType}} {{#enclosingElementProperty}}enclosingElementProperty="{{enclosingElementProperty}}"{{/enclosingElementProperty}} {{#aggregationExpression}}expression="{{value}}" {{#namespaces}}xmlns:{{prefix}}="{{uri}}" {{/namespaces}}{{/aggregationExpression}}></onComplete>
        {{/sequenceKey}}
    </aggregate>
    {{/isNewMediator}}
    {{^isNewMediator}}
    {{#editAggregate}}
    <aggregate {{#aggregateID}}id="{{aggregateID}}"{{/aggregateID}}{{#description}} description="{{description}}"{{/description}}>
    {{/editAggregate}}
    {{#editCorrelateOn}}
    {{#correlationExpression}}<correlateOn expression="{{value}}" {{#namespaces}}xmlns:{{prefix}}="{{uri}}" {{/namespaces}}/>{{/correlationExpression}}
    {{/editCorrelateOn}}
    {{#editCompleteCondition}}
    <completeCondition{{#completionTimeout}} timeout="{{completionTimeout}}"{{/completionTimeout}}>
        <messageCount {{#completionMax}}max="{{completionMax}}" {{/completionMax}}{{#completionMin}}min="{{completionMin}}" {{/completionMin}}{{#messageCountNamespaces}}xmlns:{{prefix}}="{{uri}}" {{/messageCountNamespaces}}/>
    </completeCondition>
    {{/editCompleteCondition}}
    {{#editOnComplete}}
    {{#sequenceKey}}
    <onComplete aggregateElementType="{{aggregateElementType}}" {{#enclosingElementProperty}}enclosingElementProperty="{{enclosingElementProperty}}"{{/enclosingElementProperty}} {{#aggregationExpression}}expression="{{value}}" {{#namespaces}}xmlns:{{prefix}}="{{uri}}" {{/namespaces}}{{/aggregationExpression}}{{#sequenceKey}}sequence="{{sequenceKey}}"{{/sequenceKey}}/>
    {{/sequenceKey}}
    {{^sequenceKey}}
    <onComplete aggregateElementType="{{aggregateElementType}}" {{#enclosingElementProperty}}enclosingElementProperty="{{enclosingElementProperty}}"{{/enclosingElementProperty}} {{#aggregationExpression}}expression="{{value}}" {{#namespaces}}xmlns:{{prefix}}="{{uri}}" {{/namespaces}}{{/aggregationExpression}}>
    {{#endOnComplete}}
    </onComplete>
    {{/endOnComplete}}
    {{/sequenceKey}}
    {{/editOnComplete}}
    {{/isNewMediator}}
    `;
}

export function getAggregateXml(data: { [key: string]: any }, dirtyFields?: any, defaultValues?: any) {

    data.completionMax = data.completionMaxMessages?.isExpression ? "{" + data.completionMaxMessages.value + "}" : data.completionMaxMessages.value;
    data.completionMin = data.completionMinMessages?.isExpression ? "{" + data.completionMinMessages.value + "}" : data.completionMinMessages.value;
    let messageCountNamespaces = [];
    if (data.completionMaxMessages?.namespaces) {
        messageCountNamespaces.push(...data.completionMaxMessages?.namespaces);
    }
    if (data.completionMinMessages?.namespaces) {
        messageCountNamespaces.push(...data.completionMinMessages?.namespaces);
    }
    data.messageCountNamespaces = messageCountNamespaces;
    data.aggregateElementType = data.aggregateElementType.toLowerCase();
    if (data.sequenceType == "ANONYMOUS") {
        delete data.sequenceKey;
    }
    if (data.enclosingElementProperty == "") {
        delete data.enclosingElementProperty;
    }
    if (data.correlationExpression?.value == "" || data.correlationExpression?.value == undefined) {
        delete data.correlationExpression;
    }
    if (defaultValues == undefined || Object.keys(defaultValues).length == 0) {
        data.isNewMediator = true;
        const output = Mustache.render(getAggregateMustacheTemplate(), data)?.trim();
        return output;
    }
    return getEdits(data, dirtyFields, defaultValues);
}

function getEdits(data: { [key: string]: any }, dirtyFields?: any, defaultValues?: any) {

    let aggregatteTagAttributes = ["aggregateID", "description"];
    let correlateOnAttributes = ["correlationExpression"];
    let completeConditionAttributes = ["completionTimeout", "completionMaxMessages", "completionMinMessages"];
    let onCompleteAttributes = ["aggregateElementType", "enclosingElementProperty", "aggregationExpression", "sequenceKey", "sequenceType"];
    let dirtyFieldsKeys = Object.keys(dirtyFields);

    let edits: { [key: string]: any }[] = [];

    if (checkAttributesExist(dirtyFieldsKeys, aggregatteTagAttributes)) {
        edits.push(getEdit("aggregate", data, defaultValues, true));
    }

    if (checkAttributesExist(dirtyFieldsKeys, correlateOnAttributes)) {
        edits.push(getEdit("correlateOn", data, defaultValues, false));
    }

    if (checkAttributesExist(dirtyFieldsKeys, completeConditionAttributes)) {
        edits.push(getEdit("completeCondition", data, defaultValues, false));
    }

    if (checkAttributesExist(dirtyFieldsKeys, onCompleteAttributes)) {
        let editStartTagOnly = true;
        if (data.sequenceKey) {
            editStartTagOnly = false;
        } else {
            if (defaultValues.onCompleteSelfClosed) {
                data.endOnComplete = true;
            }
        }
        edits.push(getEdit("onComplete", data, defaultValues, editStartTagOnly));
    }

    edits.sort((a, b) => b.range.start.line - a.range.start.line);
    return edits;
}

function getEdit(key: string, data: { [key: string]: any }, defaultValues: any, editStartTagOnly: boolean) {
    let dataCopy = { ...data };
    let editKey = "edit" + key.charAt(0).toUpperCase() + key.slice(1);
    dataCopy[editKey] = true;
    let range = defaultValues.ranges[key];
    let editRange;
    if (range) {
        editRange = {
            start: range.startTagRange.start,
            end: editStartTagOnly ? range.startTagRange.end : (range.endTagRange?.end ? range.endTagRange.end : range.startTagRange.end)
        }
    } else {
        let aggregateRange = defaultValues.ranges.aggregate;
        editRange = {
            start: aggregateRange.endTagRange.start,
            end: aggregateRange.endTagRange.start
        }
    }
    let output = Mustache.render(getAggregateMustacheTemplate(), dataCopy)?.trim();
    let edit = {
        text: output,
        range: editRange
    };
    return edit;
}

export function getAggregateFormDataFromSTNode(data: { [key: string]: any }, node: Aggregate) {

    data.description = node.description;
    data.aggregateID = node.id;
    data.correlationExpression = { isExpression: true, value: node.correlateOnOrCompleteConditionOrOnComplete?.correlateOn?.expression, namespaces: transformNamespaces(node.correlateOnOrCompleteConditionOrOnComplete?.correlateOn?.namespaces) };
    data.completionTimeout = node.correlateOnOrCompleteConditionOrOnComplete?.completeCondition?.timeout;
    const max = node.correlateOnOrCompleteConditionOrOnComplete?.completeCondition?.messageCount?.max;
    let messageCountNamespaces = transformNamespaces(node.correlateOnOrCompleteConditionOrOnComplete?.completeCondition?.messageCount?.namespaces);
    if (max && max.startsWith("{")) {
        const regex = /{([^}]*)}/;
        const match = max.match(regex);
        data.completionMaxMessages = { isExpression: true, value: match.length > 1 ? match[1] : max, namespaces: messageCountNamespaces };
    } else if (max) {
        data.completionMaxMessages = { isExpression: false, value: max };
    }
    const min = node.correlateOnOrCompleteConditionOrOnComplete?.completeCondition?.messageCount?.min;
    if (min && min.startsWith("{")) {
        const regex = /{([^}]*)}/;
        const match = min.match(regex);
        data.completionMinMessages = { isExpression: true, value: match.length > 1 ? match[1] : min, namespaces: messageCountNamespaces };
    } else if (min) {
        data.completionMinMessages = { isExpression: false, value: min };
    }
    data.aggregateElementType = node.correlateOnOrCompleteConditionOrOnComplete?.onComplete?.aggregateElementType?.toUpperCase();
    data.enclosingElementProperty = node.correlateOnOrCompleteConditionOrOnComplete?.onComplete?.enclosingElementProperty;
    data.aggregationExpression = { isExpression: true, value: node.correlateOnOrCompleteConditionOrOnComplete?.onComplete?.expression, namespaces: transformNamespaces(node.correlateOnOrCompleteConditionOrOnComplete?.onComplete?.namespaces) };
    data.sequenceKey = node.correlateOnOrCompleteConditionOrOnComplete?.onComplete?.sequenceAttribute;
    data.sequenceType = data.sequenceKey ? "REGISTRY REFERENCE" : "ANONYMOUS";
    data.ranges = {
        aggregate: node.range,
        correlateOn: node.correlateOnOrCompleteConditionOrOnComplete?.correlateOn?.range,
        completeCondition: node.correlateOnOrCompleteConditionOrOnComplete?.completeCondition?.range,
        onComplete: node.correlateOnOrCompleteConditionOrOnComplete?.onComplete?.range
    }
    data.onCompleteSelfClosed = node.correlateOnOrCompleteConditionOrOnComplete?.onComplete?.selfClosed;
    data.description = node.description;
    return data;
}

export function getAggregateDescription(node: Aggregate) {
    const onComplete = node?.correlateOnOrCompleteConditionOrOnComplete?.onComplete;
    const isSequnceReference = onComplete.sequenceAttribute !== undefined;

    return isSequnceReference ? onComplete.sequenceAttribute.split(".")[0] : undefined;
}
