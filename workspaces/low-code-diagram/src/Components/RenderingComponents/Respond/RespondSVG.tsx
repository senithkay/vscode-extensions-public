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

import { STNode } from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../Context/diagram";
import { DefaultTooltip } from "../DefaultTooltip";

export const RESPOND_SVG_HEIGHT_WITH_SHADOW = 46;
export const RESPOND_SVG_WIDTH_WITH_SHADOW = 96;
export const RESPOND_STROKE_HEIGHT = 1;
export const RESPOND_SVG_HEIGHT = 41 + RESPOND_STROKE_HEIGHT;
export const RESPOND_SVG_WIDTH = 83;
export const RESPOND_SVG_SHADOW_OFFSET = RESPOND_SVG_HEIGHT_WITH_SHADOW - RESPOND_SVG_HEIGHT;

export function RespondSVG(props: { x: number, y: number, text: string, sourceSnippet?: string, model: STNode, openInCodeView?: () => void }) {
    const { text, sourceSnippet, openInCodeView, model, ...xyProps } = props;
    const diagramContext = useContext(Context);
    const showTooltip = diagramContext?.api?.edit?.showTooltip;
    const [tooltipComp, setTooltipComp] = useState(undefined);
    const responseRect = (
        <g id="Respond" className="respond-comp respond-active" transform="translate(7 6)">
            <g transform="matrix(1, 0, 0, 1, -7, -6)">
                <g id="Rectangle-2" transform="translate(7 6)">
                    <rect width="82" height="32" rx="16" stroke="none" />
                    <rect x="-0.5" y="-0.5" width="83" height="33" rx="16.5" fill="none" className="click-effect" />
                </g>
            </g>
            <text id="RespondText" transform="translate(41 19.5)" className="respond-text" >
                <tspan x="0" y="0" textAnchor="middle" >
                    {text}
                </tspan>
            </text>
        </g>
    );


    const defaultTooltip = (
        <DefaultTooltip text={sourceSnippet}>{responseRect}</DefaultTooltip>
    );

    useEffect(() => {
        if (model && showTooltip) {
            setTooltipComp(showTooltip(responseRect, undefined, openInCodeView, model));
        }
    }, [model]);

    return (
        <svg {...xyProps} height={RESPOND_SVG_HEIGHT_WITH_SHADOW} width={RESPOND_SVG_WIDTH_WITH_SHADOW} className="respond">
            <defs>
                <linearGradient id="linear-gradient" x1="0.5" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
                    <stop offset="0" stopColor="#fcfcfd" />
                    <stop offset="1" stopColor="#f7f8fb" />
                </linearGradient>
                <filter id="RespondFilter" x="0" y="0" width="96" height="46" filterUnits="userSpaceOnUse">
                    <feOffset dy="1" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feFlood floodColor="#a9acb6" floodOpacity="0.388" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
                <filter id="RespondFilterHover" x="0" y="0" width="103" height="61" filterUnits="userSpaceOnUse">
                    <feOffset dy="3" dx="1" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feFlood floodColor="#a9acb6" floodOpacity="0.388" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
            </defs>
            {tooltipComp ? tooltipComp : defaultTooltip}
        </svg >
    )
}
