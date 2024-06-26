/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react"
import { DATA_SERVICE_NODES, ENDPOINTS, MEDIATORS } from "../../../resources/constants"
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
import CommandForm from "../Pages/mediators/other/command";
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
import BuilderForm from "../Pages/mediators/other/builder";
import SequenceForm from "../Pages/mediators/core/sequence";
import RewriteForm from "../Pages/mediators/other/rewrite";
import DBLookupForm from "../Pages/mediators/data/dblookup";
import DBReportForm from "../Pages/mediators/data/dbreport";
import DataServiceCallForm from "../Pages/mediators/data/dataServiceCall";
import TransformationForm from "../Pages/dataService/transformation";
import QueryForm from "../Pages/dataService/query";
import InputMappingsForm from "../Pages/dataService/input-mapping";
import OutputMappingsForm from "../Pages/dataService/output-mapping";

export interface GetMediatorsProps {
    nodePosition: any;
    documentUri: string;
    parentNode?: string;
    previousNode?: string;
    nextNode?: string;
}
export function getAllMediators(props: GetMediatorsProps) {

    const allMediators = {
        "most popular": [
            {
                title: "Call Endpoint",
                operationName: MEDIATORS.CALL,
                tooltip: "Invokes external services in blocking/non-blocking mode",
                form: <CallForm nodePosition={props.nodePosition} documentUri={props.documentUri}></CallForm>,
            },
            {
                title: "Property",
                operationName: MEDIATORS.PROPERTY,
                tooltip: "Manipulates message properties by setting and/or removing property values, supporting both constant and dynamically generated values through XPath expressions",
                form: <PropertyForm nodePosition={props.nodePosition} documentUri={props.documentUri}></PropertyForm>,
            },
            {
                title: "Log",
                operationName: MEDIATORS.LOG,
                tooltip: "Generates logs for messages. Log details are customisable",
                form: <LogForm nodePosition={props.nodePosition} documentUri={props.documentUri}></LogForm>,
            },
            {
                title: "Payload",
                operationName: MEDIATORS.PAYLOAD,
                tooltip: "Replaces message payload with a new SOAP/JSON payload",
                form: <PayloadForm nodePosition={props.nodePosition} documentUri={props.documentUri}></PayloadForm>,
            },
            {
                title: "Respond",
                operationName: MEDIATORS.RESPOND,
                tooltip: "Terminates the processing of the current message flow and returns the message to the client",
                form: <RespondForm nodePosition={props.nodePosition} documentUri={props.documentUri}></RespondForm>,
            },
            {
                title: "Data Mapper",
                operationName: MEDIATORS.DATAMAPPER,
                tooltip: "Transforms one data format to another, or changes the data structure in the message",
                form: <DataMapperForm nodePosition={props.nodePosition} documentUri={props.documentUri}></DataMapperForm>,
            }
        ],
        "flow control": [
            {
                title: "Filter",
                operationName: MEDIATORS.FILTER,
                tooltip: "Filters messages based on XPath/JSONPath/regex",
                form: <FilterForm nodePosition={props.nodePosition} documentUri={props.documentUri}></FilterForm>,
            },
            {
                title: "Switch",
                operationName: MEDIATORS.SWITCH,
                tooltip: "Routes messages based on XPath/JSONPath/regex matching",
                form: <SwitchForm nodePosition={props.nodePosition} documentUri={props.documentUri}></SwitchForm>,
            },
            {
                title: "Clone",
                operationName: MEDIATORS.CLONE,
                tooltip: "Clones a message into several messages",
                form: <CloneForm nodePosition={props.nodePosition} documentUri={props.documentUri}></CloneForm>,
            },
            {
                title: "Iterate",
                operationName: MEDIATORS.ITERATE,
                tooltip: "Splits message into several for parallel processing (XPath/JSONPath)",
                form: <IterateForm nodePosition={props.nodePosition} documentUri={props.documentUri}></IterateForm>,
            },
            {
                title: "Foreach",
                operationName: MEDIATORS.FOREACHMEDIATOR,
                tooltip: "Splits message based on XPath/JSONPath, processes sequentially, then merges back",
                form: <ForEachMediatorForm nodePosition={props.nodePosition} documentUri={props.documentUri}></ForEachMediatorForm>,
            },
            {
                title: "Aggregate",
                operationName: MEDIATORS.AGGREGATE,
                tooltip: "Combines message responses that were split by Clone/Iterate mediator",
                form: <AggregateForm nodePosition={props.nodePosition} documentUri={props.documentUri}></AggregateForm>,
            },
            {
                title: "Validate",
                operationName: MEDIATORS.VALIDATE,
                tooltip: "Validates an XML/JSON message against XML/JSON schema",
                form: <ValidateForm nodePosition={props.nodePosition} documentUri={props.documentUri}></ValidateForm>,
            }
        ],
        "transformation": [
            {
                title: "Enrich",
                operationName: MEDIATORS.ENRICH,
                tooltip: "Enriches message content (envelope, body, etc.) based on specification",
                form: <EnrichForm nodePosition={props.nodePosition} documentUri={props.documentUri}></EnrichForm>,
            },
            {
                title: "Header",
                operationName: MEDIATORS.HEADER,
                tooltip: "Sets/removes message header (SOAP/transport scope)",
                form: <HeaderForm nodePosition={props.nodePosition} documentUri={props.documentUri}></HeaderForm>,
            },
            {
                title: "XSLT",
                operationName: MEDIATORS.XSLT,
                tooltip: "Transforms message payload based on an XSLT script. For faster XSLT transformation, use FastXSLT",
                form: <XSLTForm nodePosition={props.nodePosition} documentUri={props.documentUri}></XSLTForm>,
            },
            {
                title: "Json Transform",
                operationName: MEDIATORS.JSONTRANSFORM,
                tooltip: "Controls XML to JSON transformations inside a mediation",
                form: <JSONTransformForm nodePosition={props.nodePosition} documentUri={props.documentUri}></JSONTransformForm>,
            },
            {
                title: "Fault",
                operationName: MEDIATORS.FAULT,
                tooltip: "Transforms the current message into a fault message",
                form: <FaultForm nodePosition={props.nodePosition} documentUri={props.documentUri}></FaultForm>,
            },
            {
                title: "Payload",
                operationName: MEDIATORS.PAYLOAD,
                tooltip: "Replaces message payload with a new SOAP/JSON payload",
                form: <PayloadForm nodePosition={props.nodePosition} documentUri={props.documentUri}></PayloadForm>,
            },
            {
                title: "Data Mapper",
                operationName: MEDIATORS.DATAMAPPER,
                tooltip: "Transforms one data format to another, or changes the data structure in the message",
                form: <DataMapperForm nodePosition={props.nodePosition} documentUri={props.documentUri}></DataMapperForm>,
            },
        ],
        "extension": [
            {
                title: "Script",
                operationName: MEDIATORS.SCRIPT,
                tooltip: "Invokes scripting language functions with embedded or stored script files",
                form: <ScriptForm nodePosition={props.nodePosition} documentUri={props.documentUri}></ScriptForm>,
            },
            {
                title: "Class",
                operationName: MEDIATORS.CLASS,
                tooltip: "Uses custom class instance as mediator",
                form: <ClassForm nodePosition={props.nodePosition} documentUri={props.documentUri}></ClassForm>,
            }
        ],
        "generic": [
            {
                title: "Call Endpoint",
                operationName: MEDIATORS.CALL,
                tooltip: "Invokes external services in blocking/non-blocking mode",
                form: <CallForm nodePosition={props.nodePosition} documentUri={props.documentUri}></CallForm>,
            },
            {
                title: "Property",
                operationName: MEDIATORS.PROPERTY,
                tooltip: "Manipulates message properties by setting and/or removing property values, supporting both constant and dynamically generated values through XPath expressions",
                form: <PropertyForm nodePosition={props.nodePosition} documentUri={props.documentUri}></PropertyForm>,
            },
            {
                title: "Log",
                operationName: MEDIATORS.LOG,
                tooltip: "Generates logs for messages. Log details are customisable",
                form: <LogForm nodePosition={props.nodePosition} documentUri={props.documentUri}></LogForm>,
            },
            {
                title: "Respond",
                operationName: MEDIATORS.RESPOND,
                tooltip: "Terminates the processing of the current message flow and returns the message to the client",
                form: <RespondForm nodePosition={props.nodePosition} documentUri={props.documentUri}></RespondForm>,
            },
            {
                title: "Call Sequence",
                operationName: MEDIATORS.SEQUENCE,
                tooltip: "Inserts reference to a sequence",
                form: <SequenceForm nodePosition={props.nodePosition} documentUri={props.documentUri}></SequenceForm>,
            },
            {
                title: "Call Template",
                operationName: MEDIATORS.CALLTEMPLATE,
                tooltip: "Invokes sequence template by populating pre-configured parameters with static values or XPath expressions",
                form: <CallTemplateForm nodePosition={props.nodePosition} documentUri={props.documentUri}></CallTemplateForm>,
            },
            {
                title: "Drop",
                operationName: MEDIATORS.DROP,
                tooltip: "Stops processing of the current message and terminates message flow",
                form: <DropForm nodePosition={props.nodePosition} documentUri={props.documentUri}></DropForm>,
            },
            {
                title: "Property Group",
                operationName: MEDIATORS.PROPERTYGROUP,
                tooltip: "Sets/removes multiple properties on message context efficiently",
                form: <PropertyGroupForm nodePosition={props.nodePosition} documentUri={props.documentUri}></PropertyGroupForm>,
            },
            {
                title: "Cache",
                operationName: MEDIATORS.CACHE,
                tooltip: "Utilizes cached response if a similar message has been stored previously",
                form: <CacheForm nodePosition={props.nodePosition} documentUri={props.documentUri}></CacheForm>,
            },
            {
                title: "Throttle",
                operationName: MEDIATORS.THROTTLE,
                tooltip: "Restricts access to services",
                form: <ThrottleForm nodePosition={props.nodePosition} documentUri={props.documentUri}></ThrottleForm>,
            },
            {
                title: "Store Message",
                operationName: MEDIATORS.STORE,
                tooltip: "Routes message to a predefined message store",
                form: <StoreForm nodePosition={props.nodePosition} documentUri={props.documentUri}></StoreForm>,
            }
        ],
        "security": [
            {
                title: "Oauth",
                operationName: MEDIATORS.OAUTH,
                tooltip: "Validates client credentials for a RESTful service using OAuth (WSO2 IS)",
                form: <OAuthForm nodePosition={props.nodePosition} documentUri={props.documentUri}></OAuthForm>,
            },
            {
                title: "Entitlement Service",
                operationName: MEDIATORS.ENTITLEMENT,
                tooltip: "Evaluates messages against XACML policy",
                form: <EntitlementForm nodePosition={props.nodePosition} documentUri={props.documentUri}></EntitlementForm>,
            },
            {
                title: "NTLM",
                operationName: MEDIATORS.NTLM,
                tooltip: "Enables access to NTLM-protected services",
                form: <NTLMForm nodePosition={props.nodePosition} documentUri={props.documentUri}></NTLMForm>,
            }
        ],
        "database": [
            {
                title: "Call Dataservice",
                operationName: MEDIATORS.DATASERVICECALL,
                tooltip: "Invokes data service operations",
                form: <DataServiceCallForm nodePosition={props.nodePosition} documentUri={props.documentUri}></DataServiceCallForm>,
            },
            {
                title: "DB Lookup",
                operationName: MEDIATORS.DBLOOKUP,
                tooltip: "Executes SQL SELECT statements, and sets resulting values to message context as local properties",
                form: <DBLookupForm nodePosition={props.nodePosition} documentUri={props.documentUri}></DBLookupForm>,
            },
            {
                title: "DB Report",
                operationName: MEDIATORS.DBREPORT,
                tooltip: "Executes SQL INSERT/UPDATE/DELETE statements, and sets resulting values to message context as local properties",
                form: <DBReportForm nodePosition={props.nodePosition} documentUri={props.documentUri}></DBReportForm>,
            }
        ],
        "other": [
            {
                title: "Send",
                operationName: MEDIATORS.SEND,
                tooltip: "Invokes external service in non-blocking mode",
                form: <SendForm nodePosition={props.nodePosition} documentUri={props.documentUri}></SendForm>,
            },
            {
                title: "Callout",
                operationName: MEDIATORS.CALLOUT,
                tooltip: "Invokes external service in blocking mode",
                form: <CalloutForm nodePosition={props.nodePosition} documentUri={props.documentUri}></CalloutForm>,
            },
            {
                title: "Smooks",
                operationName: MEDIATORS.SMOOKS,
                tooltip: "Applies lightweight message transformations (XML, non-XML)",
                form: <SmooksForm nodePosition={props.nodePosition} documentUri={props.documentUri}></SmooksForm>,
            },
            {
                title: "Transaction",
                operationName: MEDIATORS.TRANSACTION,
                tooltip: "Provides transaction management for child mediators",
                form: <TransactionForm nodePosition={props.nodePosition} documentUri={props.documentUri}></TransactionForm>,
            },
            {
                title: "Builder",
                operationName: MEDIATORS.BUILDER,
                tooltip: "Builds (converts to XML) messages even with Binary Relay enabled in the server",
                form: <BuilderForm nodePosition={props.nodePosition} documentUri={props.documentUri}></BuilderForm>,
            },
            {
                title: "Rule",
                operationName: MEDIATORS.RULE,
                tooltip: "Processes XML message by applying a set of rules",
                form: <RuleForm nodePosition={props.nodePosition} documentUri={props.documentUri}></RuleForm>,
            },
            {
                title: "Loopback",
                operationName: MEDIATORS.LOOPBACK,
                tooltip: "Routes messages from the inflow (In Sequence) to outflow (Out Sequence)",
                form: <LoopbackForm nodePosition={props.nodePosition} documentUri={props.documentUri}></LoopbackForm>,
            },
            {
                title: "Publish Event",
                operationName: MEDIATORS.PUBLISHEVENT,
                tooltip: "Constructs and publishes events to different systems such as WSO2 BAM/DAS/CEP/SP via event sinks",
                form: <PublishEventForm nodePosition={props.nodePosition} documentUri={props.documentUri}></PublishEventForm>,
            },
            {
                title: "Fast XSLT",
                operationName: MEDIATORS.FASTXSLT,
                tooltip: "Swiftly transforms message streams (not payloads) based on an XSLT script",
                form: <FastXSLTForm nodePosition={props.nodePosition} documentUri={props.documentUri}></FastXSLTForm>,
            },
            {
                title: "Rewrite",
                operationName: MEDIATORS.REWRITE,
                tooltip: "Swiftly transforms message streams (not payloads) based on an XSLT script",
                form: <RewriteForm nodePosition={props.nodePosition} documentUri={props.documentUri}></RewriteForm>,
            },
            {
                title: "xquery",
                operationName: MEDIATORS.XQUERY,
                tooltip: "Performs XQuery transformation on messages",
                form: <XQueryForm nodePosition={props.nodePosition} documentUri={props.documentUri}></XQueryForm>,
            },
            {
                title: "Event",
                operationName: MEDIATORS.EVENT,
                tooltip: "Sends event notifications to an event source, and publishes messages to topics",
                form: <EventForm nodePosition={props.nodePosition} documentUri={props.documentUri}></EventForm>,
            },
            {
                title: "Enqueue",
                operationName: MEDIATORS.ENQUEUE,
                tooltip: "Executes different sequences for messages with different properties in high-load scenarios",
                form: <EnqueueForm nodePosition={props.nodePosition} documentUri={props.documentUri}></EnqueueForm>,
            },
            {
                title: "Bean",
                operationName: MEDIATORS.BEAN,
                tooltip: "Manipulates JavaBean bound to message context as a property",
                form: <BeanForm nodePosition={props.nodePosition} documentUri={props.documentUri}></BeanForm>,
            },
            {
                title: "Command",
                operationName: MEDIATORS.COMMAND,
                tooltip: "Creates an instance of a custom class to invoke an object encapsulating a method call",
                form: <CommandForm nodePosition={props.nodePosition} documentUri={props.documentUri}></CommandForm>,
            },
            {
                title: "EJB",
                operationName: MEDIATORS.EJB,
                tooltip: "Calls EJB (Stateless/Stateful) and stores result in message payload/property",
                form: <EJBForm nodePosition={props.nodePosition} documentUri={props.documentUri}></EJBForm>,
            },
            {
                title: "Spring",
                operationName: MEDIATORS.SPRING,
                tooltip: "Exposes a Spring bean as a mediator",
                form: <SpringForm nodePosition={props.nodePosition} documentUri={props.documentUri}></SpringForm>,
            },
            {
                title: "Conditional Router",
                operationName: MEDIATORS.CONDITIONALROUTER,
                tooltip: "Routes messages to target sequence only if conditions are met",
                form: <ConditionalRouterForm nodePosition={props.nodePosition} documentUri={props.documentUri}></ConditionalRouterForm>,
            },
            {
                title: "BAM",
                operationName: MEDIATORS.BAM,
                tooltip: "Deprecated. Use PublishEvent Mediator for similar functionality",
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

    // hide respond mediator if next node is present
    if (props.nextNode || props.parentNode) {
        allMediators["most popular"] = allMediators["most popular"].filter((mediator: any) => !["Respond"].includes(mediator.title));
        allMediators["generic"] = allMediators["generic"].filter((mediator: any) => !["Respond"].includes(mediator.title));
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
                allMediators["generic"] = allMediators["generic"].filter((mediator: any) => !["Send", "Respond", "Loopback", "Drop"].includes(mediator.title));
                // return {...allMediators, "sequences", "connectors"};
                return { ...allMediators };
            }
        }
    }
    return { ...allMediators };
}

export function getAllDataServiceForms(props: GetMediatorsProps) {
    return [
        {
            title: "Input Mapping",
            operationName: DATA_SERVICE_NODES.INPUT,
            form: <InputMappingsForm nodePosition={props.nodePosition} documentUri={props.documentUri}></InputMappingsForm>,
        },
        {
            title: "Query",
            operationName: DATA_SERVICE_NODES.QUERY,
            form: <QueryForm nodePosition={props.nodePosition} documentUri={props.documentUri}></QueryForm>,
        },
        {
            title: "Transformation",
            operationName: DATA_SERVICE_NODES.TRANSFORMATION,
            form: <TransformationForm nodePosition={props.nodePosition} documentUri={props.documentUri}></TransformationForm>,
        },
        {
            title: "Output Mapping",
            operationName: DATA_SERVICE_NODES.OUTPUT,
            form: <OutputMappingsForm nodePosition={props.nodePosition} documentUri={props.documentUri}></OutputMappingsForm>,
        }
    ]
}