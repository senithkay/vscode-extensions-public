/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React, { useContext, useEffect, useState } from "react";

import { Divider, IconButton, Menu, MenuItem } from "@material-ui/core";
import { NodePosition } from "@wso2-enterprise/ballerina-languageclient";
import { CodeAction, TextDocumentEdit, TextEdit } from "vscode-languageserver-protocol";

import CodeActionIcon from "../../assets/icons/CodeActionIcon";
import { StatementSyntaxDiagnostics } from "../../models/definitions";
import { StatementEditorContext } from "../../store/statement-editor-context";
import { filterCodeActions, getContentFromSource, getStatementLine, getUpdatedSource } from "../../utils";

import { useStyles } from "./style";

export interface CodeActionButtonProps {
    syntaxDiagnostic: StatementSyntaxDiagnostics;
}

export function CodeActionButton(props: CodeActionButtonProps) {
    const { syntaxDiagnostic } = props;

    const classes = useStyles();

    const stmtCtx = useContext(StatementEditorContext);
    const {
        currentFile,
        modelCtx: { statementModel, updateStatementModel },
    } = stmtCtx;

    const [updatedSource, setUpdatedSource] = useState(currentFile.draftSource);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLButtonElement>(null);

    const codeActions = filterCodeActions(syntaxDiagnostic.codeActions);
    const open = Boolean(anchorEl);
    const actionMenuItems: React.ReactNode[] = [];

    useEffect(() => {
        setUpdatedSource(currentFile.draftSource);
    }, [currentFile.draftSource]);

    if (codeActions) {
        codeActions.reverse();
        codeActions.forEach((action, index) => {
            const onSelectCodeAction = () => {
                applyCodeAction(action);
            };
            actionMenuItems.push(
                <MenuItem key={index} onClick={onSelectCodeAction}>
                    {action.title}
                </MenuItem>
            );
        });
    }

    const onClickCodeAction = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const onCloseCodeActionMenu = () => {
        setAnchorEl(null);
    };

    const applyCodeAction = async (action: CodeAction) => {
        const editorActiveStatement = getContentFromSource(updatedSource, currentFile.draftPosition);
        const editorActivePosition = { ...currentFile.draftPosition };
        let currentSource = updatedSource;

        if (!(editorActivePosition.endLine || editorActivePosition.endLine === 0)) {
            editorActivePosition.endLine =
                statementModel.position.endLine - statementModel.position.startLine + editorActivePosition.startLine;
        }

        (action.edit?.documentChanges[0] as TextDocumentEdit).edits.reverse().forEach(async (change: TextEdit) => {
            let changingPosition: NodePosition;
            if (change.newText.indexOf("\n") !== 0) {
                changingPosition = {
                    endColumn: change.range.end.character,
                    endLine: change.range.end.line,
                    startColumn: change.range.start.character,
                    startLine: change.range.start.line,
                };
            } else {
                // statement with a new line
                changingPosition = {
                    startColumn: 0,
                    startLine: change.range.start.line + 1,
                };
            }

            currentSource = getUpdatedSource(change.newText, currentSource, changingPosition, undefined, true, false);
            if (changingPosition.startLine < editorActivePosition.startLine) {
                const newLine = getStatementLine(currentSource, editorActiveStatement);
                editorActivePosition.startLine = newLine;
                editorActivePosition.endLine += newLine - editorActivePosition.startLine;
            }
        });

        const changedActiveContent = getContentFromSource(currentSource, editorActivePosition);
        editorActivePosition.endColumn = currentFile.draftPosition.startColumn + changedActiveContent.length;

        // TODO: add loader while changing source
        await updateStatementModel(changedActiveContent, currentSource, editorActivePosition);
        setUpdatedSource(currentSource);
        setAnchorEl(null);
    };

    return (
        <div className={classes.container} data-testid="code-action-btn">
            <IconButton className={classes.iconButton} onClick={onClickCodeAction}>
                <CodeActionIcon />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={onCloseCodeActionMenu}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                className={classes.menu}
            >
                {actionMenuItems}
            </Menu>
        </div>
    );
}
