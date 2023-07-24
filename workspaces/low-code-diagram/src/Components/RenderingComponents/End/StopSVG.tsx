/**
 * Copyright (c) 2020, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useContext, useEffect, useState } from "react";

import { Context } from "../../../Context/diagram";
import { DefaultTooltip } from "../DefaultTooltip";

export const STOP_SVG_HEIGHT_WITH_SHADOW = 44;
export const STOP_SVG_WIDTH_WITH_SHADOW = 60;
export const STOP_SVG_HEIGHT = 32;
export const STOP_SVG_WIDTH = 48;
export const STOP_SVG_SHADOW_OFFSET = STOP_SVG_HEIGHT_WITH_SHADOW - STOP_SVG_HEIGHT;

export function StopSVG(props: { x: number, y: number, text: string, codeSnippet?: string, openInCodeView?: () => void }) {
    const { text, codeSnippet, openInCodeView, ...xyProps } = props;
    const diagramContext = useContext(Context);
    const showTooltip = diagramContext?.api?.edit?.showTooltip;
    const [tooltip, setTooltip] = useState(undefined);
    const rectElement = (
        <g id="Stop" transform="translate(9 7)">
            <g transform="matrix(1, 0, 0, 1, -7, -5)" filter="url(#StopFilter)">
                <rect id="EndRect" width="48" height="32" rx="16" transform="translate(6 5)" />
            </g>
            <g id="EndRectangleContent" stroke="rgba(85,103,213,0.95)" strokeMiterlimit="10" strokeWidth="1">
                <rect width="48" height="32" rx="16" stroke="none" />
                <rect x="0.5" y="0.5" width="47" height="31" rx="15.5" fill="none" />
            </g>
            <text
                id="StopText"
                transform="translate(24 19.5)"
                className="end-text"
            >
                <tspan x="0" y="0" textAnchor="middle" data-testid="end-text-block"  >
                    {text}
                </tspan>
            </text>
        </g>
    );

    const defaultTooltip = (
        <DefaultTooltip text={{ code: codeSnippet }}>{rectElement}</DefaultTooltip>
    );

    useEffect(() => {
        if (codeSnippet && showTooltip) {
            setTooltip(showTooltip(rectElement, codeSnippet));
        }
    }, [codeSnippet]);

    return (
        <svg {...xyProps} height={STOP_SVG_HEIGHT_WITH_SHADOW} width={STOP_SVG_WIDTH_WITH_SHADOW} >
            <defs>
                <filter id="StopFilter" x="0" y="0" width="60" height="44" filterUnits="userSpaceOnUse">
                    <feOffset dy="1" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feFlood floodColor="#a9acb6" floodOpacity="0.388" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
                <linearGradient id="linear-gradient" x1="0.5" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
                    <stop offset="0" stopColor="#fcfcfd" />
                    <stop offset="1" stopColor="#f7f8fb" />
                </linearGradient>
            </defs>
            {tooltip ? tooltip : defaultTooltip}
        </svg >
    )
}
