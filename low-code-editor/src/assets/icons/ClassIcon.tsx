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

export interface ClassIconProps {
    color?: string
}

export default function ClassIcon(props: ClassIconProps) {

    return (
        <svg width="16px" height="16px" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
            <title>D85647CD-1FA7-4AB4-9F0C-CDE2AD6A0AFC</title>
            <g id="class-svg"  stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <g id="class-body" transform="translate(-113.000000, -656.000000)" fill={props.color ? props.color : "#40404B"} fill-rule="nonzero">
                    <path d="M126.621622,656 L115.378378,656 C114.064836,656 113,657.064836 113,658.378378 L113,669.621622 C113,670.935164 114.064836,672 115.378378,672 L126.621622,672 C127.935164,672 129,670.935164 129,669.621622 L129,658.378378 C129,657.064836 127.935164,656 126.621622,656 Z M115.378378,657.297297 L126.621622,657.297297 C127.218686,657.297297 127.702703,657.781314 127.702703,658.378378 L127.702703,669.621622 C127.702703,670.218686 127.218686,670.702703 126.621622,670.702703 L115.378378,670.702703 C114.781314,670.702703 114.297297,670.218686 114.297297,669.621622 L114.297297,658.378378 C114.297297,657.781314 114.781314,657.297297 115.378378,657.297297 Z" id="class-path"/>
                </g>
            </g>
        </svg>
    )
}
