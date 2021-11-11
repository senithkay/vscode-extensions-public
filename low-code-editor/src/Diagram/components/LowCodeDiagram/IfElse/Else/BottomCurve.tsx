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

import "./style.scss";

export const BOTTOM_CURVE_SVG_WIDTH = 6.5;
export const BOTTOM_CURVE_SVG_HEIGHT = 6.5;

export function BottomCurveSVG(xyProps: { x: number, y: number }) {
    return (
        <svg {...xyProps} width={BOTTOM_CURVE_SVG_WIDTH} height={BOTTOM_CURVE_SVG_HEIGHT}>
            <path className="line-curve" d="M6,0c0,3.3-2.7,6-6,6c0,0,0,0,0,0" />
        </svg>
    );
}
