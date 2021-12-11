/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
// tslint:disable: jsx-no-multiline-js
import * as React from "react";

import { ErrorSnippet } from "../../../../../../DiagramGenerator/generatorUtil";

import { ForEachRectSVG } from "./ForEachRectSVG";

export const FOREACH_SVG_WIDTH_WITH_SHADOW = 66.686;
export const FOREACH_SVG_HEIGHT_WITH_SHADOW = 62.686;
export const FOREACH_SVG_WIDTH = 54.845;
export const FOREACH_SVG_HEIGHT = 52.845;
export const FOREACH_SHADOW_OFFSET = FOREACH_SVG_HEIGHT_WITH_SHADOW - FOREACH_SVG_HEIGHT;

export function ForeachSVG(props: { x: number, y: number, text: string, openInCodeView?: () => void, codeSnippet?: string, diagnostics?: ErrorSnippet }) {
    const { text, openInCodeView, codeSnippet, diagnostics, ...xyProps } = props;
    const tooltipText = {
        code: codeSnippet
    }
    return (
        <svg {...xyProps} width={FOREACH_SVG_WIDTH_WITH_SHADOW} height={FOREACH_SVG_HEIGHT_WITH_SHADOW}>
            <defs>
                <linearGradient id="ForeachLinearGradient" x1="0.5" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
                    <stop offset="0" stopColor="#fcfcfd" />
                    <stop offset="1" stopColor="#f7f8fb" />
                </linearGradient>
                <filter id="ForeachFilterDefault" x="-20" y="-20" width="113.824" height="113.822" filterUnits="userSpaceOnUse">
                    <feOffset dy="1" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feFlood floodColor="#a9acb6" floodOpacity="0.388" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
                <filter id="ForeachFilterHover" x="-20" y="-20" width="146.824" height="146.822" filterUnits="userSpaceOnUse">
                    <feOffset dy="1" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="7.5" result="blur" />
                    <feFlood floodColor="#a9acb6" floodOpacity="0.388" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
            </defs>
            {diagnostics?.diagnosticMsgs ?
                (
                    <ForEachRectSVG
                        type={"diagram-diagnostic"}
                        onClick={openInCodeView}
                        diagnostic={diagnostics}
                    />

                )
                :
                (
                    <ForEachRectSVG
                        type={"diagram-code"}
                        onClick={openInCodeView}
                        text={tooltipText}
                    />

                )}
        </svg>
    )
}
