/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-lambda jsx-no-multiline-js
import React, { FC, useState } from "react";

import { Button, Codicon, Icon, Popover, Tooltip } from "@wso2-enterprise/ui-toolkit";

import { getBalRecFieldName } from "../../../utils/dm-utils";

import { useStyles } from "./styles";

interface Props {
    indentation: number;
    addNewField: (fieldName: string) => void;
    existingFieldNames: string[];
    fieldId?: string;
}

export const AddRecordFieldButton: FC<Props> = ({
    indentation,
    addNewField,
    existingFieldNames,
    fieldId
}) => {
    const [popoverAnchorEl, setPopoverAnchorEl] = useState(null);
    const [newFieldName, setNewFieldName] = useState("");
    const classes = useStyles();
    const isError = existingFieldNames.includes(getBalRecFieldName(newFieldName));

    const handleClose = () => {
        setNewFieldName("");
        setPopoverAnchorEl(null);
    };

    const onNewFieldNameKeyUp = async (key: string) => {
        if (key === "Escape") {
            handleClose();
        }
        if (key === "Enter" && !isError) {
            addField(newFieldName);
        }
    };

    const addField = (fieldName: string) => {
        if (newFieldName) {
            addNewField(getBalRecFieldName(fieldName));
        }
        handleClose();
    };

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setPopoverAnchorEl(event.currentTarget);
    };

    const open = Boolean(popoverAnchorEl);
    const id = open ? "simple-popover" : undefined;

    return (
        <div className={classes.addFieldWrap} style={{ paddingLeft: indentation }}>
            <Button
                appearance="icon"
                data-testid={`add-new-field-${fieldId}`}
                aria-label="add"
                onClick={handleClick}
            >
                <Codicon name="add" />
                Add Field
            </Button>
            <Popover
                id={id}
                open={open}
                anchorEl={popoverAnchorEl}
            >
                <input
                    spellCheck={false}
                    className={classes.input}
                    autoFocus={true}
                    value={newFieldName}
                    onChange={(event) => setNewFieldName(event.target.value)}
                    onKeyUp={(event) => onNewFieldNameKeyUp(event.key)}
                    placeholder="New field name"
                    data-testid={`new-field-name`}
                />
                {newFieldName && (
                    <>
                        {isError && (
                            <Tooltip
                                content={`Field name ${newFieldName} already exists`}
                            >
                                <Icon name="error-outline" iconSx={{ color: "var(--vscode-errorForeground)" }} />
                            </Tooltip>
                        )}
                        {!isError && (
                            <Button appearance="icon" onClick={() => addField(newFieldName)}>
                                <Codicon name="pass" />
                            </Button>
                        )}
                    </>
                )}
            </Popover>
        </div>
    );
};
