/*
 * Copyright (c) 2023, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

const ICON_COLOR = "#5567D5";
const BG_COLOR = "#FFF";

export function GatewayIcon() {
    return (
        <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
             x="0px" y="0px" viewBox="0 0 160 160"
             xmlSpace="preserve">
            <symbol id="Arrow_26" viewBox="-22.86 -13.14 45.72 26.28">
                <rect x="-22.86" y="-13.14" style={{fill: "none"}} width="45.72" height="26.28"/>
                <g>
                    <polygon
                        style={{fill: ICON_COLOR}}
                        points="-22.86,-6.34 0.07,-6.34 0.07,-13.14 22.86,0 0.07,13.14 0.07,6.34 -22.86,6.34"
                    />
                </g>
            </symbol>
            <circle
                style={{fill: BG_COLOR, stroke: ICON_COLOR, strokeWidth: 5, strokeMiterlimit: 10}}
                cx="80"
                cy="80"
                r="74.68"
            />
            <g>
                <use
                    xlinkHref="#Arrow_26" width="45.72" height="26.28" id="XMLID_1_" x="-22.86" y="-13.14"
                    transform="matrix(1.7329 0 0 -1.7329 82.8319 99.1286)"
                    style={{overflow: "visible"}}
                />
                <use
                    xlinkHref="#Arrow_26"
                    width="45.72"
                    height="26.28"
                    x="-22.86"
                    y="-13.14"
                    transform="matrix(-1.7329 0 0 -1.7329 77.1681 60.8714)"
                    style={{overflow: "visible"}}
                />
            </g>
        </svg>
    );
}
