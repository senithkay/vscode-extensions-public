/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React from "react";

import { CloseRounded } from "@material-ui/icons";
import { ButtonWithIcon } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { FunctionParam } from "../types";

import { useStyles } from './style';

interface FunctionParamItemProps {
    functionParam: FunctionParam;
    addInProgress: boolean;
    onDelete?: (functionParam: FunctionParam) => void;
    onEditClick?: (functionParam: FunctionParam) => void;
}

export function FunctionParamItem(props: FunctionParamItemProps) {
    const { functionParam, addInProgress, onDelete, onEditClick } = props;
    const classes = useStyles();

    const segmentLabel = functionParam.type + " " + functionParam.name;
    const handleDelete = () => {
        onDelete(functionParam);
    };
    const handleEdit = () => {
        onEditClick(functionParam);
    };
    return (
        <div className={classes.headerWrapper}>
            <div className={classes.headerLabel}>
                <div className={classes.headerLabelCursor} onClick={handleEdit}>
                    {segmentLabel}
                </div>
                <ButtonWithIcon
                    onClick={handleDelete}
                    icon={<CloseRounded fontSize="small" />}
                    className={classes.iconBtn}
                />
            </div>
        </div>
    );
}
