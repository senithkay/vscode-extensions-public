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

import { getConstructIcon } from "../../../Portals/utils";
import { useStyles } from "../../DynamicConnectorForm/style";

import { CloseButton } from "./CloseButton";
import { FormTitle } from "./FormTitle";

interface FormHeaderSectionProps {
    onCancel: () => void;
    statementEditor?: boolean;
    formTitle: string;
    defaultMessage: string;
    statementEditorBtnOnClick?: () => void;
    formType?: string;
}

export function FormHeaderSection(props: FormHeaderSectionProps) {
    const { onCancel, statementEditor, formTitle, defaultMessage, statementEditorBtnOnClick, formType } = props;
    const formClasses = useStyles();
    const icon = (formType && formType.length > 0) ? getConstructIcon(formType) : null;

    return (
        <div className={formClasses.formHeaderTitleWrapper}>
            {formType ? <div className={formClasses.titleIcon}>{icon}</div> : null}
            <FormTitle statementEditor={statementEditor} formTitle={formTitle} defaultMessage={defaultMessage} statementEditorBtnOnClick={statementEditorBtnOnClick} />
            <CloseButton onCancel={onCancel} />
        </div>
    );
}
