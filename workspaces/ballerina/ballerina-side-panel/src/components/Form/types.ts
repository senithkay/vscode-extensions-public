/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { DiagnosticMessage } from "@wso2-enterprise/ballerina-core";

export type FormValues = {
    [key: string]: any;
};

export type FormField = {
    key: string;
    label: string;
    type: null | string;
    optional: boolean;
    advanced?: boolean;
    editable: boolean;
    documentation: string;
    value: string;
    diagnostics?: DiagnosticMessage[];
    items?: string[];
};

export type ExpressionFormField = {
    key: string;
    value: string;
    cursorPosition: number;
    isConfigured?: boolean
};
