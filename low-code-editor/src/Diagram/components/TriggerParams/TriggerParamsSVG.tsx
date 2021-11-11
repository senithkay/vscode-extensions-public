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

import Tooltip from "../../../components/TooltipV2";

export const TRIGGER_PARAMS_SVG_WIDTH_WITH_SHADOW = 110;
export const TRIGGER_PARAMS_SVG_HEIGHT_WITH_SHADOW = 30;
export const TRIGGER_PARAMS_SVG_WIDTH = 99;
export const TRIGGER_PARAMS_SVG_HEIGHT = 24;

export function TriggerParamsSVG(props: { x: number, y: number, text: any }) {
    const { text, ...xyProps } = props;
    const tooltipText = {
        code: text
    }
    return (
        <svg {...xyProps} width={TRIGGER_PARAMS_SVG_WIDTH_WITH_SHADOW} height={TRIGGER_PARAMS_SVG_HEIGHT_WITH_SHADOW} >
            <Tooltip type={"truncate-code"} text={tooltipText} placement="right" arrow={true}>
                <g id="Trigger-Params" transform="translate(3.5 2.5)">
                    <g id="Trigger-Params-wrapper" transform="translate(-1038.5 -145.5)">
                        <g id="Rectangle" transform="translate(1038.5 145.5)" fill="#fff" stroke="#ccd1f2" strokeMiterlimit="10" strokeWidth="1">
                            <rect width="99" height="24" rx="4" stroke="none" />
                            <rect x="0.5" y="0.5" width="98" height="23" rx="3.5" fill="none" />
                        </g>
                        <text id="Trigger-Params-text" className="trigger-params-text" transform="translate(1087.5 160.5)" >
                            <tspan x="0" y="0" textAnchor="middle" data-testid="trigger-params-text-block"> {text.length >= 18 ? text.slice(0, 15) + "..." : text} </tspan>
                        </text>
                    </g>
                </g>
            </Tooltip>
        </svg>
    )
}
