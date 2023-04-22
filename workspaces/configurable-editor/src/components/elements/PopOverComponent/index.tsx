/**
 * Copyright (c) 2022, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
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
