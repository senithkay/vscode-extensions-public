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
import React, { useContext } from "react";

import { List, ListItemText, Typography } from "@material-ui/core";

import { StmtDiagnostic } from "../../models/definitions";
import { StatementEditorContext } from "../../store/statement-editor-context";
import { useStatementEditorDiagnosticStyles } from "../styles";
import DiagnosticsErrorIcon from "../../assets/icons/DiagnosticsErrorIcon";

export function Diagnostics() {
    const statementEditorDiagnosticClasses = useStatementEditorDiagnosticStyles();
    const stmtCtx = useContext(StatementEditorContext);
    const {
        statementCtx: {
            diagnostics
        }
    } = stmtCtx;

    return (
        <div className={statementEditorDiagnosticClasses.diagnosticsPane}>
            <List>
                {
                    diagnostics && diagnostics.map((diag: StmtDiagnostic, index: number) => (
                        !diag.isPlaceHolderDiag && (
                            <ListItemText
                                key={index}
                                primary={(
                                    <Typography style={{ display: 'flex', flexDirection: 'row' }}> 
                                        <div className={statementEditorDiagnosticClasses.diagnosticsErrorIcon}>
                                            <DiagnosticsErrorIcon />
                                        </div>
                                        {diag.message}
                                    </Typography>
                                )}
                            />
                        )
                    ))
                }
            </List>
        </div>
    )
}
