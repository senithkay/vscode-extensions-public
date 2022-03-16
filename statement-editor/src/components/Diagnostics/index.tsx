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
import { getDiagnosticMessage } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition } from "@wso2-enterprise/syntax-tree";

import { StatementEditorContext } from "../../store/statement-editor-context";
import { INPUT_EDITOR_PLACE_HOLDERS } from "../InputEditor/constants";
import { useStatementEditorStyles } from "../styles";

export function Diagnostics() {
    const statementEditorClasses = useStatementEditorStyles();
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

    const hasPlaceHolders = Array.from(INPUT_EDITOR_PLACE_HOLDERS.keys()).some(word =>
        statementModel?.source.includes(word)
    );

    const diagnosticTargetPosition: NodePosition = {
        startLine: targetPosition.startLine || 0,
        startColumn: targetPosition.startColumn || 0,
        endLine: targetPosition?.endLine || targetPosition.startLine,
        endColumn: targetPosition?.endColumn || 0
    };

    const messages = !hasPlaceHolders &&
        getDiagnosticMessage(diagnostics, diagnosticTargetPosition, 0, statementModel?.source.length, 0, 0).split('.');

    return (
        <div className={statementEditorClasses.diagnosticsPane}>
            <List>
                {
                    messages && messages.map((msg: string, index: number) => (
                        <ListItemText
                            key={index}
                            primary={(
                                <Typography>{msg}</Typography>
                            )}
                        />
                    ))
                }
            </List>
        </div>
    )
}
