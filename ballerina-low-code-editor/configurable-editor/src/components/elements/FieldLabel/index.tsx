/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React from "react";

import { Box, FormLabel, ThemeProvider, Tooltip, Typography } from "@material-ui/core";
import InfoIcon from "@material-ui/icons/Info";

import { ConfigType } from "../../model";
import { useStyles } from "../../style";
import OutlinedLabel from "../OutlinedLabel";

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
                {getDescription(description, classes)}
                <OutlinedLabel
                    type="success"
                    label={shortenedType === ConfigType.NUMBER ? ConfigType.FLOAT : shortenedType}
                    tooltipText={type === ConfigType.NUMBER ? ConfigType.FLOAT : type}
                    shape="none"
                />
            </Box>
        </Box>
    );
}

export const getDescription = (description: string, classes: ReturnType<typeof useStyles>) => {
    if (description) {
        return (
            <Tooltip title={description} placement="right-start">
                <Box className={classes.descriptionLabel}>
                    <InfoIcon fontSize="inherit" color="primary" />
                </Box>
            </Tooltip>
        );
    }
};
