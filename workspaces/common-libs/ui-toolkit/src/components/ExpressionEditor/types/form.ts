/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { MutableRefObject, ReactNode, CSSProperties } from 'react';
import { ActionButtonType, ExpressionEditorProps, ExpressionEditorRef, HelperPaneHeight, HelperPaneOrigin } from './common';

type HelperPaneConditionalProps = {
    // - Whether the helper pane is open
    isHelperPaneOpen: boolean;
    // - Position of the helper pane
    helperPaneOrigin?: HelperPaneOrigin;
    // - Height of the helper pane
    helperPaneHeight?: HelperPaneHeight;
    // - Width of the helper pane
    helperPaneWidth?: number;
    // - Helper pane styles
    helperPaneSx?: CSSProperties;
    // - Callback function to open/close the helper pane
    changeHelperPaneState: (isOpen: boolean) => void;
    // - Get the helper panel component
    getHelperPane: (
        value: string,
        onChange: (value: string, updatedCursorPosition: number) => void,
        helperPaneHeight: HelperPaneHeight
    ) => ReactNode;
    // - Get a custom icon for the expression editor
    getExpressionEditorIcon?: () => ReactNode;
} | {
    isHelperPaneOpen?: never;
    helperPaneOrigin?: never;
    helperPaneHeight?: never;
    helperPaneWidth?: never;
    helperPaneSx?: never;
    changeHelperPaneState?: never;
    getHelperPane?: never;
    getExpressionEditorIcon?: never;
}

type FormExpressionEditorElBaseProps = ExpressionEditorProps & HelperPaneConditionalProps & {
    anchorRef?: MutableRefObject<HTMLDivElement>;
    resize?: 'vertical' | 'disabled';
    growRange?: { start: number, offset: number };
    actionButtons?: ActionButtonType[];
}

export type FormExpressionEditorElProps = FormExpressionEditorElBaseProps & {
    containerRef: MutableRefObject<HTMLDivElement>;
}

export type FormExpressionEditorProps = FormExpressionEditorElBaseProps & {
    startAdornment?: ReactNode;
    endAdornment?: ReactNode;
    ariaLabel?: string;
    expressionEditorIconName?: string;
    enableExIcon?: boolean;
    codeActions?: ReactNode[];
};

export type FormExpressionEditorRef = ExpressionEditorRef & {
    focus: (manualTrigger?: boolean) => void;
    inputElement: HTMLTextAreaElement;
    parentElement: HTMLElement;
    setCursor: (value: string, cursorPosition: number) => void;
};
