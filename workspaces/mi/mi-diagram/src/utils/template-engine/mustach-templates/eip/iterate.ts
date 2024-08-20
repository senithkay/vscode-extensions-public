/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Iterate } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from "mustache";
import { checkAttributesExist, transformNamespaces } from "../../../commons";

export function getIterateMustacheTemplate() {
    return `
    {{#isNewMediator}}
    <iterate {{#preservePayload}}{{#attachPath}} attachPath="{{attachPath}}"{{/attachPath}}{{/preservePayload}} {{#continueParent}}continueParent="{{continueParent}}"{{/continueParent}} expression="{{iterateExpression}}"{{#iterateID}} id="{{iterateID}}"{{/iterateID}}{{#preservePayload}} preservePayload="{{preservePayload}}"{{/preservePayload}} {{#sequentialMediation}}sequential="{{sequentialMediation}}"{{/sequentialMediation}} {{#description}}description="{{description}}"{{/description}}{{#namespaces}} xmlns:{{prefix}}="{{uri}}"{{/namespaces}}>
        {{#isAnnonymousSequence}}
        <target>
            <sequence></sequence>
        </target>
        {{/isAnnonymousSequence}}
        {{^isAnnonymousSequence}}
        <target sequence="{{sequenceKey}}" />
        {{/isAnnonymousSequence}}
    </iterate>
    {{/isNewMediator}}
    {{^isNewMediator}}
    {{#editIterate}}
    {{#isSelfClosed}}
    <iterate {{#preservePayload}}{{#attachPath}} attachPath="{{attachPath}}"{{/attachPath}}{{/preservePayload}} {{#continueParent}}continueParent="{{continueParent}}"{{/continueParent}} expression="{{iterateExpression}}"{{#iterateID}} id="{{iterateID}}"{{/iterateID}}{{#preservePayload}}preservePayload="{{preservePayload}}"{{/preservePayload}} {{#sequentialMediation}}sequential="{{sequentialMediation}}" {{/sequentialMediation}}{{#description}}description="{{description}}"{{/description}}{{#namespaces}} xmlns:{{prefix}}="{{uri}}"{{/namespaces}}/>
    {{/isSelfClosed}}
    {{^isSelfClosed}}
    <iterate {{#preservePayload}}{{#attachPath}} attachPath="{{attachPath}}"{{/attachPath}}{{/preservePayload}} {{#continueParent}}continueParent="{{continueParent}}"{{/continueParent}} expression="{{iterateExpression}}"{{#iterateID}} id="{{iterateID}}"{{/iterateID}}{{#preservePayload}}preservePayload="{{preservePayload}}"{{/preservePayload}} {{#sequentialMediation}}sequential="{{sequentialMediation}}" {{/sequentialMediation}}{{#description}}description="{{description}}"{{/description}}{{#namespaces}} xmlns:{{prefix}}="{{uri}}"{{/namespaces}}>
    {{/isSelfClosed}}
    {{/editIterate}}
    {{#editTarget}}
    {{#isAnnonymousSequence}}
    <target>
        <sequence></sequence>
    </target>
    {{/isAnnonymousSequence}}
    {{^isAnnonymousSequence}}
    <target sequence="{{sequenceKey}}" />
    {{/isAnnonymousSequence}}
    {{/editTarget}}
    {{/isNewMediator}}
    `;
}

export function getIterateXml(data: { [key: string]: any }, dirtyFields?: any, defaultValues?: any) {

    if (data.sequenceType === "Anonymous") {
        delete data.sequenceKey;
        data.isAnnonymousSequence = true;
    }
    data.namespaces = data?.iterateExpression?.namespaces;
    data.iterateExpression = data?.iterateExpression?.value;
    data.attachPath = data?.attachPath?.value;

    if (defaultValues == undefined || Object.keys(defaultValues).length == 0) {
        data.isNewMediator = true;
        const output = Mustache.render(getIterateMustacheTemplate(), data).trim();
        return output;
    }
    return getEdits(data, dirtyFields, defaultValues);
}

function getEdits(data: { [key: string]: any }, dirtyFields: any, defaultValues: any) {

    let dirtyKeys = Object.keys(dirtyFields);
    let iteratTagAttributes = ["attachPath", "continueParent", "iterateExpression", "iterateID", "preservePayload", "sequentialMediation", "description"];
    let targetTagAttributes = ["sequenceKey"];

    let edits: { [key: string]: any }[] = [];
    if (checkAttributesExist(dirtyKeys, iteratTagAttributes)) {
        let dataCopy = { ...data }
        dataCopy.selfClosed = defaultValues.selfClosed;
        dataCopy.editIterate = true;
        let range = defaultValues.ranges.iterate;
        let editRange = {
            start: range.startTagRange.start,
            end: range.startTagRange.end
        }
        let output = Mustache.render(getIterateMustacheTemplate(), dataCopy)?.trim();
        let edit = {
            range: editRange,
            text: output
        }
        edits.push(edit);
    }

    if (checkAttributesExist(dirtyKeys, targetTagAttributes)) {
        let dataCopy = { ...data }
        dataCopy.editTarget = true;
        let range = defaultValues.ranges.target;
        let editRange = {
            start: range.startTagRange.start,
            end: range?.endTagRange?.end ? range.endTagRange.end : range.startTagRange.end
        }
        let output = Mustache.render(getIterateMustacheTemplate(), dataCopy)?.trim();
        let edit = {
            range: editRange,
            text: output
        }
        edits.push(edit);
    }
    return edits;
}

export function getIterateFormDataFromSTNode(data: { [key: string]: any }, node: Iterate) {
    data.attachPath = { isExpression: true, value: node.attachPath };
    data.continueParent = node.continueParent;
    data.iterateExpression = { isExpression: true, value: node.expression, namespaces: transformNamespaces(node.namespaces) };
    data.iterateID = node.id;
    data.preservePayload = node.preservePayload;
    data.sequentialMediation = node.sequential;
    const sequence = node.target?.sequenceAttribute;
    if (sequence) {
        data.sequenceType = "Key"
        data.sequenceKey = sequence;
    } else {
        data.sequenceType = "Anonymous";
    }
    data.description = node.description;
    data.ranges = {
        iterate: node.range,
        target: node.target.range
    }
    data.isSelfClosed = node.selfClosed;
    return data;
}
