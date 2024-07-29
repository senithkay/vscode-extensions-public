/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Foreach } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from "mustache";
import { transformNamespaces } from "../../../commons";

export function getForeachMustacheTemplate() {
    return `
    {{#isNewMediator}}
    {{#isAnnonymousSequence}}
    <foreach expression="{{forEachExpression}}"{{#forEachID}} id="{{forEachID}}"{{/forEachID}} {{#description}}description="{{description}}"{{/description}}{{#namespaces}} xmlns:{{prefix}}="{{uri}}"{{/namespaces}}>
    <sequence></sequence>
    </foreach>
    {{/isAnnonymousSequence}}
    {{^isAnnonymousSequence}}
    <foreach expression="{{forEachExpression}}"{{#forEachID}} id="{{forEachID}}"{{/forEachID}} {{#sequenceName}}sequence="{{sequenceName}}"{{/sequenceName}} {{#sequenceKey}}sequence="{{sequenceKey}}"{{/sequenceKey}} {{#description}}description="{{description}}"{{/description}}{{#namespaces}} xmlns:{{prefix}}="{{uri}}"{{/namespaces}}/>
    {{/isAnnonymousSequence}}
    {{/isNewMediator}}
    {{^isNewMediator}}
    {{#editForeach}}
    {{#isAnnonymousSequence}}
    <foreach expression="{{forEachExpression}}"{{#forEachID}} id="{{forEachID}}"{{/forEachID}} {{#description}}description="{{description}}"{{/description}}{{#namespaces}} xmlns:{{prefix}}="{{uri}}"{{/namespaces}}>
    {{#addSequence}}
    <sequence></sequence>
    </foreach>
    {{/addSequence}}
    {{/isAnnonymousSequence}}
    {{^isAnnonymousSequence}}
    <foreach expression="{{forEachExpression}}"{{#forEachID}} id="{{forEachID}}"{{/forEachID}} {{#sequenceName}}sequence="{{sequenceName}}"{{/sequenceName}} {{#sequenceKey}}sequence="{{sequenceKey}}"{{/sequenceKey}} {{#description}}description="{{description}}"{{/description}}{{#namespaces}} xmlns:{{prefix}}="{{uri}}"{{/namespaces}}/>
    {{/isAnnonymousSequence}}
    {{/editForeach}}
    {{/isNewMediator}}
    `;
}

export function getForeachXml(data: { [key: string]: any }, dirtyFields?: any, defaultValues?: any) {

    if (data.sequenceType === "Anonymous") {
        data.isAnnonymousSequence = true;
    }
    data.namespaces = data?.forEachExpression?.namespaces;
    data.forEachExpression = data?.forEachExpression?.value;
    if (defaultValues == undefined || Object.keys(defaultValues).length == 0) {
        data.isNewMediator = true;
        const output = Mustache.render(getForeachMustacheTemplate(), data)?.trim();
        return output;
    } else {
        data.editForeach = true;
        let range = defaultValues.range;
        let editRange = range.startTagRange;
        if (defaultValues.sequenceType == "Anonymous" && data.sequenceType == "Key") {
            editRange = {
                start: range.startTagRange.start,
                end: range?.endTagRange?.end ? range.endTagRange.end : range.endTagRange.start
            }
        } else if (defaultValues.sequenceType == "Key" && data.sequenceType == "Anonymous") {
            data.isAnnonymousSequence = true;
            data.addSequence = true;
            editRange = {
                start: range.startTagRange.start,
                end: range?.endTagRange?.end ? range.endTagRange.end : range.endTagRange.start
            }
        }
        if (data.forEachID == "") delete data.forEachID;
        const output = Mustache.render(getForeachMustacheTemplate(), data)?.trim();
        return [{
            text: output,
            range: editRange
        }];
    }
}

export function getForEachFormDataFromSTNode(data: { [key: string]: any }, node: Foreach) {
    data.forEachID = node.id;
    data.forEachExpression = { isExpression: true, value: node.expression, namespaces: transformNamespaces(node.namespaces) };
    if (node.sequenceAttribute) {
        data.sequenceType = "Key";
        data.sequenceKey = node.sequenceAttribute;

    } else if (node.sequence) {
        data.sequenceType = "Anonymous";
    }
    data.prevSequenceType = data.sequenceType;
    data.description = node.description;
    data.range = node.range;
    return data;
}
