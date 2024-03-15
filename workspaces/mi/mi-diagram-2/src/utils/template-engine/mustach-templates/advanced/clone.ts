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
        <sequence />
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
{{#isRegistrySeqAndEndpoint}}
<target {{#endpointRegistryKey}}endpoint="{{endpointRegistryKey}}" {{/endpointRegistryKey}}{{#sequenceRegistryKey}}sequence="{{sequenceRegistryKey}}" {{/sequenceRegistryKey}}{{#soapAction}}soapAction="{{soapAction}}" {{/soapAction}}{{#toAddress}}to="{{toAddress}}" {{/toAddress}}/>
{{/isRegistrySeqAndEndpoint}}
{{^isRegistrySeqAndEndpoint}}
<target {{#endpointRegistryKey}}endpoint="{{endpointRegistryKey}}" {{/endpointRegistryKey}}{{#sequenceRegistryKey}}sequence="{{sequenceRegistryKey}}" {{/sequenceRegistryKey}}{{#soapAction}}soapAction="{{soapAction}}" {{/soapAction}}{{#toAddress}}to="{{toAddress}}" {{/toAddress}}>      
    {{^sequenceRegistryKey}}
    <sequence />
    {{/sequenceRegistryKey}}
{{/isRegistrySeqAndEndpoint}}
{{/editClone}}
{{/newMediator}}`;
}

export function getCloneXml(data: { [key: string]: any }) {
    delete data.soapAction;
    delete data.toAddress;
    if (data.newMediator) {
        if (data.targets && data.targets.length > 0) {

            const targets = data.targets.map((target: string[]) => {
                let isRegistrySeqAndEndpoint = false;
                let sequenceRegistryKey = target[1];
                let endpointRegistryKey = target[3];

                if (target[0] == "REGISTRY_REFERENCE" && target[2] == "REGISTRY_REFERENCE") {
                    isRegistrySeqAndEndpoint = true;
                }

                if (target[0] == "NONE") {
                    sequenceRegistryKey = undefined;
                } else if (target[0] == "ANONYMOUS") {
                    sequenceRegistryKey = undefined
                }

                if (target[2] == "NONE") {
                    endpointRegistryKey = undefined;
                } else if (target[2] == "ANONYMOUS") {
                    endpointRegistryKey = undefined
                }

                if (target[0] == "NONE" && target[2] == "NONE") {
                    isRegistrySeqAndEndpoint = true;
                }

                return ({
                    isRegistrySeqAndEndpoint: isRegistrySeqAndEndpoint,
                    sequenceRegistryKey: sequenceRegistryKey,
                    endpointRegistryKey: endpointRegistryKey,
                    soapAction: target[4],
                    toAddress: target[5]
                })
            });
            data.targets = targets;
        }
    }

    const output = Mustache.render(getCloneMustacheTemplate(), data).trim();
    return output;
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
            return [sequenceType, target.sequenceAttribute, endpointType, target.endpointAttribute, target.soapAction, target.to, target.range];
        });
    }
    return data;
}

export function getNewCloneTargetXml() {
    return `<target>
</target>`
}
