/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

import React, { ReactElement, useEffect, useState } from "react";

import { Box, Button, Popover, Typography } from "@material-ui/core";

import { AddInputButton } from "../../elements/AddInputButton";
import ButtonContainer from "../../elements/ButtonContainer";
import { useStyles } from "../../style";

export interface PopOverComponentProps {
    id: string;
    open: boolean;
    anchorEl: HTMLDivElement;
    onClose: () => void;
    onValueAdd?: () => void;
    // handleValueChange: (id: string, value: any) => void;
    returnElement: ReactElement[];
    addArrayElememt?: () => void;
    // addMapField?: () =>void;
}

export function PopOverComponent(props: PopOverComponentProps) {
    const classes = useStyles();
    const { id, open, anchorEl, onClose, onValueAdd, returnElement, addArrayElememt } = props;

    return (
        <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            className={classes.popOver}
        >
            <Box className={classes.popOver}>
                <Box mb={2} mt={1}>
                    <Typography variant="h4">Add Values</Typography>
                </Box>
                {returnElement}
                <div key={props.id + "-ADD"}>
                    <AddInputButton onAdd={addArrayElememt} />
                </div>
                <ButtonContainer justifyContent="flex-end" marginTop={0}>
                    <Button
                        variant="outlined"
                        color="default"
                        size="small"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        // type="submit"
                        onClick={onValueAdd}
                    >
                        Save
                    </Button>
                </ButtonContainer>
            </Box>
        </Popover>
    );
}
export default PopOverComponent;
