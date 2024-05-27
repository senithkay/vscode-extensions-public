/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { ReactNode } from "react";
import { ENDPOINTS, MEDIATORS } from "../../constants";
import { Icon } from "@wso2-enterprise/ui-toolkit";

export function getSVGIcon(mediator: string, returnPath: boolean = false) {
    let icon = null;
    switch (mediator.toLowerCase()) {
        // Mediators
        case MEDIATORS.AGGREGATE.toLowerCase():
            icon = require("./AggregateMediator.svg");
            break;
        case MEDIATORS.BUILDER.toLowerCase():
            icon = require("./BuilderMediator.png");
            break;
        case MEDIATORS.CACHE.toLowerCase():
            icon = require("./CacheMediator.svg");
            break;
        case MEDIATORS.CALL.toLowerCase():
            icon = require("./CallMediator.svg");
            break;
        case MEDIATORS.CALLOUT.toLowerCase():
            icon = require("./CalloutMediator.svg");
            break;
        case MEDIATORS.CALLTEMPLATE.toLowerCase():
            icon = require("./CallMediator.svg");
            break;
        case MEDIATORS.CLONE.toLowerCase():
            icon = require("./CloneMediator.svg");
            break;
        case MEDIATORS.DATAMAPPER.toLowerCase():
            icon = require("./DataMapperMediator.svg");
            break;
        case MEDIATORS.DATASERVICECALL.toLowerCase():
            icon = require("./DataServiceCallMediator.png");
            break;
        case MEDIATORS.DBLOOKUP.toLowerCase():
            icon = require("./DBLookupMediator.png");
            break;
        case MEDIATORS.DBREPORT.toLowerCase():
            icon = require("./DBReportMediator.png");
            break;
        // case MEDIATORS.DATASERVICE.toLowerCase():
        //     icon = require("./DataServiceMediator.svg");
        //     break;
        case MEDIATORS.DROP.toLowerCase():
            icon = require("./DropMediator.svg");
            break;
        case MEDIATORS.ENRICH.toLowerCase():
            icon = require("./EnrichMediator.svg");
            break;
        case MEDIATORS.ENTITLEMENT.toLowerCase():
            icon = require("./EntitlementMediator.svg");
            break;
        case MEDIATORS.FASTXSLT.toLowerCase():
            icon = require("./FastXSLTMediator.svg");
            break;
        case MEDIATORS.FAULT.toLowerCase():
            icon = require("./FaultMediator.svg");
            break;
        case MEDIATORS.FILTER.toLowerCase():
            icon = require("./FilterMediator.svg");
            break;
        case MEDIATORS.FOREACHMEDIATOR.toLowerCase():
            icon = require("./ForEachMediator.svg");
            break;
        case MEDIATORS.HEADER.toLowerCase():
            icon = require("./HeaderMediator.svg");
            break;
        case MEDIATORS.ITERATE.toLowerCase():
            icon = require("./IterateMediator.svg");
            break;
        case MEDIATORS.JSONTRANSFORM.toLowerCase():
            icon = require("./JSONTransformMediator.png");
            break;
        case MEDIATORS.LOG.toLowerCase():
            icon = require("./LogMediator.svg");
            break;
        case MEDIATORS.LOOPBACK.toLowerCase():
            icon = require("./LoopBackMediator.svg");
            break;
        case MEDIATORS.NTLM.toLowerCase():
            icon = require("./NTLMMediator.png");
            break;
        case MEDIATORS.OAUTH.toLowerCase():
            icon = require("./OAuthMediator.png");
            break;
        case MEDIATORS.PAYLOAD.toLowerCase():
            icon = require("./PayloadFactoryMediator.svg");
            break;
        case MEDIATORS.PROPERTY.toLowerCase():
            icon = require("./PropertyMediator.svg");
            break;
        case MEDIATORS.PROPERTYGROUP.toLowerCase():
            icon = require("./PropertyGroupMediator.svg");
            break;
        case MEDIATORS.PUBLISHEVENT.toLowerCase():
            icon = require("./PublishEventMediator.png");
            break;
        case MEDIATORS.RESPOND.toLowerCase():
            icon = require("./RespondMediator.svg");
            break;
        case MEDIATORS.REWRITE.toLowerCase():
            icon = require("./URLRewriteMediator.svg");
            break;
        case MEDIATORS.RULE.toLowerCase():
            icon = require("./RuleMediator.svg");
            break;
        case MEDIATORS.SEND.toLowerCase():
            icon = require("./SendMediator.svg");
            break;
        case MEDIATORS.SEQUENCE.toLowerCase():
            icon = require("./Sequence.svg");
            break;
        case MEDIATORS.SMOOKS.toLowerCase():
            icon = require("./SmooksMediator.svg");
            break;
        case MEDIATORS.STORE.toLowerCase():
            icon = require("./StoreMediator.svg");
            break;
        case MEDIATORS.SWITCH.toLowerCase():
            icon = require("./SwitchMediator.svg");
            break;
        case MEDIATORS.THROTTLE.toLowerCase():
            icon = require("./ThrottleMediator.svg");
            break;
        case MEDIATORS.VALIDATE.toLowerCase():
            icon = require("./ValidateMediator.svg");
            break;
        case MEDIATORS.XQUERY.toLowerCase():
            icon = require("./XQueryMediator.svg");
            break;
        case MEDIATORS.XSLT.toLowerCase():
            icon = require("./XSLTMediator.svg");
            break;
        case MEDIATORS.CONDITIONALROUTER.toLowerCase():
            icon = require("./ConditionalRouterMediator.svg");
            break;
        case MEDIATORS.ENQUEUE.toLowerCase():
            icon = require("./EnqueueMediator.svg");
            break;
        case MEDIATORS.EVENT.toLowerCase():
            icon = require("./EventMediator.svg");
            break;
        case MEDIATORS.TRANSACTION.toLowerCase():
            icon = require("./TransactionMediator.svg");
            break;
        case MEDIATORS.BEAN.toLowerCase():
            icon = require("./BeanMediator.svg");
            break;
        case MEDIATORS.CLASS.toLowerCase():
            icon = require("./ClassMediator.svg");
            break;
        case MEDIATORS.COMMAND.toLowerCase():
            icon = require("./CommandMediator.svg");
            break;
        case MEDIATORS.EJB.toLowerCase():
            icon = require("./EJBMediator.svg");
            break;
        case MEDIATORS.SCRIPT.toLowerCase():
            icon = require("./ScriptMediator.svg");
            break;
        case MEDIATORS.SPRING.toLowerCase():
            icon = require("./SpringMediator.svg");
            break;
        case MEDIATORS.BAM.toLowerCase():
            icon = require("./BAMMediator.svg");
            break;

        // Endpoints
        case ENDPOINTS.ADDRESS.toLowerCase():
            icon = require("./AddressEndPoint.svg");
            break;
        case ENDPOINTS.DEFAULT.toLowerCase():
            icon = require("./DefaultEndPoint.svg");
            break;
        // case ENDPOINTS.FAILOVER.toLowerCase():
        //     icon = require("./FailoverEndpoint.svg");
        //     break;
        case ENDPOINTS.HTTP.toLowerCase():
            icon = require("./HTTPEndpoint.svg");
            break;
        case ENDPOINTS.LOADBALANCE.toLowerCase():
            icon = require("./LoadBalanceEndPoint.svg");
            break;
        case ENDPOINTS.NAMED.toLowerCase():
            icon = require("./NamedEndpoint.svg");
            break;
        // case ENDPOINTS.RECIPIENTLIST.toLowerCase():
        //     icon = require("./RecipientlistEndpoint.svg");
        //     break;
        // case ENDPOINTS.TEMPLATE.toLowerCase():
        //     icon = require("./TemplateEndpoint.svg");
        //     break;
        // case ENDPOINTS.WSDL.toLowerCase():
        //     icon = require("./WSDL.svg");
        //     break;
        default:
            icon = require("./Default.svg");
    }
    return returnPath ? icon : <img src={icon} alt={mediator} />;
}

export function getIconsFromFont(mediator: string, color: string) {
    let icon: ReactNode = null;
    switch (mediator.toLowerCase()) {
        // Mediators
        case MEDIATORS.AGGREGATE.toLowerCase():
            icon = ( <Icon name="Aggregate" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.BUILDER.toLowerCase():
            icon = ( <Icon name="Builder" sx={{height: 32, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.CACHE.toLowerCase():
            icon = ( <Icon name="Cache" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.CALL.toLowerCase():
            icon = ( <Icon name="Call" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.CALLOUT.toLowerCase():
            icon = ( <Icon name="Callout" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.CALLTEMPLATE.toLowerCase():
            icon = ( <Icon name="Call" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.CLONE.toLowerCase():
            icon = ( <Icon name="Clone" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.DATAMAPPER.toLowerCase():
            icon = ( <Icon name="dataMapper" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.DATASERVICECALL.toLowerCase():
            icon = ( <Icon name="DataServiceCall" sx={{height: 32, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.DBLOOKUP.toLowerCase():
            icon = ( <Icon name="DBLookup" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.DBREPORT.toLowerCase():
            icon = ( <Icon name="DBReport" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.DROP.toLowerCase():
            icon = ( <Icon name="Drop" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.ENRICH.toLowerCase():
            icon = ( <Icon name="Enrich" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.ENTITLEMENT.toLowerCase():
            icon = ( <Icon name="Entitlement" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.FASTXSLT.toLowerCase():
            icon = ( <Icon name="FastXSLT" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.FAULT.toLowerCase():
            icon = ( <Icon name="Fault" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.FILTER.toLowerCase():
            icon = ( <Icon name="Filter" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.FOREACHMEDIATOR.toLowerCase():
            icon = ( <Icon name="ForEach" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.HEADER.toLowerCase():
            icon = ( <Icon name="header" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.ITERATE.toLowerCase():
            icon = ( <Icon name="Iterate" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.JSONTRANSFORM.toLowerCase():
            icon = ( <Icon name="JSONTransform" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.LOG.toLowerCase():
            icon = ( <Icon name="Log" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.LOOPBACK.toLowerCase():
            icon = ( <Icon name="LoopBack" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.NTLM.toLowerCase():
            icon = ( <Icon name="NTLM" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.OAUTH.toLowerCase():
            icon = ( <Icon name="OAuth" sx={{height: 32, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.PAYLOAD.toLowerCase():
            icon = ( <Icon name="PayloadFactory" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.PROPERTY.toLowerCase():
            icon = ( <Icon name="Property" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.PROPERTYGROUP.toLowerCase():
            icon = ( <Icon name="PropertyGroup" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.PUBLISHEVENT.toLowerCase():
            icon = ( <Icon name="PublishEvent" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.RESPOND.toLowerCase():
            icon = ( <Icon name="Respond" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.REWRITE.toLowerCase():
            icon = ( <Icon name="URLRewrite" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.RULE.toLowerCase():
            icon = ( <Icon name="Rule" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.SEND.toLowerCase():
            icon = ( <Icon name="Send" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.SEQUENCE.toLowerCase():
            icon = ( <Icon name="Sequence" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.SMOOKS.toLowerCase():
            icon = ( <Icon name="Smooks" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.STORE.toLowerCase():
            icon = ( <Icon name="Store" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.SWITCH.toLowerCase():
            icon = ( <Icon name="Switch" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.THROTTLE.toLowerCase():
            icon = ( <Icon name="Throttle" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.VALIDATE.toLowerCase():
            icon = ( <Icon name="Validate" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.XQUERY.toLowerCase():
            icon = ( <Icon name="XQuery" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.XSLT.toLowerCase():
            icon = ( <Icon name="XSLT" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.CONDITIONALROUTER.toLowerCase():
            icon = ( <Icon name="ConditionalRouter" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.ENQUEUE.toLowerCase():
            icon = ( <Icon name="Enqueue" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.EVENT.toLowerCase():
            icon = ( <Icon name="Event" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.TRANSACTION.toLowerCase():
            icon = ( <Icon name="Transaction" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.BEAN.toLowerCase():
            icon = ( <Icon name="Bean" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.CLASS.toLowerCase():
            icon = ( <Icon name="class-icon" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.COMMAND.toLowerCase():
            icon = ( <Icon name="Command" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.EJB.toLowerCase():
            icon = ( <Icon name="EJB" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.SCRIPT.toLowerCase():
            icon = ( <Icon name="Script" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.SPRING.toLowerCase():
            icon = ( <Icon name="Spring" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case MEDIATORS.BAM.toLowerCase():
            icon = ( <Icon name="BAM" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;

        // Endpoints
        case ENDPOINTS.ADDRESS.toLowerCase():
            icon = ( <Icon name="AddressEndPoint" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case ENDPOINTS.DEFAULT.toLowerCase():
            icon = ( <Icon name="DefaultEndPoint" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        // case ENDPOINTS.FAILOVER.toLowerCase():
        //     icon = require("./FailoverEndpoint.svg");
        //     break;
        case ENDPOINTS.HTTP.toLowerCase():
            icon = ( <Icon name="HTTPEndpoint" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case ENDPOINTS.LOADBALANCE.toLowerCase():
            icon = ( <Icon name="LoadBalanceEndPoint" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        case ENDPOINTS.NAMED.toLowerCase():
            icon = ( <Icon name="NamedEndpoint" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
            break;
        default:
            icon = ( <Icon name="Default" sx={{height: 25, width: 25, fontSize: 25, color: color}} /> );
    }
    return icon;
}

export function getIconColor(title: string) {
    let color;
    switch (title.toLowerCase()) {
        case "core":
            color = "#3e97d3";
            break;
        case "transformation":
            color = "#955ba5";
            break;
        case "flow control":
            color = "#26b99a";
            break;
        case "extension":
            color = "#ff69d0";
            break;
        case "qos":
            color = "#ffc369";
            break;
        case "data":
            color = "#8ddefb";
            break;
        case "other":
            color = "#e0e0d8";
            break;
        default:
            color = "#FFB02E";
    }
    return color;
}