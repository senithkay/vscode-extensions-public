/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import { Chip } from "@material-ui/core";

import { useStyles } from "./style";

interface OutlinedLabelProps {
    type: "success" | "warning" | "info" | "primary" | "default";
    label: string;
    isLink?: boolean;
    shape?: "square" | "round";
}

const OutlinedLabel = ({ type, label, isLink, shape }: OutlinedLabelProps) => {
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
            chipColor = "#636363";
            break;
        default:
            chipColor = "#5567D5";
    }

    return (
        <Chip
            size="small"
            label={label}
            variant="outlined"
            classes={{root: classes.chipRoot, label: classes.chiplabel}}
            style={{borderColor: chipColor, borderRadius: shape === "square" ? 3 : 10, 
                    color: chipColor, cursor, marginLeft: 5}}
        />
    );
};
export default OutlinedLabel;

OutlinedLabel.defaultProps = {
    isLink: false,
    shape: "round",
};
