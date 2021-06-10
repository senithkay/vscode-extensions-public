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
// tslint:disable: jsx-wrap-multiline jsx-no-multiline-js jsx-no-lambda

import React, { useContext, useEffect, useState } from "react";

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { GreyButton } from "components/Buttons/GreyButton";
import { PrimaryButtonSquare } from "components/Buttons/PrimaryButtonSquare";
import { CodeAction, CodeActionParams, TextDocumentEdit } from "monaco-languageclient";

import { Context } from "../../../../Contexts/Diagram";

import { useStyles } from "./style";

export function ErrorList() {
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [codeActions, setCodeActions] = useState([]);
    const [visibleActions, setVisibleActions] = useState([]);
    const open = Boolean(anchorEl);

    const { state: {
        diagnostics,
        handleRightPanelContent,
        setCodeLocationToHighlight: setCodeToHighlight,
        maximize: maximizeCodeView,
        currentApp,
        langServerURL,
        currentFile,
        getDiagramEditorLangClient,
        dispatchFileChange,
        dispatchCodeChangeCommit,
        appInfo : { isCodeChangeInProgress, isWaitingOnWorkspace },
        isCodeEditorActive,
        isReadOnly,
    } } = useContext(Context);
    const { id: appId } = currentApp || {};

    const onJumpToCodeClick = (range: any) => {
        maximizeCodeView("home", "vertical", appId);
        handleRightPanelContent('Code');
        setCodeToHighlight({
            endColumn: range.end.character,
            endLine: range.end.line,
            startColumn: range.start.character,
            startLine: range.start.line,
        })
    }

    useEffect(() => {
        setCodeActions([])
        getDiagramEditorLangClient(langServerURL).then(async (langClient: any) => {
            const actionsArr = [];
            for (const diagnostic of diagnostics){
                const params: CodeActionParams = {
                    context: {
                        diagnostics: [{
                            code: diagnostic.code,
                            message: diagnostic.message,
                            range: diagnostic.range,
                            severity: diagnostic.severity
                        }],
                        only: ["quickfix"]
                    },
                    range: diagnostic.range,
                    textDocument: {
                        uri: `file://${currentApp.workingFile}`
                    }
                }
                const action = await langClient.codeAction(params);
                actionsArr.push(action.filter((actionItem: CodeAction) => actionItem.kind === 'quickfix'))
            }
            setCodeActions(actionsArr)
        })
    }, [JSON.stringify(diagnostics)])

    const onActionClick = (event: React.MouseEvent<HTMLElement>, actions: CodeAction[]) => {
        if (Array.isArray(actions) && actions.length > 1){
            setAnchorEl(event.currentTarget);
            setVisibleActions(actions)
        }else{
            setAnchorEl(null);
            const action = actions[0];

            const uri = monaco.Uri.file(`file://${currentApp.workingFile}`)
            let monacoModel = monaco.editor.getModel(uri);
            if (!monacoModel){
                monacoModel = monaco.editor.createModel(atob(currentFile.content), "ballerina", uri)
            }

            monacoModel.setValue(atob(currentFile.content))
            for (const docChange of action.edit.documentChanges){
                const docEdit = docChange as TextDocumentEdit;
                if (docEdit.edits){
                    monacoModel.applyEdits(docEdit.edits.map(({range: {start, end}, newText: text}) => {
                        const range: any = {
                            startLineNumber: start.line + 1,
                            startColumn: start.character + 1,
                            endLineNumber: end.line + 1,
                            endColumn: end.character + 1,
                        };
                        return {range,  text};
                    }));
                }
            }
            const updatedModelValue = monacoModel.getValue();

            // Dispatch file change first and pass code change commit as a callback
            dispatchFileChange(btoa(updatedModelValue), dispatchCodeChangeCommit);
        }
    };

    const onPopOverClose = () => {
        setAnchorEl(null);
    };

    return (
        <div className={classes.diagramErrorMessageWrapper} >
                {diagnostics.map((item: any, index: number) => <>
                    <div className={classes.diagramErrorMessageItem}>
                        <div className={classes.diagramErrorMessageText}>{item.message}</div>
                        {codeActions[index] && codeActions[index].length > 0 && !isReadOnly && !isWaitingOnWorkspace &&
                            <PrimaryButtonSquare
                                onClick={(event) => onActionClick(event, codeActions[index])}
                                text={codeActions[index].length > 1 ? 'Quick Fix' : codeActions[index][0].title}
                                className={classes.diagramErrorMessageButton}
                                disabled={isCodeEditorActive || isCodeChangeInProgress}
                                endIcon={codeActions[index].length > 1 ? <KeyboardArrowDownIcon className={classes.downArrowIcon} /> : null}
                            />
                        }

                        <Menu
                            anchorEl={anchorEl}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right'}}
                            transformOrigin={{ vertical: 'top', horizontal: 'right'}}
                            open={open && !isCodeChangeInProgress}
                            onClose={onPopOverClose}
                            classes={{paper: classes.menuPaper}}
                        >
                        {visibleActions && visibleActions.map((action, actionIndex) =>
                            <MenuItem
                                key={`${actionIndex}`}
                                onClick={(event) => onActionClick(event, [action])}
                                disableRipple={true}
                            >
                                <Typography component="div" >{action.title}</Typography>
                            </MenuItem>
                        )}
                        </Menu>

                        <GreyButton
                            onClick={() => onJumpToCodeClick(item.range)}
                            variant="contained"
                            className={classes.diagramErrorMessageGreyButton}
                            text='Jump to code'
                            disabled={isCodeEditorActive || isCodeChangeInProgress}
                        />
                        {/* <CloseIcon className={classes.closeIcon}/> */}
                    </div>
                    {index + 1 !== diagnostics.length && <div className={classes.diagramErrorItemDivider}/>}
                </>)}
            </div>
    );
}
