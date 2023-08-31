/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useContext } from 'react';

import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';

import { EditorModel } from "../../models/definitions";
import { StatementEditorContext } from "../../store/statement-editor-context";
import { useStatementEditorStyles } from "../styles";

export default function Breadcrumb() {
    const statementEditorClasses = useStatementEditorStyles();
    const {
        modelCtx: {
            statementModel,
            currentModel
        },
        editorCtx: {
            editors,
            switchEditor,
            updateEditor,
            activeEditorId
        }
    } = useContext(StatementEditorContext);

    function handleClick(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
        event.preventDefault();
        const index: number = +event.currentTarget.getAttribute('data-index');
        updateEditor(activeEditorId, {
            ...editors[activeEditorId],
            model: statementModel,
            source: statementModel.source,
            selectedNodePosition: currentModel.model.position
        });
        switchEditor(index);
    }

    return (
        <div className={statementEditorClasses.editorsBreadcrumb}>
            <Breadcrumbs maxItems={3} separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
                { editors.map((editor: EditorModel, index: number) => {
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
