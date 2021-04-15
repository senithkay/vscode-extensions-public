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

import {TooltipCodeSnippet} from "../Portals/ConfigForm/Elements/Tooltip";

export const TRIGGER_PARAMS_SVG_WIDTH_WITH_SHADOW = 104;
export const TRIGGER_PARAMS_SVG_HEIGHT_WITH_SHADOW = 31;
export const TRIGGER_PARAMS_SVG_WIDTH = 97;
export const TRIGGER_PARAMS_SVG_HEIGHT = 30;

export function TriggerParamsSVG(props: { x: number, y: number, text: any }) {
    const { text, ...xyProps } = props;
    return (
        <svg {...xyProps} width={TRIGGER_PARAMS_SVG_WIDTH_WITH_SHADOW} height={TRIGGER_PARAMS_SVG_HEIGHT_WITH_SHADOW} >
            <defs>
                <filter id="Rectangle_Copy_10" x="0" y="0" width="104" height="31" filterUnits="userSpaceOnUse">
                    <feOffset dy="1" in="SourceAlpha"/>
                    <feGaussianBlur stdDeviation="1" result="blur"/>
                    <feFlood flood-color="#a9acb6" flood-opacity="0.302"/>
                    <feComposite operator="in" in2="blur"/>
                    <feComposite in="SourceGraphic"/>
                </filter>
            </defs>
            <TooltipCodeSnippet content={text} placement="right" arrow={true}>
                <g id="Group" transform="translate(3.5 2.5)">
                    <g transform="matrix(1, 0, 0, 1, -3.5, -2.5)" filter="url(#Rectangle_Copy_10)">
                        <rect id="Rectangle_Copy_10-2" data-name="Rectangle Copy 10" width="97" height="24" rx="12" transform="translate(3.5 2.5)" fill="#f0f1fb" stroke="#fff" stroke-miterlimit="10" stroke-width="1"/>
                    </g>
                    <text className="trigger-params-text" transform="translate(48.5 12)">
                        <tspan
                            x="0"
                            y="2"
                            textAnchor="middle"
                            data-testid="trigger-params-text-block"
                        >
                            {text.length >= 18 ? text.slice(0, 15) + "..." : text}
                        </tspan>
                    </text>
                </g>
            </TooltipCodeSnippet>
        </svg>
    )
}
