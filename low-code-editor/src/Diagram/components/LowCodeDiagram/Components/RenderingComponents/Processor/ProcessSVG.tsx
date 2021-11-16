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
import React, { ReactElement } from "react";

import { NodePosition } from "@ballerina/syntax-tree";

import Tooltip from "../../../../../../components/TooltipV2";
import { ErrorSnippet } from "../../../Context/types";

import "./style.scss";

export const PROCESS_SVG_WIDTH_WITH_HOVER_SHADOW = 62;
export const PROCESS_SVG_HEIGHT_WITH_HOVER_SHADOW = 62;
export const PROCESS_SVG_WIDTH_WITH_SHADOW = 62;
export const PROCESS_SVG_HEIGHT_WITH_SHADOW = 62;
export const PROCESS_SVG_WIDTH = 48;
export const PROCESS_STROKE_HEIGHT = 1;
export const PROCESS_SVG_HEIGHT = 48 + PROCESS_STROKE_HEIGHT;
export const PROCESS_SVG_SHADOW_OFFSET = PROCESS_SVG_HEIGHT_WITH_SHADOW - PROCESS_SVG_HEIGHT;


export function ProcessSVG(props: {
    x: number, y: number, varName: any,
    sourceSnippet: any, position: NodePosition,
    openInCodeView?: () => void,
    processType: string, diagnostics?: ErrorSnippet
    })
    {
    const { varName, sourceSnippet, processType, openInCodeView, diagnostics, ...xyProps } = props;
    const processTypeIndicator: JSX.Element[] = [];
    const tooltipText = {
        code: sourceSnippet
    }
    const logIcon: ReactElement = (
        <g transform="translate(242 522)">
            <path id="Path_23" d="M7.2,0a.8.8,0,0,1,.093,1.595L7.2,1.6H.8A.8.8,0,0,1,.707.005L.8,0Z" transform="translate(8 11.2)" fill="#5567d5" />
            <path id="Combined_Shape" d="M0,6.4a6.4,6.4,0,0,1,12.8,0c0,.024,0,.047,0,.071l1.837-1.836a.8.8,0,0,1,1.2,1.056l-.066.076L12,9.531,8.235,5.772a.8.8,0,0,1,1.055-1.2l.076.067L11.2,6.476c0-.025,0-.05,0-.076a4.8,4.8,0,1,0-4.8,4.8.8.8,0,1,1,0,1.6A6.4,6.4,0,0,1,0,6.4Zm12,.869L12.07,7.2c-.023,0-.046,0-.07,0s-.05,0-.075,0Z" transform="translate(0 1.6)" fill="#ccd1f2" />
        </g>
    );
    const callIcon: ReactElement = (
        <g transform="translate(242 522)">
            <path id="Combined-Shape" d="M17.189,1V5.094a.819.819,0,0,1-1.632.1l-.006-.1v-1.3L10.4,8.948A.819.819,0,0,1,9.172,7.867L9.24,7.79l5.151-5.152h-1.3a.818.818,0,0,1-.813-.723l-.006-.1A.818.818,0,0,1,13,1.006l.1-.006Z" transform="translate(-2.006 -0.181)" fill="#5567d5" />
            <path id="Path" d="M8,0A.8.8,0,1,1,8,1.6,6.4,6.4,0,1,0,14.4,8,.8.8,0,1,1,16,8,8,8,0,1,1,8,0Z" fill="#ccd1f2" />
        </g>
    );

    switch (processType) {
        case 'Log':
        case 'Call':
            processTypeIndicator.push(
                <g>
                    {processType === 'Log' ? logIcon : callIcon}
                    <text id="new" transform="translate(242 548)" className="process-icon-text">
                        <tspan x="1" y="1">{processType.toLowerCase()}</tspan>
                    </text>
                </g>
            );
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
            {diagnostics?.diagnosticMsgs ?
            (
                <Tooltip type={"diagram-diagnostic"} onClick={openInCodeView} diagnostic={diagnostics} placement="right" arrow={true}>
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
            )
            :
            (
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
            )}
            </g>
        </svg>
    )
}
