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
import * as React from "react";

export const BETA_SVG_WIDTH = 26;
export const BETA_SVG_HEIGHT = 12;

export function BetaSVG() {
    return (
        <svg width={BETA_SVG_WIDTH} height={BETA_SVG_HEIGHT} >
            <rect id="Rectangle" className="beta-button" width="26" height="12" rx="4"/>
            <text id="Beta" className="beta-text" transform="translate(3.75 8.5)">
                <tspan x="0" y="0">Beta</tspan>
            </text>
        </svg>
    )
}
