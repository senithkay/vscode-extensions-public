/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

import { DiagnosticMsgSeverity } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

export const TOP_CURVE_SVG_WIDTH = 6.5;
export const TOP_CURVE_SVG_HEIGHT = 6.5;

export function TopCurveSVG(xyProps: { x: number, y: number , diagnostics: DiagnosticMsgSeverity}) {
    const {diagnostics} = xyProps;
    const diagnosticStyles = diagnostics?.severity === "ERROR" ? "line-curve-error" : "line-curve-warning";
    const lineStyles = diagnostics ? diagnosticStyles : "line-curve"

    return (
        <svg {...xyProps} width={TOP_CURVE_SVG_WIDTH} height={TOP_CURVE_SVG_HEIGHT}>
            <path className={lineStyles} d="M0,0.5c3.3,0,6,2.7,6,6c0,0,0,0,0,0" />
        </svg>
    );
}
