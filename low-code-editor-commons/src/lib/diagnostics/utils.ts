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
import { NodePosition } from "@wso2-enterprise/syntax-tree";
import {  Diagnostic } from "vscode-languageserver-protocol";

import { IGNORED_DIAGNOSTIC_MESSAGES } from "./constants";

export function getSelectedDiagnostics(
    diagnostics: Diagnostic[],
    targetPosition: NodePosition,
    snippetColumn: number,
    inputLength: number,
    startExtraColumns: number = 0,
    endExtraColumns: number = 0
): Diagnostic[] {
    const { startLine, endLine, startColumn } = targetPosition || {};
    const inputStartCol = startColumn + snippetColumn - startExtraColumns;
    const inputEndCol = startColumn + snippetColumn + inputLength + endExtraColumns - 1;

    const filteredDiagnostics = diagnostics.filter((diagnostic) => {
        const isError = diagnostic.severity === 1;
        const { start, end } = diagnostic.range || {};
        const diagnosticStartCol = start?.character;
        const diagnosticEndCol = end?.character;
        return isError && startLine <= start.line && endLine >= end.line && diagnosticEndCol >= inputStartCol && diagnosticStartCol <= inputEndCol;
    });

    return filteredDiagnostics;
}

export function getDiagnosticMessage(
    diagnostics: Diagnostic[],
    targetPosition: NodePosition,
    snippetColumn: number,
    inputLength: number,
    startExtraColumns: number = 0,
    endExtraColumns: number = 0
): string {
    return getSelectedDiagnostics(diagnostics, targetPosition, snippetColumn, inputLength, startExtraColumns, endExtraColumns)
        .reduce((errArr: string[], diagnostic) => (!errArr.includes(diagnostic.message) ? [...errArr, diagnostic.message] : errArr), [])
        .join(". ");
}

export function getFilteredDiagnostics(diagnostics: Diagnostic[], isCustomStatement: boolean, isStartWithSlash?: boolean) {
    const selectedDiagnostics =  diagnostics
        .filter(diagnostic =>
            !IGNORED_DIAGNOSTIC_MESSAGES.includes(diagnostic.message.toString()) && diagnostic.severity === 1);

    if (selectedDiagnostics.length && isStartWithSlash) {
        if (selectedDiagnostics[0]?.code === "BCE0400") {
            selectedDiagnostics[0].message = "resource path cannot begin with a slash"
        }
    }
    return selectedDiagnostics;
}

