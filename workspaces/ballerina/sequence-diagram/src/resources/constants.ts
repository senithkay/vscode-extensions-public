/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
/* eslint-disable @typescript-eslint/no-duplicate-enum-values */

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
    SURFACE_DIM = "var(--vscode-menu-background)",
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
    PRIMARY_CONTAINER: VSCodeColors.PRIMARY_CONTAINER || DefaultColors.PRIMARY_CONTAINER,

    SECONDARY: VSCodeColors.SECONDARY || DefaultColors.SECONDARY,
    ON_SECONDARY: VSCodeColors.ON_SECONDARY || DefaultColors.ON_SECONDARY,
    SECONDARY_CONTAINER: VSCodeColors.SECONDARY_CONTAINER || DefaultColors.SECONDARY_CONTAINER,

    SURFACE_BRIGHT: VSCodeColors.SURFACE_BRIGHT || DefaultColors.SURFACE_BRIGHT,
    SURFACE: VSCodeColors.SURFACE || DefaultColors.SURFACE,
    SURFACE_DIM: VSCodeColors.SURFACE_DIM || DefaultColors.SURFACE_DIM,
    ON_SURFACE: VSCodeColors.ON_SURFACE || DefaultColors.ON_SURFACE,
    ON_SURFACE_VARIANT: VSCodeColors.ON_SURFACE_VARIANT || DefaultColors.ON_SURFACE_VARIANT,
    SURFACE_CONTAINER: VSCodeColors.SURFACE_CONTAINER || DefaultColors.SURFACE_CONTAINER,

    OUTLINE: VSCodeColors.OUTLINE || DefaultColors.OUTLINE,
    OUTLINE_VARIANT: VSCodeColors.OUTLINE_VARIANT || DefaultColors.OUTLINE_VARIANT,

    ERROR: VSCodeColors.ERROR || DefaultColors.ERROR,
};

export enum NodeTypes {
    BASE_NODE = "base-node",
    PARTICIPANT_NODE = "participant-node",
    INTERACTION_NODE = "interaction-node",
    POINT_NODE = "point-node",
    LIFE_LINE_NODE = "life-line-node",
    EMPTY_NODE = "empty-node",
    CONTAINER_NODE = "container-node",
}

export const DIAGRAM_END = 10000;

export const NODE_LINK = "node-link";
export const NODE_PORT = "node-port";
export const LOADING_OVERLAY = "loading-overlay";

export const DEFAULT_CALLER = "default-caller";

export const NODE_WIDTH = 20;
export const NODE_HEIGHT = NODE_WIDTH;

export const BORDER_WIDTH = 1.5;

export const EMPTY_NODE_WIDTH = NODE_WIDTH;

export const PARTICIPANT_NODE_WIDTH = 160;
export const PARTICIPANT_NODE_HEIGHT = 40;
export const PARTICIPANT_TAIL_MIN_HEIGHT = 800;
export const PARTICIPANT_GAP_X = 120;

export const INTERACTION_NODE_WIDTH = NODE_WIDTH;
export const INTERACTION_NODE_HEIGHT = NODE_WIDTH;
export const INTERACTION_GAP_Y = INTERACTION_NODE_HEIGHT + BORDER_WIDTH * 2;
export const INTERACTION_GROUP_GAP_Y = INTERACTION_GAP_Y * 3;

export const CONTAINER_PADDING = 8;
