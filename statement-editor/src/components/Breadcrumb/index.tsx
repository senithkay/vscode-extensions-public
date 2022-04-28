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
import React, { useContext } from 'react';

import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Link from '@material-ui/core/Link';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';

import { StmtEditorStackItem } from "../../models/definitions";
import { StatementEditorContext } from "../../store/statement-editor-context";
import { StatementEditorWrapperContext } from "../../store/statement-editor-wrapper-context";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            '& > * + *': {
                marginTop: theme.spacing(2),
            },
        },
    }),
);

export default function Breadcrumb() {
    const classes = useStyles();
    const {
        editorCtx: {
            editors,
            switchEditor,
            updateEditor,
            activeEditorId
        }
    } = useContext(StatementEditorWrapperContext);
    const {
        modelCtx: {
            statementModel
        }
    } = useContext(StatementEditorContext);

    function handleClick(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
        event.preventDefault();
        const index: number = +event.currentTarget.getAttribute('data-index');
        updateEditor(activeEditorId, { ...editors[activeEditorId], source: statementModel.source })
        switchEditor(index);
    }

    return (
        <div className={classes.root}>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
                { editors.map((editor: StmtEditorStackItem, index: number) => {
                    return (index === activeEditorId)
                        ? (
                            <Typography color="textPrimary">{editor.label}</Typography>
                        )
                        : (
                            <Link data-index={index} color="inherit" href="/" onClick={handleClick}>
                                {editor.label}
                            </Link>
                        )
                })}
            </Breadcrumbs>
        </div>
    );
}
