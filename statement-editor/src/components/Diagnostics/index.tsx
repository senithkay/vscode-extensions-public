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
import React, { useContext } from "react";

import { getDiagnosticMessage } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { StatementEditorContext } from "../../store/statement-editor-context";

export function Diagnostics() {
    const stmtCtx = useContext(StatementEditorContext);
    const {
        modelCtx: {
            statementModel
        },
        statementCtx: {
            diagnostics
        },
        formCtx: {
            formModelPosition: targetPosition
        }
    } = stmtCtx;

    const message = getDiagnosticMessage(
        diagnostics,
        {
            startLine: targetPosition.startLine || 0,
            startColumn: targetPosition.startColumn || 0,
            endLine: targetPosition?.endLine || targetPosition.startLine,
            endColumn: targetPosition?.endColumn || 0
        },
        0,
        statementModel?.source.length,
        0,
        0
    );

    return (
        <span>{message}</span>
    )
}
