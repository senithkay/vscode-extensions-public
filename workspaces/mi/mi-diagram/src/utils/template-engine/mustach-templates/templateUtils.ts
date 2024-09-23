/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import Mustache from "mustache";
import { getCallFormDataFromSTNode, getCallMustacheTemplate, getCallXml } from "./core/call";
import { Call, Callout, Header, Log, STNode, CallTemplate, PayloadFactory, Property, Jsontransform, Xquery, Xslt, DataServiceCall, DbMediator, Class, PojoCommand, Ejb, ConditionalRouter, Switch, Bean, Script, Store, Validate, PropertyGroup, Transaction, Event, Clone, Cache, Send, Aggregate, Iterate, Filter, NamedEndpoint, Foreach, Bam, OauthService, Builder, PublishEvent, EntitlementService, Rule, Ntlm, Enrich, FastXSLT, Makefault, Smooks, Throttle, Rewrite, FilterSequence } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import { getLogFormDataFromSTNode, getLogMustacheTemplate, getLogXml } from "./core/log";
import { getCalloutFormDataFromSTNode, getCalloutMustacheTemplate, getCalloutXml } from "./core/callout";
import { getHeaderFormDataFromSTNode, getHeaderMustacheTemplate, getHeaderXml } from "./core/header";
import { getCallTemplateFormDataFromSTNode, getCallTemplateMustacheTemplate, getCallTemplateXml } from "./core/call-template";
import { getPayloadMustacheTemplate, getPayloadFormDataFromSTNode, getPayloadXml } from "./transformation/payloadFactory";
import { getPropertyFormDataFromSTNode, getPropertyMustacheTemplate, getPropertyXml } from "./core/property";
import { getDropMustacheTemplate } from "./core/drop";
import { getLoopbackMustacheTemplate } from "./core/loopback";
import { getPropertyGroupFormDataFromSTNode, getPropertyGroupMustacheTemplate, getPropertyGroupXml } from "./core/propertyGroup";
import { getReponseMustacheTemplate } from "./core/respond";
import { getSendFormDataFromSTNode, getSendMustacheTemplate, getSendXml } from "./core/send";
import { getHTTPEndpointFormDataFromSTNode, getHTTPEndpointMustacheTemplate, getHTTPEndpointXml } from "./endpoints/http";
import { getAddressEndpointMustacheTemplate } from "./endpoints/address";
import { getDefaultEndpointMustacheTemplate } from "./endpoints/default";
import { getFailoverEndpointMustacheTemplate } from "./endpoints/failover";
import { getLoadBalanceEndpointMustacheTemplate } from "./endpoints/loadbalance";
import { getNamedEndpointXml } from "./endpoints/named";
import { getRecipientListEndpointMustacheTemplate } from "./endpoints/recipientList";
import { getTemplateEndpointMustacheTemplate } from "./endpoints/template";
import { getWSDLEndpointMustacheTemplate } from "./endpoints/wsdl";
import { MEDIATORS, ENDPOINTS, SERVICE, DATA_SERVICE_NODES, DATA_SERVICE } from "../../../resources/constants";
import { getFilterFormDataFromSTNode, getFilterMustacheTemplate, getFilterXml } from "./filter/filter";
import { getSequenceMustacheTemplate, getSequenceDataFromSTNode, getSequenceXml } from "./core/sequence";
import { getStoreFormDataFromSTNode, getStoreMustacheTemplate, getStoreXml } from "./core/store";
import { getValidateFormDataFromSTNode, getValidateMustacheTemplate, getValidateXml } from "./core/validate";
import { getBeanFormDataFromSTNode, getBeanMustacheTemplate, getBeanXml } from "./extension/bean";
import { getClassFormDataFromSTNode, getClassMustacheTemplate, getClassXml } from "./extension/class";
import { getCommandFormDataFromSTNode, getCommandMustacheTemplate, getCommandXml } from "./extension/command";
import { getEjbFormDataFromSTNode, getEjbMustacheTemplate, getEjbXml } from "./extension/ejb";
import { getScriptFormDataFromSTNode, getScriptMustacheTemplate, getScriptXml } from "./extension/script";
import { getSpringMustacheTemplate } from "./extension/spring";
import { getCloneFormDataFromSTNode, getCloneMustacheTemplate, getCloneXml, getNewCloneTargetXml } from "./advanced/clone";
import { getDataSerivceCallXml, getDataServiceCallFormDataFromSTNode, getDataServiceCallMustacheTemplate } from "./data/dataServiceCall";
import { getEnqueueMustacheTemplate } from "./advanced/enqueue";
import { getEventFormDataFromSTNode, getEventMustacheTemplate, getEventXml } from "./advanced/event";
import { getTransactionFormDataFromSTNode, getTransactionMustacheTemplate, getTransactionXml } from "./advanced/transaction";
import { getCacheFormDataFromSTNode, getCacheMustacheTemplate, getCacheXml } from "./advanced/cache";
import { getAggregateFormDataFromSTNode, getAggregateMustacheTemplate, getAggregateXml } from "./eip/aggregate";
import { getIterateFormDataFromSTNode, getIterateMustacheTemplate, getIterateXml } from "./eip/iterate";
import { getNewSwitchCaseXml, getSwitchFormDataFromSTNode, getSwitchMustacheTemplate, getSwitchXml } from "./filter/switch";
import { getForEachFormDataFromSTNode, getForeachMustacheTemplate, getForeachXml } from "./eip/foreach";
import { getBamFormDataFromSTNode, getBamMustacheTemplate } from "./other/bam";
import { getConditionalRouterFormDataFromSTNode, getConditionalRouterMustacheTemplate, getConditionalRouterXml } from "./filter/cond_router";
import { getOauthFormDataFromSTNode, getOauthMustacheTemplate, getOauthXml } from "./other/oauth";
import { getBuilderFormDataFromSTNode, getBuilderMustacheTemplate, getBuilderXml } from "./other/builder";
import { getPublishEventFormDataFromSTNode, getPublishEventMustacheTemplate, getPublishEventXml } from "./other/publishEvent";
import { getEntitlementFormDataFromSTNode, getEntitlementMustacheTemplate, getEntitlementXml } from "./other/entitlement";
import { getRuleFormDataFromSTNode, getRuleMustacheTemplate, getRuleXml } from "./other/rule";
import { getNtlmFormDataFromSTNode, getNtlmMustacheTemplate, getNtlmXml } from "./other/ntlm";
import { getDatamapperMustacheTemplate } from "./transformation/datamapper";
import { getEnrichFormDataFromSTNode, getEnrichMustacheTemplate, getEnrichXml } from "./transformation/enrich";
import { getFastXSLTFormDataFromSTNode, getFastXSLTMustacheTemplate, getFastXSLTXml } from "./transformation/fastXSLT";
import { getFaultFormDataFromSTNode, getFaultMustacheTemplate, getFaultXml } from "./transformation/fault";
import { getJsonTransformFormDataFromSTNode, getJsonTransformMustacheTemplate, getJsonTransformXml } from "./transformation/jsonTransform";
import { getSmooksFormDataFromSTNode, getSmooksMustacheTemplate, getSmooksXml } from "./transformation/smooks";
import { getXqueryFormDataFromSTNode, getXqueryMustacheTemplate, getXqueryXml } from "./transformation/xquery";
import { getXsltFormDataFromSTNode, getXsltMustacheTemplate, getXsltXml } from "./transformation/xslt";
import { getThrottleFormDataFromSTNode, getThrottleXml } from "./filter/throttle";
import { getRewriteFormDataFromSTNode, getRewriteMustacheTemplate, getRewriteXml } from "./other/rewrite";
import { getDBLookupFormDataFromSTNode, getDBLookupMustacheTemplate, getDblookupXml } from "./data/dblookup";
import { getDBReportFormDataFromSTNode, getDBReportMustacheTemplate, getDbReportXml } from "./data/dbreport";
import { getDSInputMappingsFromSTNode, getDSOutputMappingsFromSTNode, getDSQueryFromSTNode, getDSTransformationFromSTNode } from "./dataservice/ds";
import { Query } from "@wso2-enterprise/mi-syntax-tree/src";
import { getDssQueryXml, getDssResourceQueryParamsXml, getDssResourceSelfClosingXml, getDssResourceXml } from "./dataservice/ds-templates";
import { RpcClient } from "@wso2-enterprise/mi-rpc-client";

export function getMustacheTemplate(name: string) {
    switch (name) {
        //Advanced Mediators
        case MEDIATORS.CACHE:
            return getCacheMustacheTemplate();
        case MEDIATORS.CLONE:
            return getCloneMustacheTemplate();
        case MEDIATORS.DATASERVICECALL:
            return getDataServiceCallMustacheTemplate();
        case MEDIATORS.DBLOOKUP:
            return getDBLookupMustacheTemplate();
        case MEDIATORS.DBREPORT:
            return getDBReportMustacheTemplate();
        case MEDIATORS.ENQUEUE:
            return getEnqueueMustacheTemplate();
        case MEDIATORS.EVENT:
            return getEventMustacheTemplate();
        case MEDIATORS.TRANSACTION:
            return getTransactionMustacheTemplate();
        //Core Mediators 
        case MEDIATORS.CALLTEMPLATE:
            return getCallTemplateMustacheTemplate();
        case MEDIATORS.CALL:
            return getCallMustacheTemplate();
        case MEDIATORS.CALLOUT:
            return getCalloutMustacheTemplate();
        case MEDIATORS.DROP:
            return getDropMustacheTemplate();
        case MEDIATORS.HEADER:
            return getHeaderMustacheTemplate();
        case MEDIATORS.LOG:
            return getLogMustacheTemplate();
        case MEDIATORS.LOOPBACK:
            return getLoopbackMustacheTemplate();
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
        case MEDIATORS.SEND:
            return getSendMustacheTemplate();
        //EIP Mediators
        case MEDIATORS.AGGREGATE:
            return getAggregateMustacheTemplate();
        case MEDIATORS.ITERATE:
            return getIterateMustacheTemplate();
        case MEDIATORS.FOREACHMEDIATOR:
            return getForeachMustacheTemplate();
        //Filter Mediators
        case MEDIATORS.FILTER:
            return getFilterMustacheTemplate();
        case MEDIATORS.SWITCH:
            return getSwitchMustacheTemplate();
        case MEDIATORS.THROTTLE:
            return getTransactionMustacheTemplate();
        //Transformation Mediators
        case MEDIATORS.PAYLOAD:
            return getPayloadMustacheTemplate();
        case MEDIATORS.CONDITIONALROUTER:
            return getConditionalRouterMustacheTemplate();
        case MEDIATORS.DATAMAPPER:
            return getDatamapperMustacheTemplate();
        case MEDIATORS.ENRICH:
            return getEnrichMustacheTemplate();
        case MEDIATORS.FASTXSLT:
            return getFastXSLTMustacheTemplate();
        case MEDIATORS.FAULT:
            return getFaultMustacheTemplate();
        case MEDIATORS.JSONTRANSFORM:
            return getJsonTransformMustacheTemplate();
        case MEDIATORS.SMOOKS:
            return getSmooksMustacheTemplate();
        case MEDIATORS.XQUERY:
            return getXqueryMustacheTemplate();
        case MEDIATORS.XSLT:
            return getXsltMustacheTemplate();
        //Extension Mediators
        case MEDIATORS.BEAN:
            return getBeanMustacheTemplate()
        case MEDIATORS.CLASS:
            return getClassMustacheTemplate();
        case MEDIATORS.COMMAND:
            return getCommandMustacheTemplate();
        case MEDIATORS.EJB:
            return getEjbMustacheTemplate();
        case MEDIATORS.SCRIPT:
            return getScriptMustacheTemplate();
        case MEDIATORS.SPRING:
            return getSpringMustacheTemplate();
        //Other Mediators
        case MEDIATORS.BAM:
            return getBamMustacheTemplate();
        case MEDIATORS.OAUTH:
            return getOauthMustacheTemplate();
        case MEDIATORS.BUILDER:
            return getBuilderMustacheTemplate();
        case MEDIATORS.PUBLISHEVENT:
            return getPublishEventMustacheTemplate();
        case MEDIATORS.ENTITLEMENT:
            return getEntitlementMustacheTemplate();
        case MEDIATORS.RULE:
            return getRuleMustacheTemplate();
        case MEDIATORS.NTLM:
            return getNtlmMustacheTemplate();
        case MEDIATORS.REWRITE:
            return getRewriteMustacheTemplate();

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

export function getXML(name: string, data: { [key: string]: any }, dirtyFields?: any, defaultValues?: any) {
    const getTemplateRendered = () => {
        switch (name) {
            //Advanced Mediators
            case MEDIATORS.CACHE:
                return getCacheXml(data, dirtyFields, defaultValues);
            case MEDIATORS.CLONE:
                return getCloneXml(data, dirtyFields, defaultValues);
            case MEDIATORS.DATASERVICECALL:
                return getDataSerivceCallXml(data);
            case MEDIATORS.DBLOOKUP:
                return getDblookupXml(data);
            case MEDIATORS.DBREPORT:
                return getDbReportXml(data);
            case MEDIATORS.TRANSACTION:
                return getTransactionXml(data);
            case MEDIATORS.EVENT:
                return getEventXml(data);
            //Core Mediators
            case MEDIATORS.CALL:
                return getCallXml(data, dirtyFields, defaultValues);
            case MEDIATORS.LOG:
                return getLogXml(data);
            case MEDIATORS.CALLOUT:
                return getCalloutXml(data);
            case MEDIATORS.CALLTEMPLATE:
                return getCallTemplateXml(data)
            case MEDIATORS.PROPERTY:
                return getPropertyXml(data);
            case MEDIATORS.PROPERTYGROUP:
                return getPropertyGroupXml(data);
            case MEDIATORS.STORE:
                return getStoreXml(data);
            case MEDIATORS.VALIDATE:
                return getValidateXml(data, dirtyFields, defaultValues);
            case MEDIATORS.SEND:
                return getSendXml(data, dirtyFields, defaultValues);
            case MEDIATORS.PAYLOAD:
                return getPayloadXml(data);
            case MEDIATORS.HEADER:
                return getHeaderXml(data);
            case ENDPOINTS.NAMED:
                return getNamedEndpointXml(data);
            //EIP Mediators
            case MEDIATORS.AGGREGATE:
                return getAggregateXml(data, dirtyFields, defaultValues);
            case MEDIATORS.ITERATE:
                return getIterateXml(data, dirtyFields, defaultValues);
            case MEDIATORS.FOREACHMEDIATOR:
                return getForeachXml(data, dirtyFields, defaultValues);
            //Filter Mediators
            case MEDIATORS.FILTER:
                return getFilterXml(data, dirtyFields, defaultValues);
            case MEDIATORS.SWITCH:
                return getSwitchXml(data, dirtyFields, defaultValues);
            case MEDIATORS.THROTTLE:
                return getThrottleXml(data, dirtyFields, defaultValues);
            //Transformation Mediators
            case MEDIATORS.PAYLOAD:
                return getPayloadXml(data);
            case MEDIATORS.CONDITIONALROUTER:
                return getConditionalRouterXml(data);
            case MEDIATORS.ENRICH:
                return getEnrichXml(data);
            case MEDIATORS.FASTXSLT:
                return getFastXSLTXml(data);
            case MEDIATORS.FAULT:
                return getFaultXml(data);
            case MEDIATORS.JSONTRANSFORM:
                return getJsonTransformXml(data);
            case MEDIATORS.SMOOKS:
                return getSmooksXml(data);
            case MEDIATORS.XQUERY:
                return getXqueryXml(data);
            case MEDIATORS.XSLT:
                return getXsltXml(data);
            //Extension Mediators    
            case MEDIATORS.BEAN:
                return getBeanXml(data);
            case MEDIATORS.CLASS:
                return getClassXml(data);
            case MEDIATORS.EJB:
                return getEjbXml(data);
            case MEDIATORS.SCRIPT:
                return getScriptXml(data).trim();
            case MEDIATORS.COMMAND:
                return getCommandXml(data);
            case MEDIATORS.SEQUENCE:
                return getSequenceXml(data);
            //Other Mediators
            case MEDIATORS.OAUTH:
                return getOauthXml(data);
            case MEDIATORS.BUILDER:
                return getBuilderXml(data);
            case MEDIATORS.PUBLISHEVENT:
                return getPublishEventXml(data);
            case MEDIATORS.ENTITLEMENT:
                return getEntitlementXml(data, dirtyFields, defaultValues);
            case MEDIATORS.RULE:
                return getRuleXml(data);
            case MEDIATORS.NTLM:
                return getNtlmXml(data);
            case MEDIATORS.REWRITE:
                return getRewriteXml(data);

            // Endpoint Forms
            case ENDPOINTS.HTTP:
                return getHTTPEndpointXml(data);

            // Data Service Forms
            case DATA_SERVICE.EDIT_QUERY:
                return getDssQueryXml(data);
            case DATA_SERVICE.EDIT_RESOURCE_PARAMS:
                return getDssResourceQueryParamsXml(data);
            case DATA_SERVICE.EDIT_RESOURCE:
                return getDssResourceXml(data);
            case DATA_SERVICE.EDIT_SELF_CLOSE_RESOURCE:
                return getDssResourceSelfClosingXml(data);

            default:
                return Mustache.render(getMustacheTemplate(name), data).trim();
        }
    }

    const xml = getTemplateRendered();
    const cleanedXml = Array.isArray(xml) ? xml.map(item => {
        return {
            ...item,
            text: item.text.replace(/^\s*[\r\n]/gm, '').trimStart().trimEnd()
        }
    }) : xml.replace(/^\s*[\r\n]/gm, '').trimStart().trimEnd();
    return cleanedXml;
}

export function getNewSubSequenceXml(name: string, st: STNode) {
    switch (name) {
        case MEDIATORS.CLONE:
            return getNewCloneTargetXml();
        case MEDIATORS.SWITCH:
            return getNewSwitchCaseXml(st as Switch);
    }
}

export async function getDataFromST(name: string, node: STNode, documentUri?: string, rpcClient?: RpcClient) {
    const template = getMustacheTemplate(name);
    const formData = reverseMustache(template, node);

    switch (name) {
        //Advanced Mediator
        case MEDIATORS.CACHE:
            return getCacheFormDataFromSTNode(formData, node as Cache);
        case MEDIATORS.CLONE:
            return getCloneFormDataFromSTNode(formData, node as Clone);
        case MEDIATORS.TRANSACTION:
            return getTransactionFormDataFromSTNode(formData, node as Transaction);
        case MEDIATORS.EVENT:
            return getEventFormDataFromSTNode(formData, node as Event);
        case MEDIATORS.DATASERVICECALL:
            return getDataServiceCallFormDataFromSTNode(formData, node as DataServiceCall)
        //Core
        case MEDIATORS.CALL:
            return await getCallFormDataFromSTNode(formData, node as Call, documentUri, rpcClient);
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
        case MEDIATORS.PROPERTYGROUP:
            return getPropertyGroupFormDataFromSTNode(formData, node as PropertyGroup);
        case MEDIATORS.STORE:
            return getStoreFormDataFromSTNode(formData, node as Store);
        case MEDIATORS.VALIDATE:
            return getValidateFormDataFromSTNode(formData, node as Validate);
        case MEDIATORS.SEND:
            return getSendFormDataFromSTNode(formData, node as Send, documentUri, rpcClient);
        //EIP Mediators
        case MEDIATORS.AGGREGATE:
            return getAggregateFormDataFromSTNode(formData, node as Aggregate);
        case MEDIATORS.ITERATE:
            return getIterateFormDataFromSTNode(formData, node as Iterate);
        case MEDIATORS.FOREACHMEDIATOR:
            return getForEachFormDataFromSTNode(formData, node as Foreach);
        //Filter Mediators
        case MEDIATORS.FILTER:
            return getFilterFormDataFromSTNode(formData, node as Filter);
        case MEDIATORS.SWITCH:
            return getSwitchFormDataFromSTNode(formData, node as Switch);
        case MEDIATORS.THROTTLE:
            return getThrottleFormDataFromSTNode(formData, node as Throttle);
        //Transformation Mediators
        case MEDIATORS.PAYLOAD:
            return getPayloadFormDataFromSTNode(formData, node as PayloadFactory);
        case MEDIATORS.CONDITIONALROUTER:
            return getConditionalRouterFormDataFromSTNode(formData, node as ConditionalRouter);
        case MEDIATORS.ENRICH:
            return getEnrichFormDataFromSTNode(formData, node as Enrich);
        case MEDIATORS.FASTXSLT:
            return getFastXSLTFormDataFromSTNode(formData, node as FastXSLT);
        case MEDIATORS.FAULT:
            return getFaultFormDataFromSTNode(formData, node as Makefault);
        case MEDIATORS.JSONTRANSFORM:
            return getJsonTransformFormDataFromSTNode(formData, node as Jsontransform);
        case MEDIATORS.SMOOKS:
            return getSmooksFormDataFromSTNode(formData, node as Smooks);
        case MEDIATORS.XQUERY:
            return getXqueryFormDataFromSTNode(formData, node as Xquery);
        case MEDIATORS.XSLT:
            return getXsltFormDataFromSTNode(formData, node as Xslt);
        //Extension Mediators
        case MEDIATORS.CLASS:
            return getClassFormDataFromSTNode(formData, node as Class);
        case MEDIATORS.COMMAND:
            return getCommandFormDataFromSTNode(formData, node as PojoCommand);
        case MEDIATORS.EJB:
            return getEjbFormDataFromSTNode(formData, node as Ejb);
        case MEDIATORS.BEAN:
            return getBeanFormDataFromSTNode(formData, node as Bean);
        case MEDIATORS.SCRIPT:
            return getScriptFormDataFromSTNode(formData, node as Script);
        case MEDIATORS.SEQUENCE:
            return getSequenceDataFromSTNode(formData, node as FilterSequence);
        //Other Mediators
        case MEDIATORS.BAM:
            return getBamFormDataFromSTNode(formData, node as Bam);
        case MEDIATORS.OAUTH:
            return getOauthFormDataFromSTNode(formData, node as OauthService);
        case MEDIATORS.BUILDER:
            return getBuilderFormDataFromSTNode(formData, node as Builder);
        case MEDIATORS.PUBLISHEVENT:
            return getPublishEventFormDataFromSTNode(formData, node as PublishEvent);
        case MEDIATORS.ENTITLEMENT:
            return getEntitlementFormDataFromSTNode(formData, node as EntitlementService);
        case MEDIATORS.RULE:
            return getRuleFormDataFromSTNode(formData, node as Rule);
        case MEDIATORS.NTLM:
            return getNtlmFormDataFromSTNode(formData, node as Ntlm);
        case MEDIATORS.REWRITE:
            return getRewriteFormDataFromSTNode(formData, node as Rewrite);
        case MEDIATORS.DBLOOKUP:
            return getDBLookupFormDataFromSTNode(formData, node as DbMediator);
        case MEDIATORS.DBREPORT:
            return getDBReportFormDataFromSTNode(formData, node as DbMediator);

        // Endpoint Forms
        case ENDPOINTS.HTTP:
            return getHTTPEndpointFormDataFromSTNode(formData, node as NamedEndpoint);

        // Data Service
        case DATA_SERVICE_NODES.INPUT:
            return getDSInputMappingsFromSTNode(formData, node as Query);
        case DATA_SERVICE_NODES.QUERY:
            return getDSQueryFromSTNode(formData, node as Query);
        case DATA_SERVICE_NODES.TRANSFORMATION:
            return getDSTransformationFromSTNode(formData, node as Query);
        case DATA_SERVICE_NODES.OUTPUT:
            return getDSOutputMappingsFromSTNode(formData, node as Query);

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
