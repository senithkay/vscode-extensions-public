/**
 * Copyright (c) 2021, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { NodePosition } from "@wso2-enterprise/syntax-tree";
import { Diagnostic } from "vscode-languageserver-types";

export function getSelectedDiagnostics(
    diagnostics: Diagnostic[],
    targetPosition: NodePosition,
    snippetColumn: number,
    inputLength: number,
    startExtraColumns: number = 0,
    endExtraColumns: number = 0,
    startExtraRows: number = 0,
    endExtraRows: number = 0,
): Diagnostic[] {
    const { startLine, endLine, startColumn } = targetPosition || {};
    const inputStartCol = startColumn + snippetColumn - startExtraColumns - 1;
    const inputEndCol = startColumn + snippetColumn + inputLength + endExtraColumns - 1;
    const inputStartLine = startLine + startExtraRows;
    const inputEndLine = endLine + endExtraRows;

    const filteredDiagnostics = diagnostics.filter((diagnostic) => {
        const isError = diagnostic.severity === 1;
        const { start, end } = diagnostic.range || {};
        const diagnosticStartCol = start?.character;
        const diagnosticEndCol = end?.character;
        const diagnosticStartLine = start?.line;
        const diagnosticEndLine = end?.line;
        return isError && inputStartLine <= diagnosticStartLine && inputEndLine >= diagnosticEndLine && diagnosticEndCol >= inputStartCol && diagnosticStartCol <= inputEndCol;
    });

    return filteredDiagnostics;
}
