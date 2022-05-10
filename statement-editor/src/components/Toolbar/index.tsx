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

import IconButton from "@material-ui/core/IconButton";

import ToolbarDeleteIcon from "../../assets/icons/ToolbarDeleteIcon";
import ToolbarRedoIcon from "../../assets/icons/ToolbarRedoIcon";
import ToolbarUndoIcon from "../../assets/icons/ToolbarUndoIcon";
import { CurrentModel } from "../../models/definitions";
import { StatementEditorContext } from "../../store/statement-editor-context";
import { getRemainingContent } from "../../utils";
import { KeyboardNavigationManager } from "../../utils/keyboard-navigation-manager";
import { StatementEditorViewState } from "../../utils/statement-editor-viewstate";
import { INPUT_EDITOR_PLACE_HOLDERS } from "../InputEditor/constants";
import { useStatementEditorStyles } from "../styles";

export default function Toolbar(){
    const statementEditorClasses = useStatementEditorStyles();
    const { modelCtx} = useContext(StatementEditorContext);
    const { undo, redo, hasRedo, hasUndo, statementModel: completeModel, updateModel, currentModel } = modelCtx;

    const keyboardNavigationManager = new KeyboardNavigationManager()
    React.useEffect(() => {
        const client = keyboardNavigationManager.getClient();
        keyboardNavigationManager.bindNewKey(client, ['command+z', 'ctrl+z'], undo);
        keyboardNavigationManager.bindNewKey(client, ['command+shift+z', 'ctrl+shift+z'], redo)
        keyboardNavigationManager.bindNewKey(client, ['del'], onDelFunction)

        return () => {
            keyboardNavigationManager.resetMouseTrapInstance(client)
        }
    }, [currentModel]);

    const isExprDeletable = (): boolean => {
        if (currentModel.model){
            const stmtViewState: StatementEditorViewState = currentModel.model.viewState as StatementEditorViewState;
            let exprDeletable = !stmtViewState.exprNotDeletable;
            if (currentModel.model.source && INPUT_EDITOR_PLACE_HOLDERS.has(currentModel.model.source.trim())) {
                exprDeletable =  stmtViewState.templateExprDeletable;
            } else if (currentModel.model.value && INPUT_EDITOR_PLACE_HOLDERS.has(currentModel.model.value.trim())) {
                exprDeletable =  stmtViewState.templateExprDeletable;
            }
            return exprDeletable;
        }
    }

    const onDelFunction = () => {
        if (!!currentModel.model && isExprDeletable()){
            onClickOnDelete();
        }
    }

    const onClickOnDelete = () => {
        const {
            code: newCode,
            position: newPosition
        } = getRemainingContent(currentModel.model.position, completeModel);
        updateModel(newCode, newPosition);
    }

    return(
        <span className={statementEditorClasses.toolbar}>
            <IconButton
                onClick={undo}
                disabled={!hasUndo}
                className={statementEditorClasses.toolbarIcons}
                style={{marginLeft: '14px', marginRight: '7px'}}
            >
                 <ToolbarUndoIcon/>
            </IconButton>
            <IconButton
                onClick={redo}
                disabled={!hasRedo}
                className={statementEditorClasses.toolbarIcons}
                style={{marginRight: '7px'}}
            >
                <ToolbarRedoIcon />
            </IconButton>
            {currentModel.model && isExprDeletable() ? (
                <IconButton
                    onClick={onClickOnDelete}
                    style={{color: '#FE523C', marginRight: '14px'}}
                    className={statementEditorClasses.toolbarIcons}
                >
                    <ToolbarDeleteIcon/>
                </IconButton>
            ) : (
                <IconButton
                    disabled={true}
                    style={{color: '#8D91A3', marginRight: '14px'}}
                    className={statementEditorClasses.toolbarIcons}
                >
                    <ToolbarDeleteIcon/>
                </IconButton>
            )}
        </span>
    );
}
