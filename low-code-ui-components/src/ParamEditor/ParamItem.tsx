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
import React from "react";

import { CloseRounded } from "@material-ui/icons";

import { ButtonWithIcon } from "../buttons";

import { useStyles } from './style';

interface ParamItemProps {
    param: { id: number, name: string, type?: string, option?: string };
    addInProgress: boolean;
    onDelete?: (param : {id: number, name: string, type?: string, option?: string}) => void;
    onEditClick?: (param : {id: number, name: string, type?: string, option?: string}) => void;
}

export function ParamItem(props: ParamItemProps) {
    const { param, addInProgress, onDelete,  onEditClick } = props;
    const classes = useStyles();

    const label = param?.type ? `${param.type} ${param.name}` : `${param.name}`;
    const handleDelete = () => {
        onDelete(param);
    };
    const handleEdit = () => {
        onEditClick(param);
    };

    return (
        <div className={classes.headerWrapper} data-testid={`${label}-item`}>
            <div className={addInProgress ? classes.headerLabel : classes.headerLabelWithCursor} onClick={handleEdit}>
                {label}
                <ButtonWithIcon
                    onClick={handleDelete}
                    icon={<CloseRounded data-testid={`${label}-close-btn`} fontSize="small" />}
                    className={classes.iconBtn}
                />
            </div>
        </div>
    );
}
