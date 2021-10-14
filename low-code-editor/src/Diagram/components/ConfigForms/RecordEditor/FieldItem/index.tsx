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
// tslint:disable: jsx-no-multiline-js
import React from "react";

import { CloseRounded } from "@material-ui/icons";

import { ButtonWithIcon } from "../../../Portals/ConfigForm/Elements/Button/ButtonWithIcon";
import { recordStyles } from "../style";
import { SimpleField } from "../types";

interface FieldItemProps {
    field: SimpleField;
    onEditCLick?: () => void;
    onDeleteClick?: (field: SimpleField) => void;
}

export function FieldItem(props: FieldItemProps) {
    const { field, onDeleteClick, onEditCLick } = props;

    const recordClasses = recordStyles();

    const segmentLabel = `${field.type} ${field.isFieldTypeOptional ? "?" :
        ""} ${field.name} ${field.isFieldOptional ? "?" : ""}`;
    const handleDelete = () => {
        onDeleteClick(field);
    };

    return (
        <div className={recordClasses.itemWrapper}>
            <div className={recordClasses.itemLabel}>
                {segmentLabel}
                <ButtonWithIcon
                    onClick={handleDelete}
                    icon={<CloseRounded fontSize="small" />}
                    className={recordClasses.iconBtn}
                />
            </div>
        </div>
    );
}
