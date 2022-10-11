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
// tslint:disable: jsx-no-multiline-js
import React from "react";

import { DeleteButton, ParamEditButton } from '@wso2-enterprise/ballerina-low-code-edtior-commons';

import { recordStyles } from "../style";

interface ParamItemProps {
    record: string;
    onDelete: (param: string) => void;
    onEditClick: (param: string) => void;
}

export function RecordItem(props: ParamItemProps) {
    const { record, onDelete, onEditClick } = props;
    const recordClasses = recordStyles();

    const handleDelete = () => {
        onDelete(record);
    };
    const handleEdit = () => {
        onEditClick(record);
    };

    return (
        <div className={recordClasses.headerWrapper} data-testid={`${record}-item`}>
            <div className={recordClasses.contentSection} onClick={handleEdit}>
                {record}
            </div>
            <div className={recordClasses.iconSection}>
                <div className={recordClasses.editIconWrapper}>
                    <ParamEditButton onClick={handleEdit}/>
                </div>
                <div className={recordClasses.deleteIconWrapper}>
                    <DeleteButton onClick={handleDelete}/>
                </div>
            </div>
        </div>
    );
}
