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
// tslint:disable: jsx-wrap-multiline
import React, { useContext } from "react";

import { Context as DiagramContext } from "../../../Contexts/Diagram";

import { EditIconSVG } from "./Hover/EditIconSVG";

export const START_SVG_WIDTH_WITH_SHADOW = 131;
export const START_SVG_HEIGHT_WITH_SHADOW = 63;
export const START_HOVER_SVG_WIDTH_WITH_SHADOW = 165;
export const START_HOVER_SVG_HEIGHT_WITH_SHADOW = 94;
export const START_SVG_WIDTH = 113;
export const START_SVG_HEIGHT = 49;
export const START_SVG_SHADOW_OFFSET = START_SVG_HEIGHT_WITH_SHADOW - START_SVG_HEIGHT;

export function StartSVG(props: {
    x: number,
    y: number,
    text: string,
    showIcon: boolean,
    handleDropDown?: () => void,
    handleEdit: () => void
}) {
    const { state } = useContext(DiagramContext);
    const { isMutationProgress, isWaitingOnWorkspace, isReadOnly } = state;
    const { text, showIcon, handleDropDown, handleEdit, ...xyProps } = props;

    return (
        <svg {...xyProps} width={START_HOVER_SVG_WIDTH_WITH_SHADOW} height={START_HOVER_SVG_HEIGHT_WITH_SHADOW} >
            <defs>
                <filter id="StartFilterDefault" x="-10" y="0" width="131" height="67" filterUnits="userSpaceOnUse">
                    <feOffset dy="2" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feFlood floodColor="#a9acb6" floodOpacity="0.722" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
                <filter id="StartFilterHover" x="-20" y="-20" width="158" height="94" filterUnits="userSpaceOnUse">
                    <feOffset dy="1" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="7.5" result="blur" />
                    <feFlood floodColor="#a9acb6" floodOpacity="0.478" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
                <filter id="StartFilterClick" x="0" y="0" width="158" height="94" filterUnits="userSpaceOnUse">
                    <feOffset dy="1" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                    <feFlood floodColor="#a9acb6" floodOpacity="0.722" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>

            </defs>
            <g id="Start" className="start-button" transform="translate(0 1)" >
                <g transform="matrix(1, 0, 0, 1, 0, -1)" className="start-button-rect">
                    <rect id="StartRectangle" width="105" height="49" rx="24.5" transform="translate(10 7)" />
                </g>
                <text id="StartText" transform="translate(10 7)" x="55" y="27" >
                    <tspan className="start-text">
                        {text}
                    </tspan>
                </text>
                {!isMutationProgress && !isWaitingOnWorkspace && (<>
                    {(!isReadOnly) && (<g className="start-options-wrapper">
                        <rect className="start-rect" x={20} y={13} width="80" height="35" />
                        <g >
                            <EditIconSVG x={46} y={15} onClick={handleEdit} />
                        </g>
                    </g>)}
                </>)
                }
            </g>
        </svg>
    )
}
