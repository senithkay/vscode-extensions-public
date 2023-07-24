/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";

import { Box, FormLabel, ThemeProvider, Tooltip, Typography } from "@material-ui/core";

import { InfoIcon } from "../../../assets/icons";
import Chip from "../../ChoreoSystem/Chip/Chip";
import { ConfigType } from "../../model";
import { useStyles } from "../../style";

import { theme } from "./style";

export interface FieldLabelProps {
    name: string;
    type: string;
    shortenedType: string;
    description: string;
    label?: string;
    required?: boolean;
}

export function FieldLabel(props: FieldLabelProps) {
    const { name, type, shortenedType, description, label, required } = props;
    const classes = useStyles();

    const fieldLabel: string = (label !== undefined) ? label : name;

    return (
        <Box className={classes.labelCont}>
            <Box className={classes.mainLabel}>
                <FormLabel
                    component="div"
                    className={classes.mainLabelText}
                >
                    {fieldLabel}
                </FormLabel>
                <Box display="flex" alignItems="center">
                    <Tooltip title={type === ConfigType.NUMBER ? ConfigType.FLOAT : type}>
                        <Chip
                            size="small"
                            variant="outlined"
                            color="success"
                            label={shortenedType === ConfigType.NUMBER ? ConfigType.FLOAT : shortenedType}
                        />
                    </Tooltip>
                </Box>
                {getDescription(description, classes)}
            </Box>
        </Box>
    );
}

export const getDescription = (description: string, classes: ReturnType<typeof useStyles>) => {
    if (description) {
        return (
            <Tooltip title={description} placement="right-start">
                <Box className={classes.descriptionLabel}>
                    <InfoIcon />
                </Box>
            </Tooltip>
        );
    }
};
