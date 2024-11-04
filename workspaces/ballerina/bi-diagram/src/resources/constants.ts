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

    BLUE = "#1a85ff",
    GREEN = "#388a34",
    PURPLE = "#652d90",
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

    BLUE = "var(--vscode-charts-blue)",
    GREEN = "var(--vscode-charts-green)",
    PURPLE = "var(--vscode-charts-purple)",
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

    BLUE: VSCodeColors.BLUE || DefaultColors.BLUE,
    GREEN: VSCodeColors.GREEN || DefaultColors.GREEN,
    PURPLE: VSCodeColors.PURPLE || DefaultColors.PURPLE,
};

export enum NodeTypes {
    BASE_NODE = "base-node",
    EMPTY_NODE = "empty-node",
    DRAFT_NODE = "draft-node",
    IF_NODE = "if-node",
    WHILE_NODE = "while-node",
    START_NODE = "start-node",
    API_CALL_NODE = "api-call-node",
    COMMENT_NODE = "comment-node",
    BUTTON_NODE = "button-node",
    CODE_BLOCK_NODE = "code-block-node",
    END_NODE = "end-node",
}

export const NODE_LINK = "node-link";
export const NODE_PORT = "node-port";
export const LOADING_OVERLAY = "loading-overlay";

// sizing
export const NODE_WIDTH = 280;
export const NODE_HEIGHT = 50;

export const LABEL_HEIGHT = 20;

export const NODE_BORDER_WIDTH = 1.8;

export const NODE_PADDING = 8;

// position
export const DIAGRAM_CENTER_X = 0;
export const NODE_GAP_Y = 40;
export const NODE_GAP_X = 60;

// custom nodes
export const IF_NODE_WIDTH = 65;
export const WHILE_NODE_WIDTH = 58;
export const EMPTY_NODE_WIDTH = 16;
export const EMPTY_NODE_CONTAINER_WIDTH = NODE_WIDTH / 2;
export const END_NODE_WIDTH = 20;

// draft node
export const DRAFT_NODE_WIDTH = NODE_WIDTH;
export const DRAFT_NODE_HEIGHT = NODE_HEIGHT;
export const DRAFT_NODE_BORDER_WIDTH = 2;

// popup box
export const POPUP_BOX_WIDTH = NODE_WIDTH + NODE_GAP_X + 20;
export const POPUP_BOX_HEIGHT = 58;

// button node
export const BUTTON_NODE_WIDTH = 160;
export const BUTTON_NODE_HEIGHT = 30;

// comment node
export const COMMENT_NODE_WIDTH = 200;
export const COMMENT_NODE_GAP = 30;

// HACK
export const VSCODE_MARGIN = 20;
