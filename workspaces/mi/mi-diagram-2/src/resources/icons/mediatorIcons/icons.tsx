/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { ENDPOINTS, MEDIATORS } from "../../constants";

export function getSVGIcon(mediator: string) {
    let icon = null;
    switch (mediator.toLowerCase()) {
        // Mediators
        case MEDIATORS.AGGREGATE.toLowerCase():
            icon = require("./AggregateMediator.svg");
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
        case MEDIATORS.FOREACH.toLowerCase():
            icon = require("./ForEachMediator.svg");
            break;
        case MEDIATORS.HEADER.toLowerCase():
            icon = require("./HeaderMediator.svg");
            break;
        case MEDIATORS.ITERATE.toLowerCase():
            icon = require("./IterateMediator.svg");
            break;
        // case MEDIATORS.JSONTRANSFORM.toLowerCase():
        //     icon = require("./JSONTransformMediator.svg");
        //     break;
        case MEDIATORS.LOG.toLowerCase():
            icon = require("./LogMediator.svg");
            break;
        case MEDIATORS.LOOPBACK.toLowerCase():
            icon = require("./LoopBackMediator.svg");
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
        case MEDIATORS.RESPOND.toLowerCase():
            icon = require("./RespondMediator.svg");
            break;
        // case MEDIATORS.REWRITE.toLowerCase():
        //     icon = require("./RewriteMediator.svg");
        //     break;
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
    return <img src={icon} alt={mediator} />;
}
