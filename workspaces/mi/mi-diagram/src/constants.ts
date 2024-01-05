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
    LOG: "Log",
    THROTTLE: "Throttle",
    STORE: "Store",
    PROPERTY: "Property",
    PROPERTYGROUP: "PropertyGroup",
    RESPOND: "Respond",
    LOOPBACK: "Loopback",
    DROP: "Drop",
    CALL: "Call",
    CALLTEMPLATE: "CallTemplate",
    SEND: "Send",
    SEQUENCE: "Sequence",
    CALLOUT: "Callout",
    HEADER: "Header",
    VALIDATE: "Validate",
    HTTPENDPOINT: "http",
    FILTER: "Filter",
    PAYLOAD: "Payload",
}
