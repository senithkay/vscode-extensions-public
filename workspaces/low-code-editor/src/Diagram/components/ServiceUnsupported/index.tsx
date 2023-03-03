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

import { ServiceUnsupportedImg } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { ServiceUnsupportedStyles } from "./style";

export function ServiceUnsupportedOverlay() {
    const serviceUnsupportedClasses = ServiceUnsupportedStyles();

    return (
        <div className={serviceUnsupportedClasses.overlayWrapper}>
            <ServiceUnsupportedImg />
            <p className={serviceUnsupportedClasses.title}>Diagram editing for this is not supported</p>
            <p className={serviceUnsupportedClasses.subtitle}>Please move to code</p>
        </div>
    );
}
