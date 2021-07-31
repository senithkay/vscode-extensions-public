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

import { ModelCodePosition } from "../../../api/models";
import Tooltip from "../../../components/TooltipV2";

import "./style.scss";

export const PROCESS_SVG_WIDTH_WITH_HOVER_SHADOW = 62;
export const PROCESS_SVG_HEIGHT_WITH_HOVER_SHADOW = 62;
export const PROCESS_SVG_WIDTH_WITH_SHADOW = 62;
export const PROCESS_SVG_HEIGHT_WITH_SHADOW = 62;
export const PROCESS_SVG_WIDTH = 48;
export const PROCESS_STROKE_HEIGHT = 1;
export const PROCESS_SVG_HEIGHT = 48 + PROCESS_STROKE_HEIGHT;
export const PROCESS_SVG_SHADOW_OFFSET = PROCESS_SVG_HEIGHT_WITH_SHADOW - PROCESS_SVG_HEIGHT;


export function ProcessSVG(props: { x: number, y: number, varName: any, sourceSnippet: any, position: ModelCodePosition, openInCodeView?: () => void, processType: string }) {
    const { varName, sourceSnippet, processType, openInCodeView, ...xyProps } = props;

    const processTypeIndicator: JSX.Element[] = [];
    switch (processType) {
        case 'Log':
        case 'Call':
            processTypeIndicator.push(
                <text id="new" transform="translate(242 538)" className="process-icon-text">
                    <tspan x="1" y="1">{processType.toLowerCase()}</tspan>
                </text>
            );
            break;
        case 'DataMapper':
            processTypeIndicator.push(
                <>
                    <g transform="translate(244 529)">
                        <path id="Combined_Shape" d="M4.8,11.2H0V9.6H4.8v-8H.8V0h9.6V1.6h-4V4.8h4V6.4h-4v4.8Z" transform="translate(2.4 2.4)" fill="#ccd1f2" />
                        <path id="Combined_Shape-2" d="M12,11.2a1.6,1.6,0,1,1,1.6,1.6A1.6,1.6,0,0,1,12,11.2Zm-12,0a1.6,1.6,0,1,1,1.6,1.6A1.6,1.6,0,0,1,0,11.2ZM12,6.4A1.6,1.6,0,1,1,13.6,8,1.6,1.6,0,0,1,12,6.4ZM0,6.4A1.6,1.6,0,1,1,1.6,8,1.6,1.6,0,0,1,0,6.4ZM12,1.6a1.6,1.6,0,1,1,1.6,1.6A1.6,1.6,0,0,1,12,1.6ZM0,1.6A1.6,1.6,0,1,1,1.6,3.2,1.6,1.6,0,0,1,0,1.6Z" transform="translate(0.4 1.6)" fill="#5567d5" />
                    </g>
                </>
            )
            break;
        default:
            processTypeIndicator.push(
                <path
                    id="Icon"
                    className="process-icon"
                    d="M136.331,276.637h7.655v1.529h-7.655Zm.017,3.454H144v1.529h-7.655Z"
                    transform="translate(112 258)"
                />
            );

    }

    const tooltipText = {
        code: sourceSnippet
    }
    return (
        <svg {...xyProps} width={PROCESS_SVG_WIDTH_WITH_HOVER_SHADOW} height={PROCESS_SVG_HEIGHT_WITH_HOVER_SHADOW} className="process" >
            <defs>
                <linearGradient id="ProcessLinearGradient" x1=" " x2="0" y2="1" gradientUnits="objectBoundingBox">
                    <stop offset="0" stopColor="#fcfcfd" />
                    <stop offset="1" stopColor="#f7f8fb" />
                </linearGradient>
                <filter id="ProcessFilterDefault" x="0" y="0" width="142" height="94" filterUnits="userSpaceOnUse">
                    <feOffset dy="1" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feFlood floodColor="#a9acb6" floodOpacity="0.388" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
                <filter id="ProcessFilterHover" x="0" y="0" width="142" height="94" filterUnits="userSpaceOnUse">
                    <feOffset dy="3" dx="1" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feFlood floodColor="#a9acb6" floodOpacity="0.388" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
            </defs>
            <g>
                <Tooltip type={"diagram-code"} onClick={openInCodeView} text={tooltipText} placement="right" arrow={true}>
                    <g id="Process" className="data-processor process-active" transform="translate(-221.5 -506)">
                        <g transform="matrix(1, 0, 0, 1, 222, 509)">
                            <g id="ProcessRect-2" transform="translate(5.5 4)">
                                <rect width="48" height="48" rx="4" />
                                <rect x="-0.5" y="-0.5" width="49" height="49" rx="4.5" className="click-effect" />
                            </g>
                        </g>
                        {processTypeIndicator}
                    </g>
                </Tooltip>
            </g>
        </svg>
    )
}
