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

import { FormControl } from "@material-ui/core";
import { FormHeaderSection } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";

import { useStyles as useFormStyles } from "../../../../../DynamicConnectorForm/style";

interface DefaultFormProps {
    test?: string;
}

export function DefaultForm(props: DefaultFormProps) {
    const formClasses = useFormStyles();
    // <FormHeaderSection
    //     onCancel={}
    //     formTitle={""}
    //     defaultMessage={"Log"}
    // />
    return (
        <FormControl data-testid="log-form" className={formClasses.wizardFormControl}>
            yo
        </FormControl>
    )
}
