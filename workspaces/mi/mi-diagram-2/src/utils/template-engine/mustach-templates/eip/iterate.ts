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

export function getIterateMustacheTemplate() {
    return `
    {{#isNewMediator}}
    <iterate {{#preservePayload}}attachPath="{{attachPath}}"{{/preservePayload}} {{#continueParent}}continueParent="{{continueParent}}"{{/continueParent}} expression="{{iterateExpression}}" id="{{iterateID}}" {{#preservePayload}}preservePayload="{{preservePayload}}"{{/preservePayload}} {{#sequentialMediation}}sequential="{{sequentialMediation}}"{{/sequentialMediation}} {{#description}}description="{{description}}"{{/description}} >
        {{#isAnnonymousSequence}}
        <target>
            <sequence/>
        </target>
        {{/isAnnonymousSequence}}
        {{^isAnnonymousSequence}}
        <target {{#sequenceKey}}sequence="{{sequenceKey}}"{{/sequenceKey}} {{#sequenceName}}sequence="{{sequenceName}}"{{/sequenceName}} />
        {{/isAnnonymousSequence}}
    </iterate>
    {{/isNewMediator}}
    {{^isNewMediator}}
    {{#editIterate}}
    {{#isSelfClosed}}
    <iterate {{#preservePayload}}attachPath="{{attachPath}}"{{/preservePayload}} {{#continueParent}}continueParent="{{continueParent}}"{{/continueParent}} expression="{{iterateExpression}}" id="{{iterateID}}" {{#preservePayload}}preservePayload="{{preservePayload}}"{{/preservePayload}} {{#sequentialMediation}}sequential="{{sequentialMediation}}"{{/sequentialMediation}} />
    {{/isSelfClosed}}
    {{^isSelfClosed}}
    <iterate {{#preservePayload}}attachPath="{{attachPath}}"{{/preservePayload}} {{#continueParent}}continueParent="{{continueParent}}"{{/continueParent}} expression="{{iterateExpression}}" id="{{iterateID}}" {{#preservePayload}}preservePayload="{{preservePayload}}"{{/preservePayload}} {{#sequentialMediation}}sequential="{{sequentialMediation}}"{{/sequentialMediation}} >
    {{/isSelfClosed}}
    {{/editIterate}}
    {{#editTarget}}
    {{#isAnnonymousSequence}}
    <target>
        <sequence/>
    </target>
    {{/isAnnonymousSequence}}
    {{^isAnnonymousSequence}}
    <target {{#sequenceKey}}sequence="{{sequenceKey}}"{{/sequenceKey}} {{#sequenceName}}sequence="{{sequenceName}}"{{/sequenceName}} />
    {{/isAnnonymousSequence}}
    {{/editTarget}}
    {{/isNewMediator}}
    `;
}

export function getIterateXml(data: { [key: string]: any }) {

    if (data.sequenceType === "ANONYMOUS") {
        delete data.sequenceName;
        delete data.sequenceKey;
        data.isAnnonymousSequence = true;
    } else if (data.sequenceType == "REGISTRY_REFERENCE") {
        delete data.sequenceName;
    } else {
        delete data.sequenceKey;
    }

    const output = Mustache.render(getIterateMustacheTemplate(), data).trim();
    return output;
}

export function getIterateFormDataFromSTNode(data: { [key: string]: any }, node: Iterate) {
    data.attachPath = node.attachPath;
    data.continueParent = node.continueParent;
    data.iterateExpression = node.expression;
    data.iterateID = node.id;
    data.preservePayload = node.preservePayload;
    data.sequentialMediation = node.sequential;
    const sequence = node.target?.sequenceAttribute;
    if (sequence) {
        if (sequence.includes("gov:") || sequence.includes("conf:")) {
            data.sequenceKey = sequence;
            data.sequenceType = "REGISTRY_REFERENCE";
            data.prevSeqType = "REGISTRY_REFERENCE";
        } else {
            data.sequenceName = sequence;
            data.sequenceType = "NAMED_REFERENCE";
            data.prevSeqType = "NAMED_REFERENCE";
        }
    } else {
        data.sequenceType = "ANONYMOUS";
        data.prevSeqType = "ANONYMOUS";
    }
    data.description = node.description;
    data.ranges = {
        iterate: node.range,
        target: node.target.range
    }
    return data;
}