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
    DEBUGGER_BREAKPOINT_BACKGROUND = "#ffcc004d",
}

export enum VSCodeColors {
    PRIMARY = "var(--vscode-button-background)",
    ON_PRIMARY = "var(--vscode-button-foreground)",
    PRIMARY_CONTAINER = "var(--vscode-sideBar-background)",

    SECONDARY = "var(--vscode-editorLightBulb-foreground)",
    ON_SECONDARY = "var(--vscode-button-foreground)",
    SECONDARY_CONTAINER = "var(--vscode-sideBar-background)",
    SECONDARY_BUTTON = "var(--button-secondary-background)",

    SURFACE_BRIGHT = "var(--vscode-editor-background)",
    SURFACE = "var(--vscode-sideBar-background)",
    SURFACE_DIM = "var(--vscode-activityBar-background)",
    ON_SURFACE = "var(--vscode-foreground)",
    ON_SURFACE_VARIANT = "var(--vscode-icon-foreground)",
    SURFACE_CONTAINER = "var(--vscode-editor-inactiveSelectionBackground)",

    OUTLINE = "var(--vscode-sideBar-border)",
    OUTLINE_VARIANT = "var(--vscode-dropdown-border)",

    ERROR = "var(--vscode-errorForeground)",

    INPUT_OPTION_ACTIVE = "var(--vscode-inputOption-activeBackground)",
    INPUT_OPTION_INACTIVE = "var(--vscode-inputOption-inactiveBackground)",
    INPUT_OPTION_HOVER = "var(--vscode-inputOption-hoverBackground)",
    INPUT_OPTION_ACTIVE_BORDER = "var(--vscode-inputOption-activeBorder)",
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
    SECONDARY_BUTTON: VSCodeColors.SECONDARY_BUTTON || DefaultColors.SECONDARY,

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

    INPUT_OPTION_ACTIVE: VSCodeColors.INPUT_OPTION_ACTIVE,
    INPUT_OPTION_INACTIVE: VSCodeColors.INPUT_OPTION_INACTIVE,
    INPUT_OPTION_HOVER: VSCodeColors.INPUT_OPTION_HOVER,
    INPUT_OPTION_ACTIVE_BORDER: VSCodeColors.INPUT_OPTION_ACTIVE_BORDER,

    DEBUGGER_BREAKPOINT_BACKGROUND: DefaultColors.DEBUGGER_BREAKPOINT_BACKGROUND,
};

export const NODE_GAP = {
    X: 0,
    Y: 50,
    BRANCH_X: 50,
    BRANCH_TOP: 60,
    BRANCH_BOTTOM: 0,
    SEQUENCE_Y: 100,
    GROUP_NODE_START_Y: 50,
    GROUP_NODE_END_Y: 50,
    GROUP_NODE_HORIZONTAL_PADDING: 22,
    TEXT_NODE_GAP: 25,
};

export const NODE_DIMENSIONS = {
    DEFAULT: {
        WIDTH: 150,
        HEIGHT: 60,
    },
    START: {
        EDITABLE: {
            WIDTH: 100,
            HEIGHT: 40,
        },
        DISABLED: {
            WIDTH: 24,
            HEIGHT: 24,
        }
    },
    CONDITION: {
        WIDTH: 65,
        HEIGHT: 65,
    },
    REFERENCE: {
        WIDTH: 150,
        HEIGHT: 60,
    },
    GROUP: {
        WIDTH: 150,
        HEIGHT: 60,
    },
    CALL: {
        WIDTH: 150,
        FULL_WIDTH: 150 + 110,
        HEIGHT: 60,
    },
    EMPTY: {
        WIDTH: 0,
        HEIGHT: 0,
        BRANCH: {
            WIDTH: 150,
            HEIGHT: 100,
        },
    },
    END: {
        WIDTH: 23,
        HEIGHT: 21,
    },
    PLUS: {
        WIDTH: 24,
        HEIGHT: 24,
    },
    CONNECTOR: {
        WIDTH: 150,
        HEIGHT: 60,
    },
    DATA_SERVICE: {
        WIDTH: 150,
        HEIGHT: 60,
        GAP: 100
    },
    BORDER: 1,
};


// MEDIATOR NAMES
export const MEDIATORS = {
    AGGREGATE: "Aggregate",
    CACHE: "Cache",
    CALL: "Call Endpoint",
    CALLOUT: "Callout",
    CALLTEMPLATE: "Call Template",
    CLONE: "Clone",
    DATAMAPPER: "DataMapper",
    DATASERVICECALL: "Call Data Service",
    DROP: "Drop",
    ENRICH: "Enrich",
    ENTITLEMENT: "Entitlement Service",
    FASTXSLT: "FastXSLT",
    FAULT: "Fault",
    FILTER: "Filter",
    FOREACHMEDIATOR: "ForEach",
    HEADER: "Header",
    ITERATE: "Iterate",
    JSONTRANSFORM: "JSON Transform",
    LOG: "Log",
    LOOPBACK: "Loopback",
    PAYLOAD: "Payload Factory",
    PROPERTY: "Property",
    PROPERTYGROUP: "Property Group",
    RESPOND: "Respond",
    REWRITE: "Rewrite",
    RULE: "Rule",
    SEND: "Send",
    SEQUENCE: "Call Sequence",
    SMOOKS: "Smooks",
    STORE: "Store",
    SWITCH: "Switch",
    THROTTLE: "Throttle",
    VALIDATE: "Validate",
    XQUERY: "XQuery",
    XSLT: "XSLT",
    BEAN: "Bean",
    CLASS: "Class",
    COMMAND: "Command",
    EJB: "Ejb",
    SCRIPT: "Script",
    SPRING: "Spring",
    DBLOOKUP: "DB Lookup",
    DBREPORT: "DB Report",
    ENQUEUE: "Enqueue",
    EVENT: "Event",
    TRANSACTION: "Transaction",
    CONDITIONALROUTER: "Conditional Router",
    BAM: "Bam",
    OAUTH: "OAuth",
    BUILDER: "Builder",
    PUBLISHEVENT: "Publish Event",
    NTLM: "NTLM",
}

export const ENDPOINTS = {
    ADDRESS: "Address",
    DEFAULT: "Default",
    FAILOVER: "Failover",
    HTTP: "HTTP_ENDPOINT",
    LOADBALANCE: "Loadbalance",
    NAMED: "NAMED_ENDPOINT",
    RECIPIENTLIST: "Recipientlist",
    TEMPLATE: "Template",
    WSDL: "wsdl",
}

export const DATA_SERVICE_NODES = {
    INPUT: "Input Mapping",
    QUERY: "Query",
    TRANSFORMATION: "Transformation",
    OUTPUT: "Output Mapping",
}

export enum NodeTypes {
    START_NODE = "start-node",
    END_NODE = "end-node",
    MEDIATOR_NODE = "mediator-node",
    REFERENCE_NODE = "reference-node",
    CONDITION_NODE = "condition-node",
    CONDITION_NODE_END = "condition-node-end",
    GROUP_NODE = "group-node",
    CALL_NODE = "call-node",
    PLUS_NODE = "plus-node",
    EMPTY_NODE = "empty-node",
    CONNECTOR_NODE = "connector-node",
    DATA_SERVICE_NODE = "data-service-node",
}

export const NODE_LINK = "node-link";
export const NODE_PORT = "node-port";

export enum SequenceType {
    IN_SEQUENCE = "inSequence",
    OUT_SEQUENCE = "outSequence",
    FAULT_SEQUENCE = "faultSequence",
};

// Actions for service designer
export const SERVICE = {
    EDIT_RESOURCE: "edit-resource",
    EDIT_SEQUENCE: "edit-sequence",
    EDIT_PROXY: "edit-proxy",
}

export const ADD_NEW_SEQUENCE_TAG = "addNewSequence";
export const OPEN_SEQUENCE_VIEW = "Open Sequence View";
export const OPEN_DATA_MAPPER_VIEW = "Open Data Mapping";
export const OPEN_DSS_SERVICE_DESIGNER = "Open Service Designer";

export const DATA_SERVICE = {
    EDIT_QUERY: "edit-query",
    EDIT_RESOURCE_PARAMS: "edit-resource-params",
    EDIT_RESOURCE: "edit-resource",
    EDIT_SELF_CLOSE_RESOURCE: "edit-self-close-resource",
}

export const APIS = {
    CONNECTOR: "https://apis.wso2.com/connector-store/connector-details"
}
