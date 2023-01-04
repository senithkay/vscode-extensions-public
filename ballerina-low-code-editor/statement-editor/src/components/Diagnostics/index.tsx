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
// tslint:disable: jsx-no-multiline-js

import React, { useContext, useState } from "react";

import { Box, List, ListItemText, Typography } from "@material-ui/core";

import DiagnosticsErrorIcon from "../../assets/icons/DiagnosticsErrorIcon";
import { StatementSyntaxDiagnostics } from "../../models/definitions";
import { StatementEditorContext } from "../../store/statement-editor-context";
import { filterCodeActions } from "../../utils";
import { CodeActionButton } from "../CodeActionButton";
import { useStatementEditorDiagnosticStyles } from "../styles";

export function Diagnostics() {
    const statementEditorDiagnosticClasses = useStatementEditorDiagnosticStyles();
    const stmtCtx = useContext(StatementEditorContext);
    const {
        statementCtx: { diagnostics, errorMsg },
    } = stmtCtx;
    let hasCodeAction = false;

    function actionButton(diag: StatementSyntaxDiagnostics, key?: number) {
        if (filterCodeActions(diag.codeActions).length > 0) {
            hasCodeAction = true;
            return <CodeActionButton syntaxDiagnostic={diag} index={key}/>;
        } else if (hasCodeAction) {
            return <Box style={{ width: "30px", marginRight: "6px" }} />;
        }
    }

    return (
        <div className={statementEditorDiagnosticClasses.diagnosticsPane} data-testid="diagnostics-pane">
            <List>
                {diagnostics &&
                    diagnostics.map(
                        (diag: StatementSyntaxDiagnostics, index: number) =>
                            !diag.isPlaceHolderDiag && (
                                <ListItemText
                                    data-testid="diagnostic-message"
                                    key={index}
                                    primary={(
                                        <Typography style={{ display: "flex", flexDirection: "row" }}>
                                            {actionButton(diag, index)}
                                            <div className={statementEditorDiagnosticClasses.diagnosticsErrorIcon}>
                                                <DiagnosticsErrorIcon />
                                            </div>
                                            {diag.message}
                                        </Typography>
                                    )}
                                />
                            )
                    )}
                {errorMsg && errorMsg.length > 0 && (
                    <ListItemText
                        data-testid="error-message"
                        key="error"
                        primary={<Typography style={{ display: "flex", flexDirection: "row" }}>{errorMsg}</Typography>}
                    />
                )}
            </List>
        </div>
    );
}
