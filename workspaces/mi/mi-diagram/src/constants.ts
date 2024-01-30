/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

export const OFFSET = {
    START: {
        X: 50,
        Y: 50
    },
    BETWEEN: {
        X: 0,
        Y: 80,
        SEQUENCE: 30,
    },
    MARGIN: {
        LEFT: 0,
        RIGHT: 80,
        TOP: 20,
        BOTTOM: 50,
        SEQUENCE: 50,
    }
};

// MEDIATOR NAMES
export const MEDIATORS = {
    AGGREGATE: "Aggregate",
    CACHE: "Cache",
    CALL: "Call",
    CALLOUT: "Callout",
    CALLTEMPLATE: "CallTemplate",
    CLONE: "Clone",
    DATAMAPPER: "DataMapper",
    DATASERVICE: "DataService",
    DROP: "Drop",
    ENRICH: "Enrich",
    ENTITLEMENT: "Entitlement",
    FASTXSLT: "FastXSLT",
    FAULT: "Fault",
    FILTER: "Filter",
    FOREACH: "ForEach",
    HEADER: "Header",
    ITERATE: "Iterate",
    JSONTRANSFORM: "JSONTransform",
    LOG: "Log",
    LOOPBACK: "Loopback",
    PAYLOAD: "Payload",
    PROPERTY: "Property",
    PROPERTYGROUP: "PropertyGroup",
    RESPOND: "Respond",
    REWRITE: "Rewrite",
    RULE: "Rule",
    SEND: "Send",
    SEQUENCE: "Sequence",
    SMOOKS: "Smooks",
    STORE: "Store",
    SWITCH: "Switch",
    THROTTLE: "Throttle",
    VALIDATE: "Validate",
    XQUERY: "XQuery",
    XSLT: "XSLT",
}

export const ENDPOINTS = {
    ADDRESS: "Address",
    DEFAULT: "Default",
    FAILOVER: "Failover",
    HTTP: "Http",
    LOADBALANCE: "Loadbalance",
    NAMED: "Named",
    RECIPIENTLIST: "Recipientlist",
    TEMPLATE: "Template",
    WSDL: "wsdl",
}
