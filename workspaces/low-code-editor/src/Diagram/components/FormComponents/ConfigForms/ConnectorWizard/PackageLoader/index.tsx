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

import { Box, FormControl } from "@material-ui/core";
import { BallerinaConnectorInfo } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FormHeaderSection } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { STNode } from "@wso2-enterprise/syntax-tree";

import { FormGeneratorProps } from "../../../FormGenerator";
import { wizardStyles as useFormStyles } from "../../style";
import useStyles from "../style";

import PullingModuleLoader from "./Loader";

export function PackageLoader(props: FormGeneratorProps) {
    const classes = useStyles();
    const formClasses = useFormStyles();

    return (
        <FormControl data-testid="endpoint-list-form" className={formClasses.wizardFormControlExtended}>
            <FormHeaderSection onCancel={props.onCancel} formTitle={"lowcode.develop.configForms.packageLoader.title"} defaultMessage={"Pulling packages"} />
            <div className={classes.loaderWrapper}>
                <PullingModuleLoader />
                <p className={classes.loaderTitle}>Pulling packages</p>
                <p className={classes.loaderSubtitle}>This might take some time</p>
            </div>
        </FormControl>
    );
}
