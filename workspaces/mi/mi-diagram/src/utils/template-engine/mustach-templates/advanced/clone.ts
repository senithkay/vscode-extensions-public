/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Clone } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from "mustache";
import { checkAttributesExist } from "../../../commons";
import { clone } from "lodash";

export function getCloneMustacheTemplate() {
    return `
    {{#newMediator}}
    <clone {{#continueParent}}continueParent="{{continueParent}}" {{/continueParent}}{{#cloneId}}id="{{cloneId}}" {{/cloneId}}{{#sequentialMediation}}sequential="{{sequentialMediation}}" {{/sequentialMediation}}{{#description}}description="{{description}}" {{/description}}>
    {{#targets}}
    {{#isRegistrySeqAndEndpoint}}
    <target {{#endpointRegistryKey}}endpoint="{{endpointRegistryKey}}" {{/endpointRegistryKey}}{{#sequenceRegistryKey}}sequence="{{sequenceRegistryKey}}" {{/sequenceRegistryKey}}{{#soapAction}}soapAction="{{soapAction}}" {{/soapAction}}{{#toAddress}}to="{{toAddress}}" {{/toAddress}}/>
    {{/isRegistrySeqAndEndpoint}}
    {{^isRegistrySeqAndEndpoint}}
    <target {{#endpointRegistryKey}}endpoint="{{endpointRegistryKey}}" {{/endpointRegistryKey}}{{#sequenceRegistryKey}}sequence="{{sequenceRegistryKey}}" {{/sequenceRegistryKey}}{{#soapAction}}soapAction="{{soapAction}}" {{/soapAction}}{{#toAddress}}to="{{toAddress}}" {{/toAddress}}>      
        {{^sequenceRegistryKey}}
        <sequence></sequence>
        {{/sequenceRegistryKey}}
    </target>
    {{/isRegistrySeqAndEndpoint}}
    {{/targets}}
</clone>
{{/newMediator}}
{{^newMediator}}
{{#editClone}}
<clone {{#continueParent}}continueParent="{{continueParent}}" {{/continueParent}}{{#cloneId}}id="{{cloneId}}" {{/cloneId}}{{#sequentialMediation}}sequential="{{sequentialMediation}}" {{/sequentialMediation}}{{#description}}description="{{description}}" {{/description}}>
{{/editClone}}
{{^editClone}}
{{#newTarget}}
{{#isRegistrySeqAndEndpoint}}
<target {{#endpointRegistryKey}}endpoint="{{endpointRegistryKey}}" {{/endpointRegistryKey}}{{#sequenceRegistryKey}}sequence="{{sequenceRegistryKey}}" {{/sequenceRegistryKey}}{{#soapAction}}soapAction="{{soapAction}}" {{/soapAction}}{{#toAddress}}to="{{toAddress}}" {{/toAddress}}/>
{{/isRegistrySeqAndEndpoint}}
{{^isRegistrySeqAndEndpoint}}
<target {{#endpointRegistryKey}}endpoint="{{endpointRegistryKey}}" {{/endpointRegistryKey}}{{#sequenceRegistryKey}}sequence="{{sequenceRegistryKey}}" {{/sequenceRegistryKey}}{{#soapAction}}soapAction="{{soapAction}}" {{/soapAction}}{{#toAddress}}to="{{toAddress}}" {{/toAddress}}>      
    {{^sequenceRegistryKey}}
    <sequence></sequence>
    {{/sequenceRegistryKey}}
</target>
{{/isRegistrySeqAndEndpoint}}
{{/newTarget}}
{{^newTarget}}
{{#isRegistrySeqAndEndpoint}}
<target {{#endpointRegistryKey}}endpoint="{{endpointRegistryKey}}" {{/endpointRegistryKey}}{{#sequenceRegistryKey}}sequence="{{sequenceRegistryKey}}" {{/sequenceRegistryKey}}{{#soapAction}}soapAction="{{soapAction}}" {{/soapAction}}{{#toAddress}}to="{{toAddress}}" {{/toAddress}}/>
{{/isRegistrySeqAndEndpoint}}
{{^isRegistrySeqAndEndpoint}}
{{#addSequence}}
<target {{#endpointRegistryKey}}endpoint="{{endpointRegistryKey}}" {{/endpointRegistryKey}}{{#sequenceRegistryKey}}sequence="{{sequenceRegistryKey}}" {{/sequenceRegistryKey}}{{#soapAction}}soapAction="{{soapAction}}" {{/soapAction}}{{#toAddress}}to="{{toAddress}}" {{/toAddress}}>
    <sequence></sequence>
</target>
{{/addSequence}}
{{^addSequence}}
{{#removeSequence}}
<target {{#endpointRegistryKey}}endpoint="{{endpointRegistryKey}}" {{/endpointRegistryKey}}{{#sequenceRegistryKey}}sequence="{{sequenceRegistryKey}}" {{/sequenceRegistryKey}}{{#soapAction}}soapAction="{{soapAction}}" {{/soapAction}}{{#toAddress}}to="{{toAddress}}" {{/toAddress}}/>
{{/removeSequence}}
{{^removeSequence}}
{{#selfClosed}}
<target {{#endpointRegistryKey}}endpoint="{{endpointRegistryKey}}" {{/endpointRegistryKey}}{{#sequenceRegistryKey}}sequence="{{sequenceRegistryKey}}" {{/sequenceRegistryKey}}{{#soapAction}}soapAction="{{soapAction}}" {{/soapAction}}{{#toAddress}}to="{{toAddress}}" {{/toAddress}}/>
{{/selfClosed}}
{{^selfClosed}}
<target {{#endpointRegistryKey}}endpoint="{{endpointRegistryKey}}" {{/endpointRegistryKey}}{{#sequenceRegistryKey}}sequence="{{sequenceRegistryKey}}" {{/sequenceRegistryKey}}{{#soapAction}}soapAction="{{soapAction}}" {{/soapAction}}{{#toAddress}}to="{{toAddress}}" {{/toAddress}}>
{{/selfClosed}}
{{/removeSequence}}
{{/addSequence}}
{{/isRegistrySeqAndEndpoint}}
{{/newTarget}}
{{/editClone}}
{{/newMediator}}`;
}

export function getCloneXml(data: { [key: string]: any }, dirtyFields?: any, defaultValues?: any) {
    delete data.soapAction;
    delete data.toAddress;
    if (defaultValues == undefined || Object.keys(defaultValues).length == 0) {
        return getNewMediator(data);
    }

    return getEdits(data, dirtyFields, defaultValues);
}

function getNewMediator(data: { [key: string]: any }) {
    let newData = { ...data };
    newData.newMediator = true;
    if (newData.targets && newData.targets.length > 0) {

        const targets = newData.targets.map((target: string[]) => {
            return processTargetData(target);
        });
        newData.targets = targets;
    }
    const output = Mustache.render(getCloneMustacheTemplate(), newData).trim();
    return output;
}

function processTargetData(target: string[]) {
    let isRegistrySeqAndEndpoint = false;
    let sequenceRegistryKey = undefined;
    let endpointRegistryKey = undefined;

    if (target[0] == "REGISTRY_REFERENCE" || target[0] == "NONE") {
        isRegistrySeqAndEndpoint = true;
    }

    if (target[0] == "REGISTRY_REFERENCE") {
        sequenceRegistryKey = target[1];
    }

    if (target[2] == "REGISTRY_REFERENCE") {
        endpointRegistryKey = target[3];
    }

    return ({
        isRegistrySeqAndEndpoint: isRegistrySeqAndEndpoint,
        sequenceRegistryKey: sequenceRegistryKey,
        endpointRegistryKey: endpointRegistryKey,
        soapAction: target[4],
        toAddress: target[5]
    });
}

function getEdits(data: { [key: string]: any }, dirtyFields: any, defaultValues: any) {

    let edits: { [key: string]: any }[] = [];

    let cloneAttributes = ["cloneId", "sequentialMediation", "continueParent", "description"];
    let dirtyKeys = Object.keys(dirtyFields);

    if (checkAttributesExist(dirtyKeys, cloneAttributes)) {
        let cloneData = { ...data };
        cloneData.editClone = true;
        let range = defaultValues.ranges.clone;
        let editRange = {
            start: range.startTagRange.start,
            end: range.startTagRange.end
        }
        let output = Mustache.render(getCloneMustacheTemplate(), cloneData).trim();
        let edit = {
            text: output,
            range: editRange
        }
        edits.push(edit);
    }

    if (dirtyFields.targets) {
        for (let i = 0; i < data.targets.length; i++) {
            let targetData: { [key: string]: any } = processTargetData(data.targets[i]);
            let editRange;
            let oldIndex = data.targets[i][6];
            // Add new target
            if (oldIndex == undefined) {
                editRange = {
                    start: defaultValues.ranges.clone.endTagRange.start,
                    end: defaultValues.ranges.clone.endTagRange.start
                }
                targetData.newTarget = true;
            } else {
                //Edit existing target
                let oldTarget = getOldTarget(defaultValues.targets, oldIndex);
                targetData.addSequence = oldTarget[0] != "ANONYMOUS" && !targetData.sequenceRegistryKey;
                targetData.removeSequence = oldTarget[0] == "ANONYMOUS" && targetData.isRegistrySeqAndEndpoint;
                let range = getTargetRange(defaultValues.ranges.targets, oldIndex);
                if (!targetData.addSequence && !targetData.removeSequence) {
                    targetData.selfClosed = range?.endTagRange?.end ? false : true;
                    editRange = {
                        start: range.startTagRange.start,
                        end: range.startTagRange.end
                    }
                } else {
                    editRange = {
                        start: range.startTagRange.start,
                        end: range?.endTagRange?.end ? range.endTagRange.end : range.startTagRange.end
                    }
                }
            }
            let output = Mustache.render(getCloneMustacheTemplate(), targetData).trim();
            let edit = {
                text: output,
                range: editRange
            }
            edits.push(edit);
        }
        // Remove deleted targets from xml
        const removedTargets = filterRemovedElements(defaultValues.ranges.targets, data.targets);
        for (let i = 0; i < removedTargets.length; i++) {
            let removedTarget = removedTargets[i];
            let selfClosed = removedTarget[1];
            let editRange;
            if (selfClosed) {
                editRange = removedTarget[2].startTagRange;
            } else {
                editRange = { start: removedTarget[2].startTagRange.start, end: removedTarget[2].endTagRange.end };
            }
            let edit = {
                text: "",
                range: editRange
            }
            edits.push(edit);
        }
    }

    edits.sort((a, b) => b.range.start.line - a.range.start.line);
    return edits;
}

function getOldTarget(targetDatas: any, index: number) {

    for (let i = 0; i < targetDatas.length; i++) {
        if (targetDatas[i][6] == index) {
            return targetDatas[i];
        }
    }
}

function getTargetRange(targetData: any, index: number) {

    for (let i = 0; i < targetData.length; i++) {
        if (targetData[i][0] == index) {
            return targetData[i][2];
        }
    }
}

function filterRemovedElements(arr1: any[], arr2: any[]): any[] {

    const set2 = new Set(arr2.map(subArr => subArr[subArr.length - 1]));
    return arr1.filter(subArr => !set2.has(subArr[0]));
}

export function getCloneFormDataFromSTNode(data: { [key: string]: any }, node: Clone) {

    data.newMediator = false;
    data.cloneId = node.id;
    data.sequentialMediation = node.sequential;
    data.continueParent = node.continueParent;
    data.description = node.description;
    data.cloneTagRange = node.range;
    data.targets = [];
    if (node.target && node.target.length > 0) {
        data.targets = node.target.map((target) => {
            const sequenceType = target.sequenceAttribute ? "REGISTRY_REFERENCE" : target.sequence ? "ANONYMOUS" : "NONE";
            const endpointType = target.endpointAttribute ? "REGISTRY_REFERENCE" : target.endpoint ? "ANONYMOUS" : "NONE";
            return [sequenceType, target.sequenceAttribute, endpointType, target.endpointAttribute, target.soapAction, target.to, node.target.indexOf(target)];
        });
    }
    data.ranges = {
        clone: node.range,
        targets: node.target.map((target) => [node.target.indexOf(target), target.selfClosed, target.range])
    }
    return data;
}

export function getNewCloneTargetXml() {
    return `<target>
    <sequence></sequence>
</target>`
}

export function getTargetDescription(node: any) {
    return node.sequenceAttribute;
}
