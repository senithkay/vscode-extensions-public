/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { OperatorContentType, Policy, Throttle } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from "mustache";

export function getThrottleMustacheTemplate() {

    return `
    {{#newMediator}}
        <throttle description="{{description}}" id="{{groupId}}" {{#onAcceptBranchsequenceKey}}onAccept="{{onAcceptBranchsequenceKey}}"{{/onAcceptBranchsequenceKey}} {{#onRejectBranchsequenceKey}}onReject="{{onRejectBranchsequenceKey}}"{{/onRejectBranchsequenceKey}} >
            {{#policyKey}}<policy key={{policyKey}}/>{{/policyKey}}
            {{^policyKey}}
            <policy>
                <wsp:Policy wsu:id="WSO2MediatorThrottlingPolicy" xmlns:wsp="http://schemas.xmlsoap.org/ws/2004/09/policy" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
                    <throttle:MediatorThrottleAssertion xmlns:throttle="http://www.wso2.org/products/wso2commons/throttle">
                        <throttle:MaximumConcurrentAccess>{{maximumConcurrentAccess}}</throttle:MaximumConcurrentAccess>
                        {{#policyEntries}}
                        <wsp:Policy>
                            <throttle:ID throttle:type="{{throttleType}}">{{throttleRange}}</throttle:ID>
                            <throttle:UnitTime>{{unitTime}}</throttle:UnitTime>
                            <throttle:ProhibitTimePeriod>{{prohibitPeriod}}</throttle:ProhibitTimePeriod>
                            <throttle:MaximumCount>{{maxRequestCount}}</throttle:MaximumCount>
                            <wsp:Policy>
                                <throttle:{{accessType}} />
                            </wsp:Policy>
                        </wsp:Policy>
                        {{/policyEntries}}
                    </throttle:MediatorThrottleAssertion>
                </wsp:Policy>
            </policy>
            {{/policyKey}}
            {{^onAcceptBranchsequenceKey}}
            <onAccept></onAccept>
            {{/onAcceptBranchsequenceKey}}
            {{^onRejectBranchsequenceKey}}
            <onReject></onReject>
            {{/onRejectBranchsequenceKey}}
        </throttle>
    {{/newMediator}}
    {{^newMediator}}
        {{#editThrottle}}
            {{#selfClosed}}
                <throttle description="{{description}}" id="{{groupId}}" {{#onAcceptBranchsequenceKey}}onAccept="{{onAcceptBranchsequenceKey}}"{{/onAcceptBranchsequenceKey}} {{#onRejectBranchsequenceKey}}onReject="{{onRejectBranchsequenceKey}}"{{/onRejectBranchsequenceKey}} />
            {{/selfClosed}}
            {{^selfClosed}}
                <throttle description="{{description}}" id="{{groupId}}" {{#onAcceptBranchsequenceKey}}onAccept="{{onAcceptBranchsequenceKey}}"{{/onAcceptBranchsequenceKey}} {{#onRejectBranchsequenceKey}}onReject="{{onRejectBranchsequenceKey}}"{{/onRejectBranchsequenceKey}} >
            {{/selfClosed}}
            {{/editThrottle}}
        {{#editPolicy}}
            {{#policyKey}}<policy key={{policyKey}} />{{/policyKey}}
            {{^policyKey}}
                <policy>
                    <wsp:Policy wsu:id="WSO2MediatorThrottlingPolicy" xmlns:wsp="http://schemas.xmlsoap.org/ws/2004/09/policy" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
                        <throttle:MediatorThrottleAssertion xmlns:throttle="http://www.wso2.org/products/wso2commons/throttle">
                            <throttle:MaximumConcurrentAccess>{{maximumConcurrentAccess}}</throttle:MaximumConcurrentAccess>
                            {{#policyEntries}}
                            <wsp:Policy>
                                <throttle:ID throttle:type="{{throttleType}}">{{throttleRange}}</throttle:ID>
                                <throttle:UnitTime>{{unitTime}}</throttle:UnitTime>
                                <throttle:ProhibitTimePeriod>{{prohibitPeriod}}</throttle:ProhibitTimePeriod>
                                <throttle:MaximumCount>{{maxRequestCount}}</throttle:MaximumCount>
                                <wsp:Policy>
                                    <throttle:{{accessType}} />
                                </wsp:Policy>
                            </wsp:Policy>
                            {{/policyEntries}}
                        </throttle:MediatorThrottleAssertion>
                    </wsp:Policy>
                </policy>
            {{/policyKey}}
        {{/editPolicy}}
        {{#editOnAccept}}
            {{^onAcceptBranchsequenceKey}}
                <onAccept></onAccept>
            {{/onAcceptBranchsequenceKey}}
        {{/editOnAccept}}
        {{#editOnReject}}
            {{^onRejectBranchsequenceKey}}
                <onReject></onReject>
            {{/onRejectBranchsequenceKey}}
        {{/editOnReject}}
    {{/newMediator}}
    `;
}

export function getThrottleXml(data: { [key: string]: any }) {

    if (data.policyType == "INLINE") delete data.policyKey;
    else data.policyKey = data.policyKey ? data.policyKey : "";
    data.policyEntries = data.policyEntries?.map((entry: string[]) => {
        return {
            throttleType: entry[0],
            throttleRange: entry[1],
            accessType: entry[2],
            maxRequestCount: entry[3],
            unitTime: entry[4],
            prohibitPeriod: entry[5]
        }
    });
    const output = Mustache.render(getThrottleMustacheTemplate(), data)?.trim();
    return output;
}

export function getThrottleFormDataFromSTNode(data: { [key: string]: any }, node: Throttle) {

    data.groupId = node.id;
    data.description = node.description;
    data.selfClosed = node.selfClosed;
    if (node.onAcceptAttribute) {
        data.onAcceptBranchsequenceKey = node.onAcceptAttribute;
        data.onAcceptBranchsequenceType = "REGISTRY_REFERENCE";
    } else {
        data.onAcceptBranchsequenceType = "ANONYMOUS";
    }
    if (node.onRejectAttribute) {
        data.onRejectBranchsequenceKey = node.onRejectAttribute;
        data.onRejectBranchsequenceType = "REGISTRY_REFERENCE";
    }
    else {
        data.onRejectBranchsequenceType = "ANONYMOUS";
    }
    if (node.policy) {
        if (node.policy.key) {
            data.policyType = "REGISTRY_REFERENCE";
            data.policyKey = node.policy.key;
        } else {
            data.policyType = "INLINE";
            data.maximumConcurrentAccess = node.policy.content[0]?.policyOrAllOrExactlyOne[0]?.maximumConcurrentAccess?.textNode;
            data.policyEntries = node.policy.content[0]?.policyOrAllOrExactlyOne[0]?.policy.map((entry: Policy) => {
                const policy = extractPolicyData(entry);
                return [policy.throttleType, policy.throttleRange, policy.accessType, policy.maxRequestCount, policy.unitTime, policy.prohibitPeriod];
            });
        }
    } else {
        data.policyType = "INLINE";
        data.policyEntries = [];
    }

    data.ranges = {
        throttle: node.range,
        policy: node.policy?.range,
        onAccept: node.onAccept?.range,
        onReject: node.onReject?.range
    }
    return data;
}
function extractPolicyData(entry: Policy) {

    let policy: { [key: string]: any } = {};
    if (entry.id) {
        policy.throttleType = entry.id.type;
        policy.throttleRange = entry.id.value;
    }
    entry.policyOrAllOrExactlyOne.forEach((policyEntry: OperatorContentType) => {
        if (policyEntry.tag == "throttle:UnitTime") {
            policy.unitTime = policyEntry.textNode;
        } else if (policyEntry.tag == "throttle:ProhibitTimePeriod") {
            policy.prohibitPeriod = policyEntry.textNode;
        } else if (policyEntry.tag == "throttle:MaximumCount") {
            policy.maxRequestCount = policyEntry.textNode;
        } else if (policyEntry.tag == "wsp:Policy" && policyEntry.policyOrAllOrExactlyOne && policyEntry.policyOrAllOrExactlyOne.length > 0) {
            policy.accessType = policyEntry.policyOrAllOrExactlyOne[0]?.tag?.split(":")[1];
        }
    });
    return policy;
}
