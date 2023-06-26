/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from 'react';

import './style.scss';

interface CollapseButtonSVG {
    x: number;
    y: number;
    onClick?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void
}

export function CollapseButtonSVG(props: CollapseButtonSVG) {
    return (
        <svg {...props} className='collapse-button' width="18px" height="18px" viewBox="0 0 18.0 18.0" >
            <defs>
                <clipPath id="i0">
                    <path d="M2982,0 L2982,1221 L0,1221 L0,0 L2982,0 Z" />
                </clipPath>
                <clipPath id="i1">
                    <path d="M13,0 C14.6568542,-3.04359188e-16 16,1.34314575 16,3 L16,13 C16,14.6568542 14.6568542,16 13,16 L3,16 C1.34314575,16 2.02906125e-16,14.6568542 0,13 L0,3 C-2.02906125e-16,1.34314575 1.34314575,3.04359188e-16 3,0 L13,0 Z" />
                </clipPath>
            </defs>
            <g clip-path="url(#i0)">
                <g clip-path="url(#i1)">
                    <polygon points="0,0 16,0 16,16 0,16 0,0" stroke="none" fill="#F7F8FB" />
                </g>
                <path className='collapse-btn-border' d="M3,0 L13,0 C14.6568542,-3.04359188e-16 16,1.34314575 16,3 L16,13 C16,14.6568542 14.6568542,16 13,16 L3,16 C1.34314575,16 2.02906125e-16,14.6568542 0,13 L0,3 C-2.02906125e-16,1.34314575 1.34314575,3.04359188e-16 3,0 Z" stroke="#A6B3FF" stroke-width="1" fill="none" stroke-miterlimit="10" />
                <g transform="translate(11.0 7.0) rotate(90.00000000000001)">
                    <path d="M0,0 L3,3 L0,6" stroke="#5567D5" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-miterlimit="10" />
                </g>
            </g>
        </svg>
    )
}
