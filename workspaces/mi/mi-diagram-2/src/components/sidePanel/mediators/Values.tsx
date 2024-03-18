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
import DefaultEndpointForm from "../Pages/endpoint/anonymous/defaultEndpoint"
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
import BeanForm from "../Pages/mediators/extension/bean"
import ClassForm from "../Pages/mediators/extension/classExtension"
import CommandForm from "../Pages/mediators/extension/command"
import EJBForm from "../Pages/mediators/extension/ejb"
import ScriptForm from "../Pages/mediators/extension/script"
import SpringForm from "../Pages/mediators/extension/spring"
import CloneForm from "../Pages/mediators/advanced/clone"
import DataServiceForm from "../Pages/mediators/advanced/dataServiceCall"
import EnqueueForm from "../Pages/mediators/advanced/enqueue"
import EventForm from "../Pages/mediators/advanced/event"
import TransactionForm from "../Pages/mediators/advanced/transaction"
import CacheForm from "../Pages/mediators/advanced/cache"
import SwitchForm from "../Pages/mediators/filter/switchMediator"
import BamForm from "../Pages/mediators/other/bam"
import ConditionalRouterForm from "../Pages/mediators/filter/cond_router"

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
                title: "CallTemplate",
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
                title: "PropertyGroup",
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
        "filter": [
            {
                title: "Conditional Router",
                operationName: MEDIATORS.CONDITIONALROUTER,
                form: <ConditionalRouterForm nodePosition={props.nodePosition} documentUri={props.documentUri}></ConditionalRouterForm>,
            },
            {
                title: "Filter",
                operationName: MEDIATORS.FILTER,
                form: <FilterForm nodePosition={props.nodePosition} documentUri={props.documentUri}></FilterForm>,
            },
            {
                title: "Switch",
                operationName: MEDIATORS.SWITCH,
                form: <SwitchForm nodePosition={props.nodePosition} documentUri={props.documentUri}></SwitchForm>,
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
        ],
        "advanced": [
            {
                title: "Cache",
                operationName: MEDIATORS.CACHE,
                form: <CacheForm nodePosition={props.nodePosition} documentUri={props.documentUri}></CacheForm>,
            },
            {
                title: "Clone",
                operationName: MEDIATORS.CLONE,
                form: <CloneForm nodePosition={props.nodePosition} documentUri={props.documentUri}></CloneForm>,
            },
            {
                title: "Dataservice Call",
                operationName: MEDIATORS.DATASERVICECALL,
                form: <DataServiceForm nodePosition={props.nodePosition} documentUri={props.documentUri}></DataServiceForm>,
            },
            {
                title: "Enqueue",
                operationName: MEDIATORS.ENQUEUE,
                form: <EnqueueForm nodePosition={props.nodePosition} documentUri={props.documentUri}></EnqueueForm>,
            },
            {
                title: "Event",
                operationName: MEDIATORS.EVENT,
                form: <EventForm nodePosition={props.nodePosition} documentUri={props.documentUri}></EventForm>,
            },
            {
                title: "Transaction",
                operationName: MEDIATORS.TRANSACTION,
                form: <TransactionForm nodePosition={props.nodePosition} documentUri={props.documentUri}></TransactionForm>,
            }
        ],
        "extension": [
            {
                title: "Bean",
                operationName: MEDIATORS.BEAN,
                form: <BeanForm nodePosition={props.nodePosition} documentUri={props.documentUri}></BeanForm>,
            },
            {
                title: "Class",
                operationName: MEDIATORS.CLASS,
                form: <ClassForm nodePosition={props.nodePosition} documentUri={props.documentUri}></ClassForm>,
            },
            {
                title: "Command",
                operationName: MEDIATORS.COMMAND,
                form: <CommandForm nodePosition={props.nodePosition} documentUri={props.documentUri}></CommandForm>,
            },
            {
                title: "EJB",
                operationName: MEDIATORS.EJB,
                form: <EJBForm nodePosition={props.nodePosition} documentUri={props.documentUri}></EJBForm>,
            },
            {
                title: "Script",
                operationName: MEDIATORS.SCRIPT,
                form: <ScriptForm nodePosition={props.nodePosition} documentUri={props.documentUri}></ScriptForm>,
            },
            {
                title: "Spring",
                operationName: MEDIATORS.SPRING,
                form: <SpringForm nodePosition={props.nodePosition} documentUri={props.documentUri}></SpringForm>,
            }
        ],
        "other": [
            {
                title: "BAM",
                operationName: MEDIATORS.BAM,
                form: <BamForm nodePosition={props.nodePosition} documentUri={props.documentUri}></BamForm>,
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
    return { ...allMediators };
}
