/**
 * Copyright (c) 2020, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
// tslint:disable: jsx-wrap-multiline
import * as React from "react";

export const EDIT_ICON_SVG_WIDTH = 79;
export const EDIT_ICON_SVG_HEIGHT = 79;
export const EDIT_ICON_OFFSET = 16;

export function EditIconSVG(props: { x: number, y: number, onClick: () => void }) {
    const { onClick, ...xyProps } = props;
    return (
        <svg {...xyProps} width={EDIT_ICON_SVG_WIDTH} height={EDIT_ICON_SVG_HEIGHT} >
            <defs>
                <filter id="DefaultEditFilter" x="0" y="0" width="34" height="34" filterUnits="userSpaceOnUse">
                    <feOffset dy="1" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                    <feFlood floodColor="#9a9eac" floodOpacity="0.302" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
                <filter id="HoverEditFilter" x="0" y="0" width="34" height="34" filterUnits="userSpaceOnUse">
                    <feOffset dy="1" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                    <feFlood floodColor="#9a9eac" floodOpacity="0.302" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
            </defs>
            <g id="EditIconWrapper" className="editIcon-button" transform="translate(4.5 3.5)" onClick={onClick}>
                <g className="editIcon-wrapper" transform="matrix(1, 0, 0, 1, -4.5, -3.5)">
                    <g id="EditIconWrapper" transform="translate(4.5 3.5)">
                        <rect width="25" height="25" rx="12.5" stroke="none" />
                        <rect x="0.5" y="0.5" width="24" height="24" rx="12" fill="none" />
                    </g>
                </g>
                <path className="editIcon" id="EditIcon" d="M.2,9A.2.2,0,0,1,0,8.8V7.264A1.178,1.178,0,0,1,.281,6.5L2.5,8.719A1.179,1.179,0,0,1,1.736,9ZM3.035,7.932h0l-.242.234ZM.833,5.8,6.456.331a1.194,1.194,0,0,1,1.652,0l.551.534a1.106,1.106,0,0,1,0,1.6L3.035,7.932Z" transform="translate(8 8)" />
            </g>
        </svg>
    )
}
