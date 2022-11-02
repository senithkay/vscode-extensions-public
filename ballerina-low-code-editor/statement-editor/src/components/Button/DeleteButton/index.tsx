/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

import { IconButton } from '@material-ui/core';

export default function DeleteButton(props: any) {
    const { onClick } = props;

    const handleOnClick = (evt: React.MouseEvent) => {
        evt.stopPropagation();
        if (props && onClick) {
            onClick();
        }
    }

    return (
        <IconButton onClick={handleOnClick} data-testid={"delete-button"}>
            <svg width="26px" height="26px" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                <title>C93C4C01-8815-4D09-94B3-71253BCE2E7A</title>
                <defs>
                    <circle id="path-1" cx="8" cy="8" r="8" />
                    <filter x="-40.6%" y="-40.6%" width="181.2%" height="181.2%" filterUnits="objectBoundingBox" id="filter-2">
                        <feMorphology radius="0.5" operator="dilate" in="SourceAlpha" result="shadowSpreadOuter1" />
                        <feOffset dx="0" dy="0" in="shadowSpreadOuter1" result="shadowOffsetOuter1" />
                        <feGaussianBlur stdDeviation="2" in="shadowOffsetOuter1" result="shadowBlurOuter1" />
                        <feComposite in="shadowBlurOuter1" in2="SourceAlpha" operator="out" result="shadowBlurOuter1" />
                        <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.30655174 0" type="matrix" in="shadowBlurOuter1" />
                    </filter>
                </defs>
                <g id="Expression-Delete" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                    <g id="cases" transform="translate(-471.000000, -381.000000)">
                        <g id="Group-4" transform="translate(244.000000, 384.000000)">
                            <g id="Delete-Copy-2" transform="translate(232.000000, 2.000000)">
                                <g id="Oval">
                                    <use fill="black" fillOpacity="1" filter="url(#filter-2)" xlinkHref="#path-1" />
                                    <use strokeOpacity="0.510025131" stroke="#FE523C" strokeWidth="1" fill="#FFFFFF" fillRule="evenodd" xlinkHref="#path-1" />
                                </g>
                                <path d="M5.2843055,4.58859116 L5.35355339,4.64644661 L8,7.293 L10.6464466,4.64644661 C10.8417088,4.45118446 11.1582912,4.45118446 11.3535534,4.64644661 C11.5271197,4.82001296 11.5464049,5.08943736 11.4114088,5.2843055 L11.3535534,5.35355339 L8.707,8 L11.3535534,10.6464466 C11.5488155,10.8417088 11.5488155,11.1582912 11.3535534,11.3535534 C11.179987,11.5271197 10.9105626,11.5464049 10.7156945,11.4114088 L10.6464466,11.3535534 L8,8.707 L5.35355339,11.3535534 C5.15829124,11.5488155 4.84170876,11.5488155 4.64644661,11.3535534 C4.47288026,11.179987 4.45359511,10.9105626 4.58859116,10.7156945 L4.64644661,10.6464466 L7.293,8 L4.64644661,5.35355339 C4.45118446,5.15829124 4.45118446,4.84170876 4.64644661,4.64644661 C4.82001296,4.47288026 5.08943736,4.45359511 5.2843055,4.58859116 Z" id="Combined-Shape" fill="#FE523C" fillRule="nonzero" />
                            </g>
                        </g>
                    </g>
                </g>
            </svg>
        </IconButton>
    )
}
