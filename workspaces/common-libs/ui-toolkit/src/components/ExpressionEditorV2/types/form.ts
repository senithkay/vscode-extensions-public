/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ReactNode } from 'react';
import { ExpressionEditorProps, ExpressionEditorRef } from './common';

type HelperPaneConditionalProps = {
    // - Whether the helper pane is open
    isHelperPaneOpen: boolean;
    // - Callback function to toggle the helper pane
    toggleHelperPane: () => void;
    // - Get the helper panel component
    getHelperPane: () => ReactNode;
    // - Get a custom icon for the expression editor
    getExpressionEditorIcon?: () => ReactNode;  
} | {
    isHelperPaneOpen?: never;
    toggleHelperPane?: never;
    getHelperPane?: never;
    getExpressionEditorIcon?: never;
}

export type FormExpressionEditorProps = ExpressionEditorProps & HelperPaneConditionalProps;

export type FormExpressionEditorRef = ExpressionEditorRef & {
    inputElement: HTMLTextAreaElement;
};
