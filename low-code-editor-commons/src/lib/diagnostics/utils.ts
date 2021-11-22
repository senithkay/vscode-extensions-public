/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import {  Diagnostic } from "vscode-languageserver-protocol";

import { DOUBLE_QUOTE_ERR_CODE, IGNORED_DIAGNOSTIC_MESSAGES, UNDEFINED_SYMBOL_ERR_CODE } from "./constants";


export function getSelectedDiagnostics(diagnostics: Diagnostic[], varType: string): Diagnostic {
    if (varType === 'string') {
        const quotesError = diagnostics.find((diagnostic) => diagnostic.code === DOUBLE_QUOTE_ERR_CODE);
        const undefSymbolError = diagnostics.find((diagnostic) => diagnostic.code === UNDEFINED_SYMBOL_ERR_CODE);
        return quotesError ? quotesError : undefSymbolError ? undefSymbolError : diagnostics[0];
    } else {
        return diagnostics[0];
    }
}


export function getDiagnosticMessage(diagnostics: Diagnostic[], varType: string): string {
    return getSelectedDiagnostics(diagnostics, varType)?.message;
}

export function getFilteredDiagnostics(diagnostics: Diagnostic[], isCustomStatement: boolean) {
    return diagnostics
        .filter(diagnostic =>
            !IGNORED_DIAGNOSTIC_MESSAGES.includes(diagnostic.message.toString()) && diagnostic.severity === 1);
}
