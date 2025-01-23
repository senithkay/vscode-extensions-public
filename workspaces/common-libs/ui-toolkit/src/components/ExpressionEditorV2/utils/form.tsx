/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { MutableRefObject } from "react";
import { HelperPanePosition } from "../types/form";
import { HelperPaneOrigin } from "../types";
import { HELPER_PANE_HEIGHT, HELPER_PANE_WIDTH, ARROW_HEIGHT, ARROW_OFFSET } from "../constants"

export const getHelperPanePosition = (
    expressionEditorRef: MutableRefObject<HTMLDivElement>,
    helperPaneOrigin: HelperPaneOrigin
): HelperPanePosition => {
    const expressionEditor = expressionEditorRef.current!;
    const rect = expressionEditor.getBoundingClientRect();
    if (helperPaneOrigin === 'bottom') {
        return { top: rect.top + rect.height, left: rect.left };
    }

    const position: HelperPanePosition = { top: 0, left: 0 };
    /* In the best case scenario, the helper pane should be poping up on the right of left side
    of the expression editor, aligning to the center of the editor. In case, the viewport is
    not large enough to position the editor in such a way, the position will be updated to keep
    the helper pane within the viewport. */
    position.top = rect.top - (HELPER_PANE_HEIGHT / 2);
    if (helperPaneOrigin === 'right') {
        position.left = rect.left + rect.width + ARROW_HEIGHT;
    } else if (helperPaneOrigin === 'left') {
        position.left = rect.left - (HELPER_PANE_WIDTH + ARROW_HEIGHT);
    }

    if (rect.top < HELPER_PANE_HEIGHT / 2) {
        position.top = 0;
    }
    if (window.innerHeight - rect.top < HELPER_PANE_HEIGHT / 2) {
        position.top = window.innerHeight - HELPER_PANE_HEIGHT;
    }

    return position;
};

export const getArrowPosition = (
    expressionEditorRef: MutableRefObject<HTMLDivElement>,
    helperPaneOrigin: HelperPaneOrigin,
    helperPanePosition: HelperPanePosition
): HelperPanePosition | undefined => {
    if (helperPaneOrigin === 'bottom' || !helperPanePosition) {
        return undefined;
    }

    const position: HelperPanePosition = { top: 0, left: 0 };
    const expressionEditor = expressionEditorRef.current!;
    const rect = expressionEditor.getBoundingClientRect();

    position.top = rect.top - helperPanePosition.top + ARROW_OFFSET;
    if (helperPaneOrigin === 'left') {
        position.left = HELPER_PANE_WIDTH;
    } else {
        position.left = -ARROW_HEIGHT;
    }

    return position;
}
