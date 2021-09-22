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

export interface RecordIconProps {
    color?: string
}

export default function RecordIcon(props: RecordIconProps) {
    return (
        <svg width="16px" height="16px" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
            <g id="record-icon" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <g id="record-icon-body" transform="translate(-114.000000, -496.000000)" fill={props.color ? props.color : "#40404B"} fill-rule="nonzero">
                    <path d="M127.333333,496 C128.806093,496 130,497.064836 130,498.378378 L130,498.378378 L130,509.621622 C130,510.935164 128.806093,512 127.333333,512 L127.333333,512 L116.666667,512 C115.193907,512 114,510.935164 114,509.621622 L114,509.621622 L114,498.378378 C114,497.064836 115.193907,496 116.666667,496 L116.666667,496 Z M127.333333,497.297297 L116.666667,497.297297 C115.997231,497.297297 115.454545,497.781314 115.454545,498.378378 L115.454545,498.378378 L115.454545,509.621622 C115.454545,510.218686 115.997231,510.702703 116.666667,510.702703 L116.666667,510.702703 L127.333333,510.702703 C128.002769,510.702703 128.545455,510.218686 128.545455,509.621622 L128.545455,509.621622 L128.545455,498.378378 C128.545455,497.781314 128.002769,497.297297 127.333333,497.297297 L127.333333,497.297297 Z M125.676458,500.130929 C126.07812,500.130929 126.403731,500.421339 126.403731,500.779577 C126.403731,501.107963 126.130127,501.379353 125.775145,501.422305 L125.676458,501.428226 L122.727,501.428 L122.727273,507.891892 C122.727273,508.250131 122.401662,508.540541 122,508.540541 C121.63181,508.540541 121.327524,508.296516 121.279366,507.97991 L121.272727,507.891892 L121.272,501.428 L117.89664,501.428226 C117.494978,501.428226 117.169367,501.137816 117.169367,500.779577 C117.169367,500.451192 117.442971,500.179801 117.797953,500.13685 L117.89664,500.130929 L125.676458,500.130929 Z" id="record-path"/>
                </g>
            </g>
        </svg>
    )
}
