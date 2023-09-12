/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { DagreEngine } from '../resources/DagreEngine'; // TODO: Update library props to support node parents

export enum Colors {
    DEFAULT_TEXT = '#40404B',

    PRIMARY = '#5567D5',
    PRIMARY_LIGHT = '#CBCEDB',
    PRIMARY_SELECTED = '#ffaf4d',
    PRIMARY_FOCUSED = '#d59155',

    SECONDARY = '#F0F1FB',
    SECONDARY_SELECTED = '#fffaf2',
    SHADED_SELECTED = '#faead2',

    NODE_BACKGROUND_PRIMARY = '#F7F8FB',
    NODE_BACKGROUND_SECONDARY = '#d3d3d3',
    NODE_BORDER = '#393939',
}

export const dagreEngine = new DagreEngine({
    graph: {
        rankdir: 'LR',
        ranksep: 280,
        edgesep: 100,
        nodesep: 140,
        ranker: 'tight-tree',
    },
    includeLinks: true,
});

// error messages
export const NO_ENTITIES_DETECTED = 'Could not detect any components in the project.';
export const ERRONEOUS_MODEL = 'Please resolve the diagnostics to view the cell diagram.';
export const NO_CELL_NODE = 'Could not detect cell.';

// node types
export const COMPONENT_NODE = "componentNode";
export const CONNECTOR_NODE = "connectorNode";
export const MAIN_CELL = "mainCell";
export const EMPTY_NODE = "emptyNode";

// node dimensions
export const MAIN_CELL_DEFAULT_HEIGHT = 500;
export const CELL_LINE_WIDTH = 2;
export const CIRCLE_WIDTH = 60;
export const DOT_WIDTH = 20;
export const COMPONENT_CIRCLE_WIDTH = 80;

export const LABEL_FONT_SIZE = 20;
export const LABEL_MAX_WIDTH = 120;
