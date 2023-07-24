/**
 * Copyright (c) 2021, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from "react";

import { Chip, Tooltip } from "@material-ui/core";

import { useStyles } from "./style";

interface OutlinedLabelProps {
    type: "success" | "warning" | "info" | "primary" | "default";
    label: string;
    tooltipText: string;
    isLink?: boolean;
    shape?: "square" | "round" | "none";
}

const OutlinedLabel = ({ type, label, tooltipText, isLink, shape }: OutlinedLabelProps) => {
    const classes = useStyles();
    let chipColor = "#5567D5";
    const cursor = isLink ? "pointer" : "default";
    switch (type) {
        case "primary":
            chipColor = "#5567D5";
            break;
        case "success":
            chipColor = "#36B475";
            break;
        case "warning":
            chipColor = "#ff9d52";
            break;
        case "info":
            chipColor = "#0095FF";
            break;
        case "default":
            chipColor = "#8D91A3";
            break;
        default:
            chipColor = "#5567D5";
    }

    const chipStyles = {
        border: shape === "none" ? "none" : shape,
        borderColor: chipColor,
        borderRadius: shape === "square" ? 3 : 10,
        color: chipColor,
        cursor,
    };

    return (
        <Tooltip title={tooltipText} arrow={true} placement="right-start">
            <Chip
                size="small"
                label={label}
                variant="outlined"
                classes={{root: classes.chipRoot, label: classes.chiplabel}}
                style={chipStyles}
            />
        </Tooltip>
    );
};
export default OutlinedLabel;

OutlinedLabel.defaultProps = {
    isLink: false,
    shape: "round",
};
