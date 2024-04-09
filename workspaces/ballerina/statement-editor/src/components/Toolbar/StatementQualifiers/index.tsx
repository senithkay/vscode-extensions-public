/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js jsx-no-lambda no-empty
import React, { useContext, useEffect } from "react";

import { VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react";
import { STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import { Button, Codicon, Menu, MenuItem, Typography } from "@wso2-enterprise/ui-toolkit";

import { StatementEditorContext } from "../../../store/statement-editor-context";
import {
    getFilteredQualifiers,
    getQualifierPosition,
    getQualifierUpdateModelPosition,
    getSupportedQualifiers
} from "../../../utils";
import { useStatementEditorToolbarStyles } from "../../styles";

export default function StatementQualifiers() {
    const {
        modelCtx: {
            statementModel,
            updateModel,
        }
    } = useContext(StatementEditorContext);

    const statementEditorClasses = useStatementEditorToolbarStyles();

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [supportedQualifiers, setSupportedQualifiers] = React.useState([]);
    const [checked, setChecked] = React.useState([]);


    const open = Boolean(anchorEl);

    useEffect(() => {
        const newChecked: string[] = [];
        // check if the qualifiers are checked
        if (statementModel?.visibilityQualifier) {
            newChecked.push(statementModel.visibilityQualifier.value)
        } else if (statementModel?.finalKeyword) {
            newChecked.push(statementModel.finalKeyword.value)
        }
        if (statementModel?.qualifiers) {
            statementModel.qualifiers.map((qualifier: STNode) => {
                newChecked.push(qualifier.value)
            });
        }
        let qualifierList = getSupportedQualifiers(statementModel);
        if (STKindChecker.isModuleVarDecl(statementModel)) {
            qualifierList = getFilteredQualifiers(statementModel, qualifierList, newChecked);
        }
        setSupportedQualifiers(qualifierList);
        setChecked(newChecked);
    }, [statementModel]);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleCheckboxClick = (qualifier: string) => () => {
        const currentIndex = checked.indexOf(qualifier);
        if (currentIndex === -1) {
            updateModel(` ${qualifier} `, getQualifierUpdateModelPosition(statementModel, qualifier));
        } else {
            updateModel(``, getQualifierPosition(statementModel, qualifier));
        }

    }

    return (
        <>
            <Button
                onClick={handleClick}
                data-testid="toolbar-qualifier-options"
                className={statementEditorClasses.toolbarIcons}
                tooltip="Visibility"
            >
                <Codicon sx={{ color: "var(--vscode-editorGutter-deletedBackground)" }} name="globe" />
                <Codicon sx={{ color: "var(--vscode-editorGutter-deletedBackground)" }} name="chevron-down" />
            </ Button>
            <Menu>
                {supportedQualifiers.map((qualifier, key) => (
                    <MenuItem
                        key={key}
                        data-testid="qualifier-list-item"
                        item={{
                            id: key,
                            label: (
                                <>
                                    <Typography variant="body2">
                                        {qualifier}
                                    </Typography>
                                    <VSCodeCheckbox
                                        data-testid="qualifier-check"
                                        checked={checked.includes(qualifier)}
                                        onChange={handleCheckboxClick(qualifier)}
                                    />
                                </>
                            ),
                            onClick: () => {},
                        }}
                    />
                ))}
            </Menu>
        </>
    );
}
