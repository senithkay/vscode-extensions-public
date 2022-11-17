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
// tslint:disable: jsx-no-multiline-js jsx-no-lambda
import React, { useContext, useEffect } from "react";

import { Checkbox, IconButton, ListItem, ListItemText, Menu } from "@material-ui/core";
import { StatementEditorHint } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";

import ToolbarDropdownArrow from "../../../assets/icons/ToolbarDropdownArrow";
import ToolbarQualifierIcon from "../../../assets/icons/ToolbarQualifierIcon";
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
            <StatementEditorHint content={"Statement-qualifiers"}>
                <IconButton
                    onClick={handleClick}
                    data-testid="toolbar-qualifier-options"
                    aria-controls={open ? 'qualifier-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    className={statementEditorClasses.toolbarIcons}
                >
                    <ToolbarQualifierIcon/>
                    <ToolbarDropdownArrow/>
                </IconButton>
            </StatementEditorHint>
            <Menu
                elevation={0}
                anchorEl={anchorEl}
                getContentAnchorEl={null}
                id="qualifier-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                className={statementEditorClasses.QualifierDropdownBase}
            >
                {supportedQualifiers.map((qualifier, key) => (
                    <ListItem
                        key={key}
                        data-testid="qualifier-list-item"
                        className={statementEditorClasses.qualifierListItem}
                    >
                        <ListItemText
                            primary={qualifier}
                        />
                        <Checkbox
                            classes={{
                                root: statementEditorClasses.QualifierCheckbox,
                                checked: statementEditorClasses.checked
                            }}
                            edge={"end"}
                            data-testid="qualifier-check"
                            checked={checked.includes(qualifier)}
                            onClick={handleCheckboxClick(qualifier)}
                        />
                    </ListItem>
                ))}
            </Menu>
        </>
    );
}
