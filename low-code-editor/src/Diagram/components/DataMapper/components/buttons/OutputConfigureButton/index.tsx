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

interface OutputConfigureButtonProps {
    x: number,
    y: number,
    disabled?: boolean,
    onClick?: () => void
}

export function OutputConfigureButton(props: OutputConfigureButtonProps) {
    const { disabled, ...xyProps } = props;

    return (
        <svg data-testid={'datamapper-json-output-configure-btn'}  {...xyProps} width="110px" height="18px" viewBox="0 0 110px 18" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
            <g id="Data-mapping" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <g id="datamaping-input-variables" transform="translate(-1027.000000, -131.000000)" fill="#5567D5" fill-rule="nonzero">
                    <g id="Icon/Feedback-Copy-6" transform="translate(1027.000000, 131.000000)">
                        <path d="M5,1.5 C5.37969577,1.5 5.69349096,1.78215388 5.74315338,2.14822944 L5.75,2.25 L5.75124955,2.84483501 C7.04453589,3.17830149 8,4.35257045 8,5.75 C8,7.14742955 7.04453589,8.32169851 5.75124955,8.65516499 L5.75,15.7449667 C5.75,16.1591803 5.41421356,16.4949667 5,16.4949667 C4.62030423,16.4949667 4.30650904,16.2128129 4.25684662,15.8467373 L4.25,15.7449667 L4.24975229,8.65542312 C2.95595757,8.32230488 2,7.14779037 2,5.75 C2,4.35220963 2.95595757,3.17769512 4.24975229,2.84457688 L4.25,2.25 C4.25,1.83578644 4.58578644,1.5 5,1.5 Z M13,1.5 C13.4142136,1.5 13.75,1.83578644 13.75,2.25 L13.75,2.25 L13.7512495,9.33980176 C15.0445359,9.67326824 16,10.8475372 16,12.2449667 C16,13.6423963 15.0445359,14.8166653 13.7512495,15.1501317 L13.7512495,15.1501317 L13.75,15.7449667 L13.7431534,15.8467373 C13.693491,16.2128129 13.3796958,16.4949667 13,16.4949667 C12.5857864,16.4949667 12.25,16.1591803 12.25,15.7449667 L12.25,15.7449667 L12.2497523,15.1503899 C10.9559576,14.8172716 10,13.6427571 10,12.2449667 C10,10.8471764 10.9559576,9.67266187 12.2497523,9.33954363 L12.2497523,9.33954363 L12.25,2.25 L12.2568466,2.14822944 C12.306509,1.78215388 12.6203042,1.5 13,1.5 Z M13,10.7449667 C12.1715729,10.7449667 11.5,11.4165396 11.5,12.2449667 C11.5,13.0733939 12.1715729,13.7449667 13,13.7449667 C13.8284271,13.7449667 14.5,13.0733939 14.5,12.2449667 C14.5,11.4165396 13.8284271,10.7449667 13,10.7449667 Z M5,4.25 C4.17157288,4.25 3.5,4.92157288 3.5,5.75 C3.5,6.57842712 4.17157288,7.25 5,7.25 C5.82842712,7.25 6.5,6.57842712 6.5,5.75 C6.5,4.92157288 5.82842712,4.25 5,4.25 Z" id="Combined-Shape"/>
                    </g>
                </g>
            </g>
            <g id="configure-output-icon">
                <text x={23} y={14} >Configure</text>
            </g>
        </svg>
    );
}
