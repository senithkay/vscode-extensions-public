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
import React from 'react';

import "./style.scss";
export interface AddVariableButtonProps {
    x: number,
    y: number,
    disabled?: boolean,
    onClick?: () => void
}

export function AddVariableButton(props: AddVariableButtonProps) {
    const { disabled, onClick, ...xyProps } = props;

    return (
        <svg data-testid={'datamapper-json-input-configure-btn'} {...xyProps} width="110px" height="18px" onClick={onClick} className="add-button">
            <rect width="117px" height="22px" fill="#fff" rx="6" y="-2" x="-2"  />
            <g id="add-variable-icon" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g id="datamaping-start" transform="translate(-356.000000, -131.000000)" stroke="#5567D5" strokeWidth="1.5">
                    <g id="Icon/Feedback-Copy-6" transform="translate(356.000000, 131.000000)">
                        <circle id="Oval" fillRule="nonzero" cx="9" cy="9" r="6.75" />
                        <path d="M9,6 L9,11.9442139 M11.9721069,8.97210693 L6.02789307,8.97210693" id="Combined-Shape" stroke-linecap="round" />
                    </g>
                </g>
            </g>
            <g id="add-variable-text">
                <text x={23} y={14} >Add Variable</text>
            </g>
        </svg>
    )
}
