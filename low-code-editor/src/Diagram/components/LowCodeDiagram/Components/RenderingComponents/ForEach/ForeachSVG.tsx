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

import Tooltip from "../../../../../../components/TooltipV2";
import { ErrorSnippet } from "../../../../../../DiagramGenerator/generatorUtil";

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
             <Tooltip type={"diagram-diagnostic"} onClick={openInCodeView} diagnostic={diagnostics} placement="right" arrow={true}>
             <g id="Foreach" className="foreach-group" transform="translate(7 6)">
                 <g transform="matrix(1, 0, 0, 1, -7, -6)" >
                     <g id="IfElsePolygon" transform="translate(33.5, 3) rotate(45)">
                         <rect width="40.903" height="40.903" className="for-each-rect" rx="6" stroke="none" />
                         <rect x="0.5" y="0.5" width="39.903" className="for-each-rect click-effect" height="39.903" rx="5.5" fill="none" />
                     </g>
                 </g>
                 <g id="Foreach_icon" transform="translate(17, 15)">
                     <path id="Combined_Shape" d="M6.29,14.71a1,1,0,0,1-.083-1.32l.083-.094L7.585,12H6A6,6,0,0,1,5.775,0L6,0a1,1,0,0,1,.116,1.993L6,2a4,4,0,0,0-.2,8L6,10H7.586L6.29,8.7a1,1,0,0,1-.083-1.32l.083-.094a1,1,0,0,1,1.32-.084l.095.084,3,3,.009.009.7.7-.692.693-.03.03L7.7,14.71a1,1,0,0,1-1.415,0Z" transform="translate(0 4)" fill="#5567d5" />
                     <path id="Combined_Shape-2" d="M6.29,14.71a1,1,0,0,1-.083-1.32l.083-.094L7.585,12H6A6,6,0,0,1,5.775,0L6,0a1,1,0,0,1,.116,1.993L6,2a4,4,0,0,0-.2,8L6,10H7.586L6.29,8.7a1,1,0,0,1-.083-1.32l.083-.094a1,1,0,0,1,1.32-.084l.095.084,3,3,.009.009.7.7-.692.693-.03.03L7.7,14.71a1,1,0,0,1-1.415,0Z" transform="translate(19.914 16.002) rotate(-180)" fill="#ccd1f2" />
                 </g>
             </g>
         </Tooltip>
         )
         :
         (
            <Tooltip type={"diagram-code"} onClick={openInCodeView} text={tooltipText} placement="right" arrow={true}>

                <g id="Foreach" className="foreach-group" transform="translate(7 6)">
                    <g transform="matrix(1, 0, 0, 1, -7, -6)" >
                        <g id="IfElsePolygon" transform="translate(33.5, 3) rotate(45)">
                            <rect width="40.903" height="40.903" className="for-each-rect" rx="6" stroke="none" />
                            <rect x="0.5" y="0.5" width="39.903" className="for-each-rect click-effect" height="39.903" rx="5.5" fill="none" />
                        </g>
                    </g>
                    <g id="Foreach_icon" transform="translate(17, 15)">
                        <path id="Combined_Shape" d="M6.29,14.71a1,1,0,0,1-.083-1.32l.083-.094L7.585,12H6A6,6,0,0,1,5.775,0L6,0a1,1,0,0,1,.116,1.993L6,2a4,4,0,0,0-.2,8L6,10H7.586L6.29,8.7a1,1,0,0,1-.083-1.32l.083-.094a1,1,0,0,1,1.32-.084l.095.084,3,3,.009.009.7.7-.692.693-.03.03L7.7,14.71a1,1,0,0,1-1.415,0Z" transform="translate(0 4)" fill="#5567d5" />
                        <path id="Combined_Shape-2" d="M6.29,14.71a1,1,0,0,1-.083-1.32l.083-.094L7.585,12H6A6,6,0,0,1,5.775,0L6,0a1,1,0,0,1,.116,1.993L6,2a4,4,0,0,0-.2,8L6,10H7.586L6.29,8.7a1,1,0,0,1-.083-1.32l.083-.094a1,1,0,0,1,1.32-.084l.095.084,3,3,.009.009.7.7-.692.693-.03.03L7.7,14.71a1,1,0,0,1-1.415,0Z" transform="translate(19.914 16.002) rotate(-180)" fill="#ccd1f2" />
                    </g>
                </g>
            </Tooltip>
        )}
        </svg>
    )
}
