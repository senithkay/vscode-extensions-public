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

export function getEntitlementMustacheTemplate() {
    return `
    {{#newMediator}}
    {{#selfClosed}}
    <entitlementService callbackClass="{{callbackClassName}}" {{#client}}client="{{client}}"{{/client}} remoteServicePassword="{{password}}" remoteServiceUrl="{{entitlementServerURL}}" remoteServiceUserName="{{username}}" {{#thriftHost}}thriftHost="{{thriftHost}}"{{/thriftHost}} {{#thriftPort}}thriftPort="{{thriftPort}}"{{/thriftPort}} {{#onAcceptSequenceKey}}onAccept="{{onAcceptSequenceKey}}"{{/onAcceptSequenceKey}} {{#onRejectSequenceKey}}onReject="{{onRejectSequenceKey}}"{{/onRejectSequenceKey}} {{#obligationsSequenceKey}}obligations="{{obligationsSequenceKey}}"{{/obligationsSequenceKey}} {{#adviceSequenceKey}}advice="{{adviceSequenceKey}}"{{/adviceSequenceKey}}/>
    {{/selfClosed}}
    {{^selfClosed}}
    <entitlementService callbackClass="{{callbackClassName}}" {{#client}}client="{{client}}"{{/client}} remoteServicePassword="{{password}}" remoteServiceUrl="{{entitlementServerURL}}" remoteServiceUserName="{{username}}" {{#thriftHost}}thriftHost="{{thriftHost}}"{{/thriftHost}} {{#thriftPort}}thriftPort="{{thriftPort}}"{{/thriftPort}} {{#onAcceptSequenceKey}}onAccept="{{onAcceptSequenceKey}}"{{/onAcceptSequenceKey}} {{#onRejectSequenceKey}}onReject="{{onRejectSequenceKey}}"{{/onRejectSequenceKey}} {{#obligationsSequenceKey}}obligations="{{obligationsSequenceKey}}"{{/obligationsSequenceKey}} {{#adviceSequenceKey}}advice="{{adviceSequenceKey}}"{{/adviceSequenceKey}}>
        {{^onRejectSequenceKey}}<onReject></onReject>{{/onRejectSequenceKey}}
        {{^onAcceptSequenceKey}}<onAccept></onAccept>{{/onAcceptSequenceKey}}
        {{^obligationsSequenceKey}}<obligations></obligations>{{/obligationsSequenceKey}}
        {{^adviceSequenceKey}}<advice></advice>{{/adviceSequenceKey}}
    </entitlementService>
    {{/selfClosed}}
    {{/newMediator}}
    {{^newMediator}}
    {{#editEntitlement}}
    <entitlementService callbackClass="{{callbackClassName}}" {{#client}}client="{{client}}"{{/client}} remoteServicePassword="{{password}}" remoteServiceUrl="{{entitlementServerURL}}" remoteServiceUserName="{{username}}" {{#thriftHost}}thriftHost="{{thriftHost}}"{{/thriftHost}} {{#thriftPort}}thriftPort="{{thriftPort}}"{{/thriftPort}} {{#onAcceptSequenceKey}}onAccept="{{onAcceptSequenceKey}}"{{/onAcceptSequenceKey}} {{#onRejectSequenceKey}}onReject="{{onRejectSequenceKey}}"{{/onRejectSequenceKey}} {{#obligationsSequenceKey}}obligations="{{obligationsSequenceKey}}"{{/obligationsSequenceKey}} {{#adviceSequenceKey}}advice="{{adviceSequenceKey}}"{{/adviceSequenceKey}}>
    {{/editEntitlement}}
    {{#addReject}}
    <onReject></onReject>
    {{/addReject}}
    {{#addAccept}}
    <onAccept></onAccept>
    {{/addAccept}}
    {{#addObligation}}
    <obligations></obligations>
    {{/addObligation}}
    {{#addAdvice}}
    <advice></advice>
    {{/addAdvice}}
    {{#removeReject}}{{/removeReject}}
    {{#removeAccept}}{{/removeAccept}}
    {{#removeObligation}}{{/removeObligation}}
    {{#removeAdvice}}{{/removeAdvice}}
    {{/newMediator}}
    `;
}

export function getEntitlementXml(data: { [key: string]: any }) {

    let client = data.entitlementClientType;
    if (client === "SOAP - Basic Auth (WSO2 IS 4.0.0 or later)") {
        client = "basicAuth";
    } else if (client === "THRIFT") {
        client = "thrift";
    } else if (client === "SOAP - Authentication Admin (WSO2 IS 3.2.3 or earlier)") {
        client = "soap";
    } else if (client === "WSXACML") {
        client = "wsXacml";
    }

    const callbackHandler = data.callbackHandler;
    let callbackClassName = "";
    if (callbackHandler === "UT") {
        callbackClassName = "org.wso2.carbon.identity.entitlement.mediator.callback.UTEntitlementCallbackHandler";
    } else if (callbackHandler === "X509") {
        callbackClassName = "org.wso2.carbon.identity.entitlement.mediator.callback.X509EntitlementCallbackHandler";
    } else if (callbackHandler === "SAML") {
        callbackClassName = "org.wso2.carbon.identity.entitlement.mediator.callback.SAMLEntitlementCallbackHandler";
    } else if (callbackHandler === "Kerberos") {
        callbackClassName = "org.wso2.carbon.identity.entitlement.mediator.callback.KerberosEntitlementCallbackHandler";
    } else if (callbackHandler === "Custom") {
        callbackClassName = data.callbackClassName;
    }
    data.callbackClassName = callbackClassName;

    if (data.onAcceptSequenceType == "ANONYMOUS") delete data.onAcceptSequenceKey;
    if (data.onRejectSequenceType == "ANONYMOUS") delete data.onRejectSequenceKey;
    if (data.obligationsSequenceType == "ANONYMOUS") delete data.obligationsSequenceKey;
    if (data.adviceSequenceType == "ANONYMOUS") delete data.adviceSequenceKey;

    const modifiedData = {
        ...data,
        client: client
    }

    const output = Mustache.render(getEntitlementMustacheTemplate(), modifiedData)?.trim();
    return output;
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

    data.onAcceptSequenceType = node.onAccept ? "ANONYMOUS" : "REGISTRY_REFERENCE";
    data.onRejectSequenceType = node.onReject ? "ANONYMOUS" : "REGISTRY_REFERENCE";
    data.obligationsSequenceType = node.obligations ? "ANONYMOUS" : "REGISTRY_REFERENCE";
    data.adviceSequenceType = node.advice ? "ANONYMOUS" : "REGISTRY_REFERENCE";

    data.ranges = {
        entitlement: node.range,
        accept: node.onAccept?.range,
        reject: node.onReject?.range,
        advice: node.advice?.range,
        obligation: node.obligations?.range
    }
    return data;
}
