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
// tslint:disable:jsx-no-multiline-js
import React from "react";

import { getConstructIcon } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { BackButton } from "./BackButton";
import { CloseButton } from "./CloseButton";
import { FormTitle } from "./FormTitle";
import { useStyles } from "./style";

interface FormHeaderSectionProps {
    formTitle: string;
    defaultMessage: string;
    formType?: string;
    onCancel?: () => void;
    onBack?: () => void;
}

export function FormHeaderSection(props: FormHeaderSectionProps) {
    const { onCancel, onBack, formTitle, defaultMessage, formType } = props;
    const formClasses = useStyles();
    // TODO need to move the assests folder to commens module
    const icon = (formType && formType.length > 0) ? getConstructIcon(formType) : null;

    return (
        <div className={formClasses.formHeaderTitleWrapper}>
            {formType ? <div className={formClasses.titleIcon}>{icon}</div> : null}
            {onBack && <BackButton onBack={onBack} />}
            <FormTitle formTitle={formTitle} defaultMessage={defaultMessage} />
            {onCancel && <CloseButton onCancel={onCancel} />}
        </div>
    );
}
