/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */
// tslint:disable: jsx-no-lambda jsx-no-multiline-js
import React, { FC, useState } from "react";

import { Button, IconButton, Popover, Tooltip } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import CheckIcon from "@material-ui/icons/CheckCircleOutline";
import ErrorIcon from "@material-ui/icons/ErrorOutline";

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
                data-testid={`add-new-field-${fieldId}`}
                aria-label="add"
                className={classes.addIcon}
                onClick={handleClick}
                startIcon={<AddIcon />}
            >
                Add Field
            </Button>
            <Popover
                id={id}
                open={open}
                anchorEl={popoverAnchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: "center",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "center",
                    horizontal: "center",
                }}
                classes={{ paper: classes.popoverRoot }}
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
                                classes={{ tooltip: classes.tooltip }}
                                title={`Field name ${newFieldName} already exists`}
                                color=""
                            >
                                <ErrorIcon className={classes.errorIcon} />
                            </Tooltip>
                        )}
                        {!isError && (
                            <IconButton onClick={() => addField(newFieldName)} size="small">
                                <CheckIcon className={classes.tickIcon} />
                            </IconButton>
                        )}
                    </>
                )}
            </Popover>
        </div>
    );
};
