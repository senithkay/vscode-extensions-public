/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
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
// tslint:disable: jsx-no-multiline-js
import React from "react";

import { DeleteButton, ParamEditButton } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { useStyles } from './style';


export interface FunctionParameter {
    id: number;
    type: string;
    name: string;
    defaultValue?: string;
}

interface ParameterFieldProps {
    param: FunctionParameter;
    readonly: boolean;
    onDelete?: (functionParam: FunctionParameter) => void;
    onEditClick?: (functionParam: FunctionParameter) => void;
}

export function ParameterField(props: ParameterFieldProps) {
    const { param, readonly, onDelete, onEditClick } = props;
    const classes = useStyles();

    const label = param?.type ? `${param.type} ${param.name}${param.defaultValue ? ` = ${param.defaultValue}` : ""}`
        : `${param.name}`;
    const handleDelete = () => {
        onDelete(param);
    };
    const handleEdit = () => {
        if (!readonly) {
            onEditClick(param);
        }
    };
    return (
        <div className={classes.headerWrapper} data-testid={`${label}-item`}>
            <div className={classes.headerLabel}>
                <div className={classes.contentSection}>
                    <div
                        data-test-id={`${label}-param`}
                        className={readonly ? classes.disabledHeaderLabel : classes.enabledHeaderLabel}
                        onClick={handleEdit}
                    >
                        {label}
                    </div>
                    {!readonly && (
                        <>
                            <div className={classes.contentIconWrapper}>
                                <ParamEditButton onClick={handleEdit}/>
                            </div>
                            <div className={classes.deleteButtonWrapper}>
                                <DeleteButton onClick={handleDelete}/>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
