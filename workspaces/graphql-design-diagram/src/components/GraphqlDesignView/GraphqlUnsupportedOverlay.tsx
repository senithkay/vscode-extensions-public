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

import { ServiceInvalidImg } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { GraphqlUnsupportedStyles } from "./styles";



export function GraphqlUnsupportedOverlay() {
    const graphqlUnsupportedClasses = GraphqlUnsupportedStyles();

    return (
        <div className={graphqlUnsupportedClasses.overlayWrapper}>
            <ServiceInvalidImg />
            <p className={graphqlUnsupportedClasses.title}>Unable to load the GraphQL visualizer</p>
            <p className={graphqlUnsupportedClasses.subtitle}>Please check for compilation errors within the code</p>
        </div>
    );
}
