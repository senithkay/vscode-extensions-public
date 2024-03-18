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

export function getForeachMustacheTemplate() {
    return `
    {{#editForeach}}
    {{#isAnnonymousSequence}}
    <foreach expression="{{forEachExpression}}" id="{{forEachID}}" {{#description}}description="{{description}}"{{/description}}>
    {{/isAnnonymousSequence}}
    {{^isAnnonymousSequence}}
    <foreach expression="{{forEachExpression}}" id="{{forEachID}}" {{#sequenceName}}sequence="{{sequenceName}}"{{/sequenceName}} {{#sequenceKey}}sequence="{{sequenceKey}}"{{/sequenceKey}} {{#description}}description="{{description}}"{{/description}} />
    {{/isAnnonymousSequence}}
    {{/editForeach}}
    {{^editForeach}}
    {{#isAnnonymousSequence}}
    <foreach expression="{{forEachExpression}}" id="{{forEachID}}">
        <sequence/>
    </foreach>
    {{/isAnnonymousSequence}}
    {{^isAnnonymousSequence}}
    <foreach expression="{{forEachExpression}}" id="{{forEachID}}" {{#sequenceName}}sequence="{{sequenceName}}"{{/sequenceName}} {{#sequenceKey}}sequence="{{sequenceKey}}"{{/sequenceKey}} {{#description}}description="{{description}}"{{/description}} />
    {{/isAnnonymousSequence}}
    {{/editForeach}}
    `;
}

export function getForeachXml(data: { [key: string]: any }) {

    let isAnnonymousSequence = false;
    if (data.sequenceType === "ANONYMOUS") {
        isAnnonymousSequence = true;
    }
    const modifiedData = {
        ...data,
        isAnnonymousSequence: isAnnonymousSequence
    }

    const output = Mustache.render(getForeachMustacheTemplate(), modifiedData)?.trim();
    return output;
}

export function getForEachFormDataFromSTNode(data: { [key: string]: any }, node: Foreach) {
    data.forEachID = node.id;
    data.forEachExpression = node.expression;
    if (node.sequenceAttribute) {
        if (node.sequenceAttribute.startsWith("gov:") || node.sequenceAttribute.startsWith("conf:")) {
            data.sequenceType = "REGISTRY_REFERENCE";
            data.sequenceKey = node.sequenceAttribute;
        } else {
            data.sequenceType = "NAMED_REFERENCE";
            data.sequenceName = node.sequenceAttribute;
        }
    } else if (node.sequence) {
        data.sequenceType = "ANONYMOUS";
    }
    data.prevSequenceType = data.sequenceType;
    data.description = node.description;
    data.range = node.range;
    return data;
}
