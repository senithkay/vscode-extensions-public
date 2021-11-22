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

import { CloseButton } from "./CloseButton";
import { FormTitle } from "./FormTitle";
// TODO need to move the assests folder to commens module
// import { getConstructIcon } from "../../../Portals/utils";
import { useStyles } from "./style";

interface FormHeaderSectionProps {
    onCancel?: () => void;
    statementEditor?: boolean;
    formTitle: string;
    defaultMessage: string;
    formType?: string;
    handleStmtEditorToggle?: () => void;
    toggleChecked?: boolean;
}

export function FormHeaderSection(props: FormHeaderSectionProps) {
    const { onCancel, statementEditor, formTitle, defaultMessage, formType, handleStmtEditorToggle, toggleChecked } = props;
    const formClasses = useStyles();
    // TODO need to move the assests folder to commens module
    // const icon = (formType && formType.length > 0) ? getConstructIcon(formType) : null;

    return (
        <div className={formClasses.formHeaderTitleWrapper}>
            // TODO need to move the assests folder to commens module
            {/* {formType ? <div className={formClasses.titleIcon}>{icon}</div> : null} */}
            <FormTitle
                statementEditor={statementEditor}
                formTitle={formTitle}
                defaultMessage={defaultMessage}
                handleStmtEditorToggle={handleStmtEditorToggle}
                toggleChecked={toggleChecked}
            />
            {onCancel && <CloseButton onCancel={onCancel} />}
        </div>
    );
}
