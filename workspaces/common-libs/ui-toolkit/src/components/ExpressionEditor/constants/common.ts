/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { css } from '@emotion/css';

export const ANIMATION = {
    enter: css({
        transition: 'all 0.3s ease-in'
    }),
    enterFrom: css({
        opacity: 0
    }),
    enterTo: css({
        opacity: 1
    }),
    leave: css({
        transition: 'all 0.3s ease-out'
    }),
    leaveFrom: css({
        opacity: 1
    }),
    leaveTo: css({
        opacity: 0
    })
};

export const ANIMATION_SCALE_UP = {
    enter: css({
        transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out'
    }),
    enterFrom: css({
        transform: 'scaleY(0)',
        opacity: 0,
        transformOrigin: 'bottom'
    }),
    enterTo: css({
        transform: 'scaleY(1)',
        opacity: 1,
        transformOrigin: 'bottom'
    }),
    leave: css({
        transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out'
    }),
    leaveFrom: css({
        transform: 'scaleY(1)',
        opacity: 1,
        transformOrigin: 'bottom'
    }),
    leaveTo: css({
        transform: 'scaleY(0)',
        opacity: 0,
        transformOrigin: 'bottom'
    })
};

export const ANIMATION_SCALE_DOWN = {
    enter: css({
        transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out'
    }),
    enterFrom: css({
        transform: 'scaleY(0)',
        opacity: 0,
        transformOrigin: 'top'
    }),
    enterTo: css({
        transform: 'scaleY(1)',
        opacity: 1,
        transformOrigin: 'top'
    }),
    leave: css({
        transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out'
    }),
    leaveFrom: css({
        transform: 'scaleY(1)',
        opacity: 1,
        transformOrigin: 'top'
    }),
    leaveTo: css({
        transform: 'scaleY(0)',
        opacity: 0,
        transformOrigin: 'top'
    })
};

/* Helper pane related */
/* All these values are in pixels */
export const ARROW_HEIGHT = 16;
export const ARROW_OFFSET = 10;

/* Dropdown related */
export const DROPDOWN_DEFAULT_WIDTH = 350;
export const DROPDOWN_MIN_WIDTH = 335;
