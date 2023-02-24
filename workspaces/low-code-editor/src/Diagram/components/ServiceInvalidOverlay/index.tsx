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
import { ServiceInvalidImg } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import React from "react";
import { ServiceInvalidStyles } from "./style";

export function ServiceInvalidOverlay() {
    const serviceInvalidClasses = ServiceInvalidStyles();

    return (
        <div className={serviceInvalidClasses.overlayWrapper}>
            <ServiceInvalidImg />
            <p className={serviceInvalidClasses.title}>Source code contains errors</p>
            <p className={serviceInvalidClasses.subtitle}>Please fix the errors and try again</p>
        </div>
    );
}
