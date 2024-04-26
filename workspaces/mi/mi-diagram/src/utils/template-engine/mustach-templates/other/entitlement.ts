/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { EntitlementService } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from "mustache";
import { checkAttributesExist } from "../../../commons";

export function getEntitlementMustacheTemplate() {
    return `
    {{#newMediator}}
    {{#selfClosed}}
    <entitlementService callbackClass="{{callbackClassName}}" {{#client}}client="{{client}}"{{/client}} remoteServicePassword="{{password}}" remoteServiceUrl="{{entitlementServerURL}}" remoteServiceUserName="{{username}}" {{#thriftHost}}thriftHost="{{thriftHost}}"{{/thriftHost}} {{#thriftPort}}thriftPort="{{thriftPort}}"{{/thriftPort}} {{#onAcceptSequenceKey}}onAccept="{{onAcceptSequenceKey}}"{{/onAcceptSequenceKey}} {{#onRejectSequenceKey}}onReject="{{onRejectSequenceKey}}"{{/onRejectSequenceKey}} {{#obligationsSequenceKey}}obligations="{{obligationsSequenceKey}}"{{/obligationsSequenceKey}} {{#adviceSequenceKey}}advice="{{adviceSequenceKey}}"{{/adviceSequenceKey}} {{#description}}description="{{description}}"{{/description}}/>
    {{/selfClosed}}
    {{^selfClosed}}
    <entitlementService callbackClass="{{callbackClassName}}" {{#client}}client="{{client}}"{{/client}} remoteServicePassword="{{password}}" remoteServiceUrl="{{entitlementServerURL}}" remoteServiceUserName="{{username}}" {{#thriftHost}}thriftHost="{{thriftHost}}"{{/thriftHost}} {{#thriftPort}}thriftPort="{{thriftPort}}"{{/thriftPort}} {{#onAcceptSequenceKey}}onAccept="{{onAcceptSequenceKey}}"{{/onAcceptSequenceKey}} {{#onRejectSequenceKey}}onReject="{{onRejectSequenceKey}}"{{/onRejectSequenceKey}} {{#obligationsSequenceKey}}obligations="{{obligationsSequenceKey}}"{{/obligationsSequenceKey}} {{#adviceSequenceKey}}advice="{{adviceSequenceKey}}"{{/adviceSequenceKey}} {{#description}}description="{{description}}"{{/description}}>
        {{^onRejectSequenceKey}}<onReject></onReject>{{/onRejectSequenceKey}}
        {{^onAcceptSequenceKey}}<onAccept></onAccept>{{/onAcceptSequenceKey}}
        {{^obligationsSequenceKey}}<obligations></obligations>{{/obligationsSequenceKey}}
        {{^adviceSequenceKey}}<advice></advice>{{/adviceSequenceKey}}
    </entitlementService>
    {{/selfClosed}}
    {{/newMediator}}
    {{^newMediator}}
    {{#editEntitlement}}
    <entitlementService callbackClass="{{callbackClassName}}" {{#client}}client="{{client}}"{{/client}} remoteServicePassword="{{password}}" remoteServiceUrl="{{entitlementServerURL}}" remoteServiceUserName="{{username}}" {{#thriftHost}}thriftHost="{{thriftHost}}"{{/thriftHost}} {{#thriftPort}}thriftPort="{{thriftPort}}"{{/thriftPort}} {{#onAcceptSequenceKey}}onAccept="{{onAcceptSequenceKey}}"{{/onAcceptSequenceKey}} {{#onRejectSequenceKey}}onReject="{{onRejectSequenceKey}}"{{/onRejectSequenceKey}} {{#obligationsSequenceKey}}obligations="{{obligationsSequenceKey}}"{{/obligationsSequenceKey}} {{#adviceSequenceKey}}advice="{{adviceSequenceKey}}"{{/adviceSequenceKey}} {{#description}}description="{{description}}"{{/description}}>
    {{/editEntitlement}}
    {{#addOnReject}}
    <onReject></onReject>
    {{/addOnReject}}
    {{#addOnAccept}}
    <onAccept></onAccept>
    {{/addOnAccept}}
    {{#addObligation}}
    <obligations></obligations>
    {{/addObligation}}
    {{#addAdvice}}
    <advice></advice>
    {{/addAdvice}}
    {{#removeSequence}}{{/removeSequence}}
    {{/newMediator}}
    `;
}

export function getEntitlementXml(data: { [key: string]: any }, dirtyFields?: any, defaultValues?: any) {

    let client = data.entitlementClientType;
    if (client === "SOAP - Basic Auth (WSO2 IS 4.0.0 or later)") {
        data.client = "basicAuth";
    } else if (client === "THRIFT") {
        data.client = "thrift";
    } else if (client === "SOAP - Authentication Admin (WSO2 IS 3.2.3 or earlier)") {
        data.client = "soap";
    } else if (client === "WSXACML") {
        data.client = "wsXacml";
    }

    const callbackHandler = data.callbackHandler;
    data.callbackClassName = "";
    if (callbackHandler === "UT") {
        data.callbackClassName = "org.wso2.carbon.identity.entitlement.mediator.callback.UTEntitlementCallbackHandler";
    } else if (callbackHandler === "X509") {
        data.callbackClassName = "org.wso2.carbon.identity.entitlement.mediator.callback.X509EntitlementCallbackHandler";
    } else if (callbackHandler === "SAML") {
        data.callbackClassName = "org.wso2.carbon.identity.entitlement.mediator.callback.SAMLEntitlementCallbackHandler";
    } else if (callbackHandler === "Kerberos") {
        data.callbackClassName = "org.wso2.carbon.identity.entitlement.mediator.callback.KerberosEntitlementCallbackHandler";
    } else if (callbackHandler === "Custom") {
        data.callbackClassName = data.callbackClassName;
    }

    if (data.onAcceptSequenceType == "ANONYMOUS") delete data.onAcceptSequenceKey;
    if (data.onRejectSequenceType == "ANONYMOUS") delete data.onRejectSequenceKey;
    if (data.obligationsSequenceType == "ANONYMOUS") delete data.obligationsSequenceKey;
    if (data.adviceSequenceType == "ANONYMOUS") delete data.adviceSequenceKey;

    if (defaultValues === undefined || Object.keys(defaultValues).length == 0) {
        data.newMediator = true;
        const output = Mustache.render(getEntitlementMustacheTemplate(), data)?.trim();
        return output;
    }
    return getEdits(data, dirtyFields, defaultValues);
}

function getEdits(data: { [key: string]: any }, dirtyFields: any, defaultValues: any) {

    let dirtyKeys = Object.keys(dirtyFields);
    let entitlementTagAttributes = ["callbackClassName", "client", "password", "entitlementServerURL", "username", "thriftHost", "thriftPort",
        "onAcceptSequenceKey", "onRejectSequenceKey", "obligationsSequenceKey", "adviceSequenceKey", "onAcceptSequenceType", "onRejectSequenceType",
        "obligationsSequenceType", "adviceSequenceType", "description"];
    let onAcceptTagAttributes = ["onAcceptSequenceType"];
    let onRejectTagAttributes = ["onRejectSequenceType"];
    let adviceTagAttributes = ["adviceSequenceType"];
    let obligationTagAttributes = ["obligationsSequenceType"];
    let edits: { [key: string]: any }[] = [];

    if (checkAttributesExist(dirtyKeys, entitlementTagAttributes)) {
        edits.push(getEdit("edit", "entitlement", data, defaultValues, true));
    }

    if (checkAttributesExist(dirtyKeys, onAcceptTagAttributes)) {
        let onAcceptData = { ...data };
        setEditSeqData(onAcceptData, "onAccept", defaultValues);
        if (onAcceptData.needEdit) { edits.push(getEdit("add", "onAccept", onAcceptData, defaultValues, false)); }
    }

    if (checkAttributesExist(dirtyKeys, onRejectTagAttributes)) {
        let onRejectData = { ...data };
        setEditSeqData(onRejectData, "onReject", defaultValues);
        if (onRejectData.needEdit) { edits.push(getEdit("add", "onReject", onRejectData, defaultValues, false)); }
    }

    if (checkAttributesExist(dirtyKeys, adviceTagAttributes)) {
        let adviceData = { ...data };
        setEditSeqData(adviceData, "advice", defaultValues);
        if (adviceData.needEdit) { edits.push(getEdit("add", "advice", adviceData, defaultValues, false)); }
    }

    if (checkAttributesExist(dirtyKeys, obligationTagAttributes)) {
        let obligationData = { ...data };
        setEditSeqData(obligationData, "obligation", defaultValues);
        if (obligationData.needEdit) { edits.push(getEdit("add", "obligation", obligationData, defaultValues, false)); }
    }
    edits.sort((a, b) => b.range.start - a.range.start);
    return edits;
}

function setEditSeqData(data: { [key: string]: any }, key: string, defaultValues: any) {
    if (defaultValues[key + "SequenceType"] == "REGISTRY_REFERENCE" && data[key + "SequenceType"] == "ANONYMOUS") {
        if (!defaultValues.ranges[key]) {
            data.needEdit = true;
            data["add" + key.charAt(0).toUpperCase() + key.slice(1)] = true;
        }
    } else if (defaultValues[key + "SequenceType"] == "ANONYMOUS" && data[key + "SequenceType"] == "REGISTRY_REFERENCE") {
        data.needEdit = true;
        data.removeSequence = true;
    }
}

function getEdit(prefix: string, key: string, data: { [key: string]: any }, defaultValues: any, editStartTagOnly: boolean) {
    let dataCopy = { ...data };
    if (!data.removeSequence) {
        let editKey = prefix + key.charAt(0).toUpperCase() + key.slice(1);
        dataCopy[editKey] = true;
    }
    let range = defaultValues.ranges[key];
    let editRange;
    if (range) {
        editRange = {
            start: range.startTagRange.start,
            end: editStartTagOnly ? range.startTagRange.end : (range.endTagRange.end ? range.endTagRange.end : range.startTagRange.end)
        }
    } else {
        let entitlementRange = defaultValues.ranges.entitlement;
        editRange = {
            start: entitlementRange.endTagRange.start,
            end: entitlementRange.endTagRange.start
        }
    }
    let output = Mustache.render(getEntitlementMustacheTemplate(), dataCopy)?.trim();
    let edit = {
        text: output,
        range: editRange
    };
    return edit;
}


export function getEntitlementFormDataFromSTNode(data: { [key: string]: any }, node: EntitlementService) {

    let client = node.client;
    if (client === "basicAuth") {
        data.entitlementClientType = "SOAP - Basic Auth (WSO2 IS 4.0.0 or later)";
    } else if (client === "thrift") {
        data.entitlementClientType = "THRIFT";
    } else if (client === "soap") {
        data.entitlementClientType = "SOAP - Authentication Admin (WSO2 IS 3.2.3 or earlier)";
    } else if (client === "wsXacml") {
        data.entitlementClientType = "WSXACML";
    }

    const callbackClassName = node.callbackClass;
    if (callbackClassName === "org.wso2.carbon.identity.entitlement.mediator.callback.UTEntitlementCallbackHandler") {
        data.callbackHandler = "UT";
    } else if (callbackClassName === "org.wso2.carbon.identity.entitlement.mediator.callback.X509EntitlementCallbackHandler") {
        data.callbackHandler = "X509";
    } else if (callbackClassName === "org.wso2.carbon.identity.entitlement.mediator.callback.SAMLEntitlementCallbackHandler") {
        data.callbackHandler = "SAML";
    } else if (callbackClassName === "org.wso2.carbon.identity.entitlement.mediator.callback.KerberosEntitlementCallbackHandler") {
        data.callbackHandler = "Kerberos";
    } else {
        data.callbackHandler = "Custom";
        data.callbackClassName = callbackClassName;
    }

    data.description = node.description;
    data.client = node.client;
    data.password = node.remoteServicePassword;
    data.entitlementServerURL = node.remoteServiceUrl;
    data.username = node.remoteServiceUserName;
    data.thriftHost = node.thriftHost;
    data.thriftPort = node.thriftPort;
    data.onAcceptSequenceKey = node.onAcceptAttribute;
    data.onRejectSequenceKey = node.onRejectAttribute;
    data.obligationsSequenceKey = node.obligationsAttribute;
    data.adviceSequenceKey = node.adviceAttribute;

    data.onAcceptSequenceType = data.onAcceptSequenceKey ? "REGISTRY_REFERENCE" : "ANONYMOUS";
    data.onRejectSequenceType = data.onRejectSequenceKey ? "REGISTRY_REFERENCE" : "ANONYMOUS";
    data.obligationsSequenceType = data.obligationsSequenceKey ? "REGISTRY_REFERENCE" : "ANONYMOUS";
    data.adviceSequenceType = data.adviceSequenceKey ? "REGISTRY_REFERENCE" : "ANONYMOUS";

    data.ranges = {
        entitlement: node.range,
        onAccept: node.onAccept?.range,
        onReject: node.onReject?.range,
        advice: node.advice?.range,
        obligation: node.obligations?.range
    }
    return data;
}
