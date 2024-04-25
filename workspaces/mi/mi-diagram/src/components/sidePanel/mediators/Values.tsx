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
import AddressEndpointForm from "../Pages/endpoint/anonymous/address";
import DefaultEndpointForm from "../Pages/endpoint/anonymous/defaultEndpoint";
import FailoverEndpointForm from "../Pages/endpoint/anonymous/failover";
import HTTPEndpointForm from "../Pages/endpoint/anonymous/http";
import LoadbalanceEndpointForm from "../Pages/endpoint/anonymous/loadbalance";
import NamedEndpointForm from "../Pages/endpoint/anonymous/namedEndpoint";
import RecipientListEndpointForm from "../Pages/endpoint/anonymous/recipientList";
import TemplateEndpointForm from "../Pages/endpoint/anonymous/template";
import WSDLEndpointForm from "../Pages/endpoint/anonymous/wsdl";
import CallForm from "../Pages/mediators/core/call";
import CallTemplateForm from "../Pages/mediators/core/call-template";
import DropForm from "../Pages/mediators/core/drop";
import LogForm from "../Pages/mediators/core/log";
import PropertyForm from "../Pages/mediators/core/property";
import PropertyGroupForm from "../Pages/mediators/core/propertyGroup";
import RespondForm from "../Pages/mediators/core/respond";
import ClassForm from "../Pages/mediators/extension/classExtension";
import ScriptForm from "../Pages/mediators/extension/script";
import AggregateForm from "../Pages/mediators/flow-control/aggregate";
import CloneForm from "../Pages/mediators/flow-control/clone";
import FilterForm from "../Pages/mediators/flow-control/filter";
import IterateForm from "../Pages/mediators/flow-control/iterate";
import StoreForm from "../Pages/mediators/flow-control/store";
import SwitchForm from "../Pages/mediators/flow-control/switch";
import ValidateForm from "../Pages/mediators/flow-control/validate";
import BamForm from "../Pages/mediators/other/bam";
import BeanForm from "../Pages/mediators/other/bean";
import CommandForm from "../Pages/mediators/other/builder";
import CalloutForm from "../Pages/mediators/other/callout";
import ConditionalRouterForm from "../Pages/mediators/other/cond_router";
import EJBForm from "../Pages/mediators/other/ejb";
import EnqueueForm from "../Pages/mediators/other/enqueue";
import EventForm from "../Pages/mediators/other/event";
import FastXSLTForm from "../Pages/mediators/other/fastXSLT";
import LoopbackForm from "../Pages/mediators/other/loopback";
import RuleForm from "../Pages/mediators/other/rule";
import SendForm from "../Pages/mediators/other/send";
import SmooksForm from "../Pages/mediators/other/smooks";
import SpringForm from "../Pages/mediators/other/spring";
import TransactionForm from "../Pages/mediators/other/transaction";
import XQueryForm from "../Pages/mediators/other/xquery";
import CacheForm from "../Pages/mediators/qos/cache";
import EntitlementForm from "../Pages/mediators/qos/entitlement";
import NTLMForm from "../Pages/mediators/qos/ntlm";
import OAuthForm from "../Pages/mediators/qos/oauth";
import ThrottleForm from "../Pages/mediators/qos/throttle";
import DataMapperForm from "../Pages/mediators/transformation/datamapper";
import EnrichForm from "../Pages/mediators/transformation/enrich";
import FaultForm from "../Pages/mediators/transformation/fault";
import HeaderForm from "../Pages/mediators/transformation/header";
import JSONTransformForm from "../Pages/mediators/transformation/jsonTransform";
import PayloadForm from "../Pages/mediators/transformation/payload";
import XSLTForm from "../Pages/mediators/transformation/xslt";
import ForEachMediatorForm from "../Pages/mediators/flow-control/foreach";
import PublishEventForm from "../Pages/mediators/other/publishEvent";
import RewriteForm from "../Pages/mediators/oldForms/rewrite";
import DataServiceForm from "../Pages/mediators/oldForms/dataServiceCall";
import BuilderForm from "../Pages/mediators/other/builder";
import SequenceForm from "../Pages/mediators/core/sequence";

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
                title: "Log",
                operationName: MEDIATORS.LOG,
                form: <LogForm nodePosition={props.nodePosition} documentUri={props.documentUri}></LogForm>,
            },
            {
                title: "Respond",
                operationName: MEDIATORS.RESPOND,
                form: <RespondForm nodePosition={props.nodePosition} documentUri={props.documentUri}></RespondForm>,
            },
            {
                title: "Property",
                operationName: MEDIATORS.PROPERTY,
                form: <PropertyForm nodePosition={props.nodePosition} documentUri={props.documentUri}></PropertyForm>,
            },
            {
                title: "Drop",
                operationName: MEDIATORS.DROP,
                form: <DropForm nodePosition={props.nodePosition} documentUri={props.documentUri}></DropForm>,
            },
            {
                title: "CallTemplate",
                operationName: MEDIATORS.CALLTEMPLATE,
                form: <CallTemplateForm nodePosition={props.nodePosition} documentUri={props.documentUri}></CallTemplateForm>,
            },
            {
                title: "Sequence",
                operationName: MEDIATORS.SEQUENCE,
                form: <SequenceForm nodePosition={props.nodePosition} documentUri={props.documentUri}></SequenceForm>,
            },
            {
                title: "PropertyGroup",
                operationName: MEDIATORS.PROPERTYGROUP,
                form: <PropertyGroupForm nodePosition={props.nodePosition} documentUri={props.documentUri}></PropertyGroupForm>,
            }
        ],
        "transformation": [
            {
                title: "Payload",
                operationName: MEDIATORS.PAYLOAD,
                form: <PayloadForm nodePosition={props.nodePosition} documentUri={props.documentUri}></PayloadForm>,
            },
            {
                title: "Data Mapper",
                operationName: MEDIATORS.DATAMAPPER,
                form: <DataMapperForm nodePosition={props.nodePosition} documentUri={props.documentUri}></DataMapperForm>,
            },
            {
                title: "XSLT",
                operationName: MEDIATORS.XSLT,
                form: <XSLTForm nodePosition={props.nodePosition} documentUri={props.documentUri}></XSLTForm>,
            },
            {
                title: "Enrich",
                operationName: MEDIATORS.ENRICH,
                form: <EnrichForm nodePosition={props.nodePosition} documentUri={props.documentUri}></EnrichForm>,
            },
            {
                title: "Header",
                operationName: MEDIATORS.HEADER,
                form: <HeaderForm nodePosition={props.nodePosition} documentUri={props.documentUri}></HeaderForm>,
            },
            {
                title: "Json Transform",
                operationName: MEDIATORS.JSONTRANSFORM,
                form: <JSONTransformForm nodePosition={props.nodePosition} documentUri={props.documentUri}></JSONTransformForm>,
            },
            {
                title: "Fault",
                operationName: MEDIATORS.FAULT,
                form: <FaultForm nodePosition={props.nodePosition} documentUri={props.documentUri}></FaultForm>,
            }
        ],
        "flow control": [
            {
                title: "Filter",
                operationName: MEDIATORS.FILTER,
                form: <FilterForm nodePosition={props.nodePosition} documentUri={props.documentUri}></FilterForm>,
            },
            {
                title: "Switch",
                operationName: MEDIATORS.SWITCH,
                form: <SwitchForm nodePosition={props.nodePosition} documentUri={props.documentUri}></SwitchForm>,
            },
            {
                title: "Clone",
                operationName: MEDIATORS.CLONE,
                form: <CloneForm nodePosition={props.nodePosition} documentUri={props.documentUri}></CloneForm>,
            },
            {
                title: "Iterate",
                operationName: MEDIATORS.ITERATE,
                form: <IterateForm nodePosition={props.nodePosition} documentUri={props.documentUri}></IterateForm>,
            },
            {
                title: "Aggregate",
                operationName: MEDIATORS.AGGREGATE,
                form: <AggregateForm nodePosition={props.nodePosition} documentUri={props.documentUri}></AggregateForm>,
            },
            {
                title: "Foreach",
                operationName: MEDIATORS.FOREACHMEDIATOR,
                form: <ForEachMediatorForm nodePosition={props.nodePosition} documentUri={props.documentUri}></ForEachMediatorForm>,
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
        "extension": [
            {
                title: "Class",
                operationName: MEDIATORS.CLASS,
                form: <ClassForm nodePosition={props.nodePosition} documentUri={props.documentUri}></ClassForm>,
            },
            {
                title: "Script",
                operationName: MEDIATORS.SCRIPT,
                form: <ScriptForm nodePosition={props.nodePosition} documentUri={props.documentUri}></ScriptForm>,
            }
        ],
        "QOS": [
            {
                title: "Cache",
                operationName: MEDIATORS.CACHE,
                form: <CacheForm nodePosition={props.nodePosition} documentUri={props.documentUri}></CacheForm>,
            },
            {
                title: "Entitlement Service",
                operationName: MEDIATORS.ENTITLEMENT,
                form: <EntitlementForm nodePosition={props.nodePosition} documentUri={props.documentUri}></EntitlementForm>,
            },
            {
                title: "Oauth",
                operationName: MEDIATORS.OAUTH,
                form: <OAuthForm nodePosition={props.nodePosition} documentUri={props.documentUri}></OAuthForm>,
            },
            {
                title: "NTLM",
                operationName: MEDIATORS.NTLM,
                form: <NTLMForm nodePosition={props.nodePosition} documentUri={props.documentUri}></NTLMForm>,
            },
            {
                title: "Throttle",
                operationName: MEDIATORS.THROTTLE,
                form: <ThrottleForm nodePosition={props.nodePosition} documentUri={props.documentUri}></ThrottleForm>,
            }
        ],
        "data": [
            {
                title: "Dataservice Call",
                operationName: MEDIATORS.DATASERVICECALL,
                form: <DataServiceForm nodePosition={props.nodePosition} documentUri={props.documentUri}></DataServiceForm>,
            }
        ],
        "other": [
            {
                title: "Send",
                operationName: MEDIATORS.SEND,
                form: <SendForm nodePosition={props.nodePosition} documentUri={props.documentUri}></SendForm>,
            },
            {
                title: "Callout",
                operationName: MEDIATORS.CALLOUT,
                form: <CalloutForm nodePosition={props.nodePosition} documentUri={props.documentUri}></CalloutForm>,
            },
            {
                title: "Smooks",
                operationName: MEDIATORS.SMOOKS,
                form: <SmooksForm nodePosition={props.nodePosition} documentUri={props.documentUri}></SmooksForm>,
            },
            {
                title: "Transaction",
                operationName: MEDIATORS.TRANSACTION,
                form: <TransactionForm nodePosition={props.nodePosition} documentUri={props.documentUri}></TransactionForm>,
            },
            {
                title: "Builder",
                operationName: MEDIATORS.BUILDER,
                form: <BuilderForm nodePosition={props.nodePosition} documentUri={props.documentUri}></BuilderForm>,
            },
            {
                title: "Rule",
                operationName: MEDIATORS.RULE,
                form: <RuleForm nodePosition={props.nodePosition} documentUri={props.documentUri}></RuleForm>,
            },
            {
                title: "Loopback",
                operationName: MEDIATORS.LOOPBACK,
                form: <LoopbackForm nodePosition={props.nodePosition} documentUri={props.documentUri}></LoopbackForm>,
            },
            {
                title: "Publish Event",
                operationName: MEDIATORS.PUBLISHEVENT,
                form: <PublishEventForm nodePosition={props.nodePosition} documentUri={props.documentUri}></PublishEventForm>,
            },
            {
                title: "Fast XSLT",
                operationName: MEDIATORS.FASTXSLT,
                form: <FastXSLTForm nodePosition={props.nodePosition} documentUri={props.documentUri}></FastXSLTForm>,
            },
            {
                title: "Rewrite",
                operationName: MEDIATORS.REWRITE,
                form: <RewriteForm nodePosition={props.nodePosition} documentUri={props.documentUri}></RewriteForm>,
            },
            {
                title: "xquery",
                operationName: MEDIATORS.XQUERY,
                form: <XQueryForm nodePosition={props.nodePosition} documentUri={props.documentUri}></XQueryForm>,
            },
            {
                title: "Event",
                operationName: MEDIATORS.EVENT,
                form: <EventForm nodePosition={props.nodePosition} documentUri={props.documentUri}></EventForm>,
            },
            {
                title: "Enqueue",
                operationName: MEDIATORS.ENQUEUE,
                form: <EnqueueForm nodePosition={props.nodePosition} documentUri={props.documentUri}></EnqueueForm>,
            },
            {
                title: "Bean",
                operationName: MEDIATORS.BEAN,
                form: <BeanForm nodePosition={props.nodePosition} documentUri={props.documentUri}></BeanForm>,
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
                title: "Spring",
                operationName: MEDIATORS.SPRING,
                form: <SpringForm nodePosition={props.nodePosition} documentUri={props.documentUri}></SpringForm>,
            },
            {
                title: "Conditional Router",
                operationName: MEDIATORS.CONDITIONALROUTER,
                form: <ConditionalRouterForm nodePosition={props.nodePosition} documentUri={props.documentUri}></ConditionalRouterForm>,
            },
            {
                title: "BAM",
                operationName: MEDIATORS.BAM,
                form: <BamForm nodePosition={props.nodePosition} documentUri={props.documentUri}></BamForm>
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
            case MEDIATORS.FOREACHMEDIATOR.toLowerCase(): {
                allMediators["core"] = allMediators["core"].filter((mediator: any) => !["Send", "Respond", "Loopback", "Drop"].includes(mediator.title));
                // return {...allMediators, "sequences", "connectors"};
                return { ...allMediators };
            }
        }
    }
    return { ...allMediators };
}
