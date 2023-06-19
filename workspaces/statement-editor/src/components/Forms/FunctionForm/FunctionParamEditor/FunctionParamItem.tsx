/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React from "react";

import { CloseRounded } from "@material-ui/icons";
import { ButtonWithIcon } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";

import { FormEditorField } from "../../Types";

import { useStyles } from './style';

export interface FunctionParam {
    id: number;
    type: string;
    name: string;
}

interface FunctionParamItemProps {
    functionParam: FunctionParam;
    readonly : boolean;
    onDelete?: (functionParam: FunctionParam) => void;
    onEditClick?: (functionParam: FunctionParam) => void;
}

export function FunctionParamItem(props: FunctionParamItemProps) {
    const { functionParam, readonly, onDelete, onEditClick } = props;
    const classes = useStyles();

    const segmentLabel = functionParam.type + " " + functionParam.name;
    const handleDelete = () => {
        onDelete(functionParam);
    };
    const handleEdit = () => {
        if (!readonly) {
            onEditClick(functionParam);
        }
    };
    return (
        <div className={classes.headerWrapper}>
            <div className={classes.headerLabel}>
                <div data-test-id={"function-param"} className={readonly ? classes.disabledColor : classes.headerLabelCursor} onClick={handleEdit}>
                    {segmentLabel}
                </div>
                {!readonly && (
                    <ButtonWithIcon
                        onClick={handleDelete}
                        icon={<CloseRounded fontSize="small" />}
                        className={classes.iconBtn}
                    />
                )}
            </div>
        </div>
    );
}
