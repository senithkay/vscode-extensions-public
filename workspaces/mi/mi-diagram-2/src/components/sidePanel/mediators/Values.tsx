/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react"
import { ENDPOINTS, MEDIATORS } from "../../../resources/constants"
import CallForm from "../Pages/mediators/core/call"
import CallTemplateForm from "../Pages/mediators/core/call-template"
import CalloutForm from "../Pages/mediators/core/callout"
import DropForm from "../Pages/mediators/core/drop"
import HeaderForm from "../Pages/mediators/core/header"
import LogForm from "../Pages/mediators/core/log"
import LoopbackForm from "../Pages/mediators/core/loopback"
import PropertyForm from "../Pages/mediators/core/property"
import PropertyGroupForm from "../Pages/mediators/core/propertyGroup"
import RespondForm from "../Pages/mediators/core/respond"
import SendForm from "../Pages/mediators/core/send"
import SequenceForm from "../Pages/mediators/core/sequence"
import StoreForm from "../Pages/mediators/core/store"
import ValidateForm from "../Pages/mediators/core/validate"
import FilterForm from "../Pages/mediators/filter/filter"
import DataMapperForm from "../Pages/mediators/transformation/datamapper"
import EnrichForm from "../Pages/mediators/transformation/enrich"
import FastXSLTForm from "../Pages/mediators/transformation/fastXSLT"
import FaultForm from "../Pages/mediators/transformation/fault"
import JSONTransformForm from "../Pages/mediators/transformation/jsonTransform"
import PayloadForm from "../Pages/mediators/transformation/payload"
import RewriteForm from "../Pages/mediators/transformation/rewrite"
import SmooksForm from "../Pages/mediators/transformation/smooks"
import XQueryForm from "../Pages/mediators/transformation/xquery"
import XSLTForm from "../Pages/mediators/transformation/xslt"
import AddressEndpointForm from "../Pages/endpoint/anonymous/address"
import DefaultEndpointForm from "../Pages/endpoint/anonymous/default"
import FailoverEndpointForm from "../Pages/endpoint/anonymous/failover"
import HTTPEndpointForm from "../Pages/endpoint/anonymous/http"
import LoadbalanceEndpointForm from "../Pages/endpoint/anonymous/loadbalance"
import NamedEndpointForm from "../Pages/endpoint/anonymous/namedEndpoint"
import RecipientListEndpointForm from "../Pages/endpoint/anonymous/recipientList"
import TemplateEndpointForm from "../Pages/endpoint/anonymous/template"
import WSDLEndpointForm from "../Pages/endpoint/anonymous/wsdl"
import AggregateForm from "../Pages/mediators/eip/aggregate"
import ForEachMediatorForm from "../Pages/mediators/eip/foreach"
import IterateForm from "../Pages/mediators/eip/iterate"

export interface GetMediatorsProps {
    nodePosition: any;
    documentUri: string;
    parentNode?: string;
    previousNode?: string;
}
export function getAllMediators(props: GetMediatorsProps) {

    const allMediators = {
        "core": [
            {
                title: "Call",
                operationName: MEDIATORS.CALL,
                form: <CallForm nodePosition={props.nodePosition} documentUri={props.documentUri}></CallForm>,
            },
            {
                title: "Call Template",
                operationName: MEDIATORS.CALLTEMPLATE,
                form: <CallTemplateForm nodePosition={props.nodePosition} documentUri={props.documentUri}></CallTemplateForm>,
            },
            {
                title: "Callout",
                operationName: MEDIATORS.CALLOUT,
                form: <CalloutForm nodePosition={props.nodePosition} documentUri={props.documentUri}></CalloutForm>,
            },
            {
                title: "Drop",
                operationName: MEDIATORS.DROP,
                form: <DropForm nodePosition={props.nodePosition} documentUri={props.documentUri}></DropForm>,
            },
            {
                title: "Header",
                operationName: MEDIATORS.HEADER,
                form: <HeaderForm nodePosition={props.nodePosition} documentUri={props.documentUri}></HeaderForm>,
            },
            {
                title: "Log",
                operationName: MEDIATORS.LOG,
                form: <LogForm nodePosition={props.nodePosition} documentUri={props.documentUri}></LogForm>,
            },
            {
                title: "Loopback",
                operationName: MEDIATORS.LOOPBACK,
                form: <LoopbackForm nodePosition={props.nodePosition} documentUri={props.documentUri}></LoopbackForm>,
            },
            {
                title: "Property",
                operationName: MEDIATORS.PROPERTY,
                form: <PropertyForm nodePosition={props.nodePosition} documentUri={props.documentUri}></PropertyForm>,
            },
            {
                title: "Property Group",
                operationName: MEDIATORS.PROPERTYGROUP,
                form: <PropertyGroupForm nodePosition={props.nodePosition} documentUri={props.documentUri}></PropertyGroupForm>,
            },
            {
                title: "Respond",
                operationName: MEDIATORS.RESPOND,
                form: <RespondForm nodePosition={props.nodePosition} documentUri={props.documentUri}></RespondForm>,
            },
            {
                title: "Send",
                operationName: MEDIATORS.SEND,
                form: <SendForm nodePosition={props.nodePosition} documentUri={props.documentUri}></SendForm>,
            },
            {
                title: "Sequence",
                operationName: MEDIATORS.SEQUENCE,
                form: <SequenceForm nodePosition={props.nodePosition} documentUri={props.documentUri}></SequenceForm>,
            },
            {
                title: "Store",
                operationName: MEDIATORS.STORE,
                form: <StoreForm nodePosition={props.nodePosition} documentUri={props.documentUri}></StoreForm>,
            },
            {
                title: "Validate",
                operationName: MEDIATORS.VALIDATE,
                form: <ValidateForm nodePosition={props.nodePosition} documentUri={props.documentUri}></ValidateForm>,
            }
        ],
        "transformation": [
            {
                title: "Data Mapper",
                operationName: MEDIATORS.DATAMAPPER,
                form: <DataMapperForm nodePosition={props.nodePosition} documentUri={props.documentUri}></DataMapperForm>,
            },
            {
                title: "Enrich",
                operationName: MEDIATORS.ENRICH,
                form: <EnrichForm nodePosition={props.nodePosition} documentUri={props.documentUri}></EnrichForm>,
            },
            {
                title: "Fast XSLT",
                operationName: MEDIATORS.FASTXSLT,
                form: <FastXSLTForm nodePosition={props.nodePosition} documentUri={props.documentUri}></FastXSLTForm>,
            },
            {
                title: "Fault",
                operationName: MEDIATORS.FAULT,
                form: <FaultForm nodePosition={props.nodePosition} documentUri={props.documentUri}></FaultForm>,
            },
            {
                title: "Json Transform",
                operationName: MEDIATORS.JSONTRANSFORM,
                form: <JSONTransformForm nodePosition={props.nodePosition} documentUri={props.documentUri}></JSONTransformForm>,
            },
            {
                title: "Payload",
                operationName: MEDIATORS.PAYLOAD,
                form: <PayloadForm nodePosition={props.nodePosition} documentUri={props.documentUri}></PayloadForm>,
            },
            {
                title: "Rewrite",
                operationName: MEDIATORS.REWRITE,
                form: <RewriteForm nodePosition={props.nodePosition} documentUri={props.documentUri}></RewriteForm>,
            },
            {
                title: "Smooks",
                operationName: MEDIATORS.SMOOKS,
                form: <SmooksForm nodePosition={props.nodePosition} documentUri={props.documentUri}></SmooksForm>,
            },
            {
                title: "xquery",
                operationName: MEDIATORS.XQUERY,
                form: <XQueryForm nodePosition={props.nodePosition} documentUri={props.documentUri}></XQueryForm>,
            },
            {
                title: "XSLT",
                operationName: MEDIATORS.XSLT,
                form: <XSLTForm nodePosition={props.nodePosition} documentUri={props.documentUri}></XSLTForm>,
            }
        ],
        "filter": [
            {
                title: "Filter",
                operationName: MEDIATORS.FILTER,
                form: <FilterForm nodePosition={props.nodePosition} documentUri={props.documentUri}></FilterForm>,
            }
        ],
        "eip": [
            {
                title: "Aggregate",
                operationName: MEDIATORS.AGGREGATE,
                form: <AggregateForm nodePosition={props.nodePosition} documentUri={props.documentUri}></AggregateForm>,
            },
            {
                title: "Foreach",
                operationName: MEDIATORS.FOREACH,
                form: <ForEachMediatorForm nodePosition={props.nodePosition} documentUri={props.documentUri}></ForEachMediatorForm>,
            },
            {
                title: "Iterate",
                operationName: MEDIATORS.ITERATE,
                form: <IterateForm nodePosition={props.nodePosition} documentUri={props.documentUri}></IterateForm>,
            }
        ]
    };

    const endpoints = {
        "endpoints": [
            {
                title: "Address Endpoint",
                operationName: ENDPOINTS.ADDRESS,
                form: <AddressEndpointForm nodePosition={props.nodePosition} documentUri={props.documentUri}></AddressEndpointForm>,
            },
            {
                title: "Default Endpoint",
                operationName: ENDPOINTS.DEFAULT,
                form: <DefaultEndpointForm nodePosition={props.nodePosition} documentUri={props.documentUri}></DefaultEndpointForm>,
            },
            {
                title: "Failover Endpoint",
                operationName: ENDPOINTS.FAILOVER,
                form: <FailoverEndpointForm nodePosition={props.nodePosition} documentUri={props.documentUri}></FailoverEndpointForm>,
            },
            {
                title: "HTTP Endpoint",
                operationName: ENDPOINTS.HTTP,
                form: <HTTPEndpointForm nodePosition={props.nodePosition} documentUri={props.documentUri}></HTTPEndpointForm>,
            },
            {
                title: "Loadbalance Endpoint",
                operationName: ENDPOINTS.LOADBALANCE,
                form: <LoadbalanceEndpointForm nodePosition={props.nodePosition} documentUri={props.documentUri}></LoadbalanceEndpointForm>,
            },
            {
                title: "Named Endpoint",
                operationName: ENDPOINTS.NAMED,
                form: <NamedEndpointForm nodePosition={props.nodePosition} documentUri={props.documentUri}></NamedEndpointForm>,
            },
            {
                title: "Recipient List Endpoint",
                operationName: ENDPOINTS.RECIPIENTLIST,
                form: <RecipientListEndpointForm nodePosition={props.nodePosition} documentUri={props.documentUri}></RecipientListEndpointForm>,
            },
            {
                title: "Template Endpoint",
                operationName: ENDPOINTS.TEMPLATE,
                form: <TemplateEndpointForm nodePosition={props.nodePosition} documentUri={props.documentUri}></TemplateEndpointForm>,
            },
            {
                title: "WSDL Endpoint",
                operationName: ENDPOINTS.WSDL,
                form: <WSDLEndpointForm nodePosition={props.nodePosition} documentUri={props.documentUri}></WSDLEndpointForm>,
            }
        ]
    }

    if (props.parentNode) {
        switch (props.parentNode.toLowerCase()) {
            case MEDIATORS.CALL.toLowerCase():
            case MEDIATORS.SEND.toLowerCase():
                return endpoints;
        }
    }

    if (props.previousNode) {
        switch (props.previousNode.toLowerCase()) {
            case MEDIATORS.RESPOND.toLowerCase():
            case MEDIATORS.LOOPBACK.toLowerCase():
            case MEDIATORS.DROP.toLowerCase():
            case MEDIATORS.RULE.toLowerCase():
                return {};
            case MEDIATORS.FILTER.toLowerCase():
            case MEDIATORS.VALIDATE.toLowerCase():
            case MEDIATORS.SWITCH.toLowerCase():
            case MEDIATORS.CACHE.toLowerCase():
            case MEDIATORS.THROTTLE.toLowerCase():
            case MEDIATORS.AGGREGATE.toLowerCase():
            case MEDIATORS.CLONE.toLowerCase():
            case MEDIATORS.ENTITLEMENT.toLowerCase():
                // return {...allMediators, "sequences", "connectors"};
                return { ...allMediators };
            case MEDIATORS.ITERATE.toLowerCase():
            case MEDIATORS.FOREACH.toLowerCase(): {
                allMediators["core"] = allMediators["core"].filter((mediator: any) => !["Send", "Respond", "Loopback", "Drop"].includes(mediator.title));
                // return {...allMediators, "sequences", "connectors"};
                return { ...allMediators };
            }
        }
    }
    return { ...allMediators, ...endpoints };
}
