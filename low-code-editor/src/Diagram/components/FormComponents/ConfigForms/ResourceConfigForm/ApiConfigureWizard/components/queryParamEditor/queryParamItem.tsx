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
import { ButtonWithIcon } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";

import { QueryParam } from "../../types";

import { useStyles } from './style';

interface QueryParamItemProps {
    queryParam: QueryParam;
    addInProgress: boolean;
    onDelete?: (queryParam: QueryParam) => void;
    onEditClick?: (queryParam: QueryParam) => void;
}

export function QueryParamItem(props: QueryParamItemProps) {
    const { queryParam, addInProgress, onDelete, onEditClick } = props;
    const classes = useStyles();

    const segmentLabel = queryParam.type + " " + queryParam.name;
    const handleDelete = () => {
        onDelete(queryParam);
    };
    const handleEdit = () => {
        onEditClick(queryParam);
    };

    return (
        <div className={classes.headerWrapper} data-testid={`${queryParam.name}-item`} >
            <div className={addInProgress ? classes.headerLabel : classes.headerLabelWithCursor} onClick={handleEdit}>
                {segmentLabel}
                <ButtonWithIcon
                    onClick={handleDelete}
                    icon={<CloseRounded data-testid={`${queryParam.name}-close-btn`} fontSize="small" />}
                    className={classes.iconBtn}
                />
            </div>
        </div>
    );
}
