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
// tslint:disable: jsx-no-multiline-js
import * as React from "react";

import { STNode } from "@wso2-enterprise/syntax-tree";

import { ErrorSnippet } from "../../../Types/type";

import { ReturnRectSVG } from "./ReturnRectSVG";

export const RETURN_SVG_HEIGHT = 42;
export const RETURN_SVG_WIDTH = 84;

export function ReturnSVG(props: { x: number, y: number, text?: string, openInCodeView?: () => void , diagnostics?: ErrorSnippet, componentSTNode: STNode }) {
    const { diagnostics, text, openInCodeView, componentSTNode, ...xyProps } = props;

    return (
        <svg {...xyProps} height={RETURN_SVG_HEIGHT} width={RETURN_SVG_WIDTH} className="return">
            <defs>
                <linearGradient id="ReturnLinearGradient" x1="0.5" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
                    <stop offset="0" stopColor="#fcfcfd" />
                    <stop offset="1" stopColor="#f7f8fb" />
                </linearGradient>
                <filter id="ReturnFilter" x="0" y="0" width={RETURN_SVG_WIDTH} height={RETURN_SVG_HEIGHT} filterUnits="userSpaceOnUse">
                    <feOffset dy="1" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feFlood floodColor="#a9acb6" floodOpacity="0.388" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
                <filter id="ReturnFilterHover"  x="0"  y="0" width={RETURN_SVG_WIDTH}  height={RETURN_SVG_HEIGHT} filterUnits="userSpaceOnUse" >
                    <feOffset dy="3" dx="1" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feFlood floodColor="#a9acb6" floodOpacity="0.388" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
            </defs>
                (
                    <ReturnRectSVG
                        onClick={openInCodeView}
                        model={componentSTNode}
                        diagnostic={diagnostics}
                        className="while-group"
                    />
                    )
        </svg >
    )
}
