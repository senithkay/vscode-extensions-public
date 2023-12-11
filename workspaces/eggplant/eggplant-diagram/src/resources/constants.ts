/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import exp from "constants";

export enum Colors {
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

export const START_NODE = "FunctionStart";
export const END_NODE = "FunctionEnd";

export const EVENT_TYPES = {
    ADD_NODE: "add-node",
    ADD_LINK: "add-link",
    DELETE_NODE: "delete-node",
    DELETE_LINK: "delete-link",
    UPDATE_NODE: "update-node",
};

export const NODE_TYPE = {
    START: "start",
    END: "end",
    CODE_BLOCK: "code-block",
    SWITCH: "switch",
};
