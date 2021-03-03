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

export const HTTP_LOGO_WIDTH = 48;
export const HTTP_LOGO_HEIGHT = 48;

export function HttpLogo(props: { cx?: number, cy?: number, scale?: number }) {
    const { cx, cy, scale } = props;
    return (
        <svg transform={scale ? `scale(${scale})` : ''} x={!cx ? 0 : cx - (HTTP_LOGO_WIDTH / 2)} y={!cy ? 0 : cy - (HTTP_LOGO_HEIGHT / 2)} width={HTTP_LOGO_WIDTH} height={HTTP_LOGO_HEIGHT} >
            <g id="HttpWrapper" transform="translate(-10 -10)">
                <g id="HttpLogo" transform="translate(10 11)">
                    <path id="httpIcon" d="M11,11H54.335m0,43.2H11" transform="translate(-8.667 -11)" fill="none" stroke="#ccd1f2" strokeLinecap="round" strokeWidth="2" />
                    <path id="lines" d="M46.336,17.5v2.578H42.21V29.5h-3.07V20.078H35.025V17.5Zm7.032,0a4.516,4.516,0,0,1,3.341,1.33,4.12,4.12,0,0,1-.01,6,4.629,4.629,0,0,1-3.456,1.315h-3.07V29.5H47.14v-12Zm-19.145,0v2.578H30.1V29.5h-3.07V20.078H22.912V17.5Zm-21.154,0,0,4.8h6.017V17.5h3.07v12h-3.07V24.873H13.067l0,4.627H10v-12Zm40.21,2.585H50.154v3.523h3a1.845,1.845,0,0,0,1.346-.535,1.682,1.682,0,0,0,.523-1.229,1.729,1.729,0,0,0-.5-1.231,1.652,1.652,0,0,0-1.246-.528Z" transform="translate(-10 -1.732)" fill="#5567d5" />
                </g>
            </g>
        </svg>
    )
}
