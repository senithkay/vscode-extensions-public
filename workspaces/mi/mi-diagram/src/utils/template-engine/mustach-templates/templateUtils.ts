/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import Mustache from "mustache";
import { ENDPOINTS, MEDIATORS } from "../../../constants";
import { getCallFormDataFromSTNode, getCallMustacheTemplate, getCallXml } from "./core/call";
import { Call, Callout, Header, Log, STNode, CallTemplate, PayloadFactory, Property } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import { getLogFormDataFromSTNode, getLogMustacheTemplate, getLogXml } from "./core/log";
import { getCalloutFormDataFromSTNode, getCalloutMustacheTemplate, getCalloutXml } from "./core/callout";
import { getHeaderFormDataFromSTNode, getHeaderMustacheTemplate } from "./core/header";
import { getCallTemplateFormDataFromSTNode, getCallTemplateMustacheTemplate, getCallTemplateXml } from "./core/call-template";
import { getPayloadMustacheTemplate, getPayloadFormDataFromSTNode, getPayloadXml } from "./core/payloadFactory";
import { getPropertyFormDataFromSTNode, getPropertyMustacheTemplate } from "./core/property";
import { getDropMustacheTemplate } from "./core/drop";
import { getLoopbackMustacheTemplate } from "./core/loopback";
import { getPropertyGroupMustacheTemplate } from "./core/propertyGroup";
import { getReponseMustacheTemplate } from "./core/respond";
import { getSendMustacheTemplate } from "./core/send";
import { getHTTPEndpointMustacheTemplate } from "./endpoints/http";
import { getAddressEndpointMustacheTemplate } from "./endpoints/address";
import { getDefaultEndpointMustacheTemplate } from "./endpoints/default";
import { getFailoverEndpointMustacheTemplate } from "./endpoints/failover";
import { getLoadBalanceEndpointMustacheTemplate } from "./endpoints/loadbalance";
import { getNamedEndpointXml } from "./endpoints/named";
import { getRecipientListEndpointMustacheTemplate } from "./endpoints/recipientList";
import { getTemplateEndpointMustacheTemplate } from "./endpoints/template";
import { getWSDLEndpointMustacheTemplate } from "./endpoints/wsdl";

export function getMustacheTemplate(name: string) {
    switch (name) {
        case MEDIATORS.CALLTEMPLATE:
            return getCallTemplateMustacheTemplate();
        case MEDIATORS.CALL:
            return getCallMustacheTemplate();
        case MEDIATORS.CALLOUT:
            return getCalloutMustacheTemplate();
        case MEDIATORS.DROP:
            return getDropMustacheTemplate();
        case MEDIATORS.FILTER:
            return getFilterMustacheTemplate()
        case MEDIATORS.HEADER:
            return getHeaderMustacheTemplate();
        case MEDIATORS.LOG:
            return getLogMustacheTemplate();
        case MEDIATORS.LOOPBACK:
            return getLoopbackMustacheTemplate();
        case MEDIATORS.PAYLOAD:
            return getPayloadMustacheTemplate();
        case MEDIATORS.PROPERTY:
            return getPropertyMustacheTemplate();
        case MEDIATORS.PROPERTYGROUP:
            return getPropertyGroupMustacheTemplate();
        case MEDIATORS.RESPOND:
            return getReponseMustacheTemplate();
        case MEDIATORS.SEND:
            return getSendMustacheTemplate();
        case MEDIATORS.SEQUENCE:
            return getSequenceMustacheTemplate();
        case MEDIATORS.STORE:
            return getStoreMustacheTemplate();
        case MEDIATORS.VALIDATE:
            return getValidateMustacheTemplate();

        // Endpoints
        case ENDPOINTS.ADDRESS:
            return getAddressEndpointMustacheTemplate();
        case ENDPOINTS.DEFAULT:
            return getDefaultEndpointMustacheTemplate();
        case ENDPOINTS.FAILOVER:
            return getFailoverEndpointMustacheTemplate();
        case ENDPOINTS.HTTP:
            return getHTTPEndpointMustacheTemplate();
        case ENDPOINTS.LOADBALANCE:
            return getLoadBalanceEndpointMustacheTemplate();
        case ENDPOINTS.NAMED:
            return getAddressEndpointMustacheTemplate();
        case ENDPOINTS.RECIPIENTLIST:
            return getRecipientListEndpointMustacheTemplate();
        case ENDPOINTS.TEMPLATE:
            return getTemplateEndpointMustacheTemplate();
        case ENDPOINTS.WSDL:
            return getWSDLEndpointMustacheTemplate();
    }
}

export function getXML(name: string, data: { [key: string]: any }) {
    switch (name) {
        case MEDIATORS.CALL:
            return getCallXml(data);
        case MEDIATORS.LOG:
            return getLogXml(data);
        case MEDIATORS.CALLOUT:
            return getCalloutXml(data);
        case MEDIATORS.CALLTEMPLATE:
            return getCallTemplateXml(data)
        case MEDIATORS.PAYLOAD:
            return getPayloadXml(data);
        case ENDPOINTS.NAMED:
            return getNamedEndpointXml(data);    
        default:
            return Mustache.render(getMustacheTemplate(name), data);
    }
}

export function getDataFromXML(name: string, node: STNode) {
    const template = getMustacheTemplate(name);
    const formData = reverseMustache(template, node);

    switch (name) {
        case MEDIATORS.CALL:
            return getCallFormDataFromSTNode(formData, node as Call);
        case MEDIATORS.CALLOUT:
            return getCalloutFormDataFromSTNode(formData, node as Callout);
        case MEDIATORS.HEADER:
            return getHeaderFormDataFromSTNode(formData, node as Header);
        case MEDIATORS.LOG:
            return getLogFormDataFromSTNode(formData, node as Log);
        case MEDIATORS.CALLTEMPLATE:
            return getCallTemplateFormDataFromSTNode(formData, node as CallTemplate);
        case MEDIATORS.PAYLOAD:
            return getPayloadFormDataFromSTNode(formData, node as PayloadFactory);
        case MEDIATORS.PROPERTY:
            return getPropertyFormDataFromSTNode(formData, node as Property);
        default:
            return formData;
    }

}

function reverseMustache(template: string, node: any): { [key: string]: any } {
    const parsedTemplate = Mustache.parse(template);
    const foundVariables: { [key: string]: any } = {};

    parsedTemplate.forEach((item: any) => {
        if (item[0] !== 'text') {
            if (item[4] && item[4].length > 1) {
                const templateKey = item[4][0][1];
                const formKey = item[4][1][1];
                const keyRegex = new RegExp(`\\w+\\s*(?==)`); // Regex to extract the key from the tag
                let key;
                if ((key = keyRegex.exec(templateKey)) !== null && formKey !== null) {
                    if (node[key[0]] !== undefined) {
                        foundVariables[formKey] = node[key[0]];
                    }
                }
            }
        }
    });
    return foundVariables;
}
