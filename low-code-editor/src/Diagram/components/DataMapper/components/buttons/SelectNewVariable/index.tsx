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

export interface AddVariableButtonProps {
    x: number,
    y: number,
    disabled?: boolean,
    onClick?: () => void
}

export function AddVariableButton(props: AddVariableButtonProps) {
    const { disabled, ...xyProps } = props;

    return (
        <svg {...xyProps} width="110px" height="18px" viewBox="0 0 110px 18" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
            {/* <title>AD26148C-0FD3-4B56-9178-150E90F65543</title> */}
            <g id="add-variable-icon" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <g id="datamaping-start" transform="translate(-356.000000, -131.000000)" stroke="#5567D5" stroke-width="1.5">
                    <g id="Icon/Feedback-Copy-6" transform="translate(356.000000, 131.000000)">
                        <circle id="Oval" fill-rule="nonzero" cx="9" cy="9" r="6.75"/>
                        <path d="M9,6 L9,11.9442139 M11.9721069,8.97210693 L6.02789307,8.97210693" id="Combined-Shape" stroke-linecap="round"/>
                    </g>
                </g>
            </g>
            <g id="add-variable-text">
                <text x={23} y={14} >Add Variable</text>
            </g>
        </svg>
    )
}


        // <svg {...xyProps} width="64px" height="35px" viewBox={'0 0 84 52'} version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
        //     <defs>
        //         <rect id="dm-savebtn-path-1" x="0" y="0" width="80" height="48" rx="5" />
        //         <filter x="-4.4%" y="-5.2%" width="108.8%" height="114.6%" filterUnits="objectBoundingBox" id="dm-savebtn-filter-2">
        //             <feOffset dx="0" dy="1" in="SourceAlpha" result="shadowOffsetOuter1" />
        //             <feGaussianBlur stdDeviation="1" in="shadowOffsetOuter1" result="shadowBlurOuter1" />
        //             <feComposite in="shadowBlurOuter1" in2="SourceAlpha" operator="out" result="shadowBlurOuter1" />
        //             <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.15 0" type="matrix" in="shadowBlurOuter1" />
        //         </filter>
        //         <rect id="dm-savebtn-path-3" x="0" y="0" width="80" height="48" rx="5" />
        //         <rect id="dm-savebtn-path-5" x="0" y="0" width="80" height="48" rx="5" />
        //         <filter x="-0.6%" y="-1.0%" width="101.2%" height="102.1%" filterUnits="objectBoundingBox" id="dm-savebtn-filter-6">
        //             <feMorphology radius="1" operator="erode" in="SourceAlpha" result="shadowSpreadInner1" />
        //             <feOffset dx="0" dy="0" in="shadowSpreadInner1" result="shadowOffsetInner1" />
        //             <feComposite in="shadowOffsetInner1" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowInnerInner1" />
        //             <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.1 0" type="matrix" in="shadowInnerInner1" />
        //         </filter>
        //     </defs>
        //     <g id="Develop" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        //         <g id="develop-UI-kit" transform="translate(-214.000000, -175.000000)">
        //             <g id="Button/Square/48/Default" transform="translate(216.000000, 176.000000)">
        //                 <g id="Shadow">
        //                     <use fill="black" fill-opacity="1" filter="url(#dm-savebtn-filter-2)" xlinkHref="#dm-savebtn-path-1" />
        //                     <use fill-opacity="0" fill="#FFFFFF" fill-rule="evenodd" xlinkHref="#dm-savebtn-path-1" />
        //                 </g>
        //                 <mask id="mask-4" fill="white">
        //                     <use xlinkHref="#dm-savebtn-path-3" />
        //                 </mask>
        //                 <use id="Mask" fill="#D8D8D8" xlinkHref="#dm-savebtn-path-3" />
        //                 <g id="Purpose" mask="url(#mask-4)" fill="#5567D5" fill-rule="nonzero">
        //                     <rect x="0" y="0" width="80" height="48" />
        //                 </g>
        //                 <g id="Rectangle">
        //                     <use fill-opacity="0" fill="#FFFFFF" fill-rule="evenodd" xlinkHref="#dm-savebtn-path-5" />
        //                     <use fill="black" fill-opacity="1" filter="url(#dm-savebtn-filter-6)" xlinkHref="#dm-savebtn-path-5" />
        //                 </g>
        //                 <text id="Text" font-family="GilmerMedium, Gilmer Medium" font-size="18" font-weight="500" fill="#FFFFFF">
        //                     <tspan x="24.026123" y="28">Add</tspan>
        //                 </text>
        //             </g>
        //         </g>
        //     </g>
        // </svg>
