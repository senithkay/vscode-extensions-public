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
// tslint:disable: jsx-wrap-multiline
import React from "react";

import "./style.scss";

export function ErrorMessage(props: {
    x: number,
    y: number,
    text?: string,
    className?: string,
    onClose?: () => void,
}) {
    const { text, className, onClose, ...xyProps } = props;
    return (
        <svg version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 568 224.5">
            <g id="Card_Default" transform="translate(253.552 309.663)">
                <path
                    id="Shadow-4"
                    d="M-168.1-259.2h397c6.6,0,12,5.4,12,12v75c0,6.6-5.4,12-12,12h-397c-6.6,0-12-5.4-12-12v-75
		C-180.1-253.8-174.7-259.2-168.1-259.2z"
                />
                <path
                    id="Rectangle_Copy_5-2"
                    fill="#FFFFFF"
                    stroke="#F8C2C2"
                    strokeMiterlimit="10"
                    d="M-181.1-259.2h423c6.6,0,12,5.4,12,12v75c0,6.6-5.4,12-12,12h-423
		c-6.6,0-12-5.4-12-12v-75C-193.1-253.8-187.7-259.2-181.1-259.2z"
                />
            </g>
            <g id="ButtonGroup" transform="translate(2 -162)">
                <g id="Quick_Fix" transform="translate(461 528)">
                    <path
                        id="Rectangle"
                        fill="#5567D5"
                        d="M-188.5-259.5h71c2.8,0,5,2.2,5,5v22c0,2.8-2.2,5-5,5h-71c-2.8,0-5-2.2-5-5v-22
			C-193.5-257.3-191.3-259.5-188.5-259.5z"
                    />
                    <text transform="matrix(1 0 0 1 -181.21 -239.5)" className="primary-btn">
                        Quick Fix
                    </text>
                </g>
                <g id="JumpToCode" transform="translate(550 528)">
                    <path
                        id="Rectangle-2"
                        fill="#F7F8FB"
                        d="M-188.5-259.5h99c2.8,0,5,2.2,5,5v22c0,2.8-2.2,5-5,5h-99c-2.8,0-5-2.2-5-5v-22
			C-193.5-257.3-191.3-259.5-188.5-259.5z"
                    />
                    <text transform="matrix(1 0 0 1 -179.009 -239.5)" className="secondery-btn">
                        Jump to Code
                    </text>
                </g>
            </g>
            <text transform="matrix(1 0 0 1 107.5 76.5)" font-family='GilmerMedium' font-size='13px' fill='#222228'>Error and small description would you like to Docker linter </text>
            <text transform="matrix(1 0 0 1 107.5 92.5)" font-family='GilmerMedium' font-size='13px' fill='#222228'>in CP repo and fix all reported issues</text>
            <g id="ErrorIcon" transform="translate(-13.599 -29)">
                <g id="Icon_Analytics_Alerts" transform="translate(283.599 522)">
                    <path
                        id="Combined_Shape-3"
                        fill="#FE523C"
                        d="M-180.2-410h-10.4c-0.5,0-0.9-0.4-0.9-0.9c0-0.2,0-0.3,0.1-0.5l5.2-9.2
			c0.2-0.4,0.8-0.6,1.2-0.3c0.1,0.1,0.3,0.2,0.3,0.3l5.2,9.2c0.3,0.4,0.1,1-0.3,1.3C-179.9-410.1-180-410.1-180.2-410z
			 M-185.4-412.3c-0.4,0-0.8,0.3-0.8,0.8c0,0.4,0.3,0.8,0.8,0.8c0.4,0,0.8-0.3,0.8-0.8c0,0,0,0,0,0
			C-184.6-412-185-412.3-185.4-412.3z M-185.4-418.4c-0.4,0-0.8,0.3-0.8,0.8v3.8c0,0.4,0.3,0.8,0.8,0.8c0.4,0,0.8-0.3,0.8-0.8v-3.8
			C-184.6-418.1-185-418.4-185.4-418.4L-185.4-418.4z"
                    />
                </g>
                <circle fill="none" stroke="#FA503B" cx="97.6" cy="108" r="12" />
            </g>
            <path
                id="CloseBtn"
                fill="#CBCEDB"
                d="M492.2,76.3l-3.7-3.7l-3.7,3.7c-0.3,0.3-0.8,0.3-1.1,0l0,0c-0.3-0.3-0.3-0.8,0-1.1l3.7-3.7
	l-3.7-3.7c-0.3-0.3-0.3-0.8,0-1.1l0,0c0.3-0.3,0.8-0.3,1.1,0l3.7,3.7l3.7-3.7c0.3-0.3,0.8-0.3,1.1,0l0,0c0.3,0.3,0.3,0.8,0,1.1
	l-3.7,3.7l3.7,3.7c0.3,0.3,0.3,0.8,0,1.1l0,0C493,76.6,492.5,76.6,492.2,76.3L492.2,76.3z"
            />
        </svg>
    );
}
