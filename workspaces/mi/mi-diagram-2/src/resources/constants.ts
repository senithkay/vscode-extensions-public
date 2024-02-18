/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

export enum DefaultColors {
    PRIMARY = "#5567D5",
    ON_PRIMARY = "#FFF",
    PRIMARY_CONTAINER = "#F0F1FB",

    SECONDARY = "#ffaf4d",
    ON_SECONDARY = "#FFF",
    SECONDARY_CONTAINER = "#fffaf2",

    SURFACE_BRIGHT = "#FFF",
    SURFACE = "#F7F8FB",
    SURFACE_DIM = "#CBCEDB",
    ON_SURFACE = "#000",
    ON_SURFACE_VARIANT = "#40404B",
    SURFACE_CONTAINER = "#cfd1f3",

    OUTLINE = "#393939",
    OUTLINE_VARIANT = "#a8a8a8",

    ERROR = "#ED2633",
}

export enum VSCodeColors {
    PRIMARY = "var(--vscode-button-background)",
    ON_PRIMARY = "var(--vscode-button-foreground)",
    PRIMARY_CONTAINER = "var(--vscode-sideBar-background)",

    SECONDARY = "var(--vscode-editorLightBulb-foreground)",
    ON_SECONDARY = "var(--vscode-button-foreground)",
    SECONDARY_CONTAINER = "var(--vscode-sideBar-background)",

    SURFACE_BRIGHT = "var(--vscode-editor-background)",
    SURFACE = "var(--vscode-sideBar-background)",
    SURFACE_DIM = "var(--vscode-activityBar-background)",
    ON_SURFACE = "var(--vscode-foreground)",
    ON_SURFACE_VARIANT = "var(--vscode-icon-foreground)",
    SURFACE_CONTAINER = "var(--vscode-editor-inactiveSelectionBackground)",

    OUTLINE = "var(--vscode-sideBar-border)",
    OUTLINE_VARIANT = "var(--vscode-dropdown-border)",

    ERROR = "var(--vscode-errorForeground)",
}

export const Colors = {
    PRIMARY: VSCodeColors.PRIMARY || DefaultColors.PRIMARY,
    ON_PRIMARY: VSCodeColors.ON_PRIMARY || DefaultColors.ON_PRIMARY,
    PRIMARY_CONTAINER:
        VSCodeColors.PRIMARY_CONTAINER || DefaultColors.PRIMARY_CONTAINER,

    SECONDARY: VSCodeColors.SECONDARY || DefaultColors.SECONDARY,
    ON_SECONDARY: VSCodeColors.ON_SECONDARY || DefaultColors.ON_SECONDARY,
    SECONDARY_CONTAINER:
        VSCodeColors.SECONDARY_CONTAINER || DefaultColors.SECONDARY_CONTAINER,

    SURFACE_BRIGHT: VSCodeColors.SURFACE_BRIGHT || DefaultColors.SURFACE_BRIGHT,
    SURFACE: VSCodeColors.SURFACE || DefaultColors.SURFACE,
    SURFACE_DIM: VSCodeColors.SURFACE_DIM || DefaultColors.SURFACE_DIM,
    ON_SURFACE: VSCodeColors.ON_SURFACE || DefaultColors.ON_SURFACE,
    ON_SURFACE_VARIANT:
        VSCodeColors.ON_SURFACE_VARIANT || DefaultColors.ON_SURFACE_VARIANT,
    SURFACE_CONTAINER:
        VSCodeColors.SURFACE_CONTAINER || DefaultColors.SURFACE_CONTAINER,

    OUTLINE: VSCodeColors.OUTLINE || DefaultColors.OUTLINE,
    OUTLINE_VARIANT:
       DefaultColors.OUTLINE_VARIANT,

    ERROR: VSCodeColors.ERROR || DefaultColors.ERROR,
};

export const NODE_GAP = {
    X: 0,
    Y: 50,
    BRANCH_X: 100,
    BRANCH_TOP: 0,
    BRANCH_BOTTOM: 80
};

export const NODE_DIMENSIONS = {
    DEFAULT: {
        WIDTH: 120,
        HEIGHT: 40,
    },
    START: {
        WIDTH: 24,
        HEIGHT: 24,
    },
    CONDITION: {
        WIDTH: 65,
        HEIGHT: 65,
    },
    CALL: {
        WIDTH: 120,
        FULL_WIDTH: 120 + 110,
        HEIGHT: 50,
    },
    EMPTY: {
        WIDTH: 12,
        HEIGHT: 12,
    },
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

export enum NodeTypes {
    START_NODE = "start-node",
    END_NODE = "end-node",
    MEDIATOR_NODE = "mediator-node",
    CONDITION_NODE = "condition-node",
    CALL_NODE = "call-node",
    EMPTY_NODE = "empty-node",
}

export const NODE_LINK = "node-link";
export const NODE_PORT = "node-port";
