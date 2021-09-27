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

export interface ConstantIconProps {
    color?: string
}

export default function ConstantIcon(props: ConstantIconProps) {
    return (
        <svg width="16px" height="16px" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
            <title>B072B13A-4E9C-4CC2-8015-6C2BC793FF3A</title>
            <g id="module-var" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g id="module-var-body" transform="translate(-114.000000, -576.000000)" fill={props.color ? props.color : "#40404B"} fillRule="nonzero">
                    <path d="M122,576 C126.418278,576 130,579.581722 130,584 C130,588.418278 126.418278,592 122,592 C117.581722,592 114,588.418278 114,584 C114,579.581722 117.581722,576 122,576 Z M122,577.297297 C118.2982,577.297297 115.297297,580.2982 115.297297,584 C115.297297,587.7018 118.2982,590.702703 122,590.702703 C125.7018,590.702703 128.702703,587.7018 128.702703,584 C128.702703,580.2982 125.7018,577.297297 122,577.297297 Z M122,581.189189 C123.552368,581.189189 124.810811,582.447632 124.810811,584 C124.810811,585.552368 123.552368,586.810811 122,586.810811 C120.447632,586.810811 119.189189,585.552368 119.189189,584 C119.189189,582.447632 120.447632,581.189189 122,581.189189 Z M122,582.486486 C121.16411,582.486486 120.486486,583.16411 120.486486,584 C120.486486,584.83589 121.16411,585.513514 122,585.513514 C122.83589,585.513514 123.513514,584.83589 123.513514,584 C123.513514,583.16411 122.83589,582.486486 122,582.486486 Z" id="module-var-path"/>
                </g>
            </g>
        </svg>
    )
}
