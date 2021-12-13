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

import React, { ReactNode }  from "react";

import Tooltip from "../../../../../../components/TooltipV2";
import { ErrorSnippet } from "../../../../../../DiagramGenerator/generatorUtil";

interface IfElseRectSVGProps {
    type?: string,
    className?: string,
    onClick?: () => void,
    text?: { heading?: string, content?: string, example?: string, code?: string },
    diagnostic?: ErrorSnippet,
    icon?: ReactNode;
}

export function IfElseRectSVG(props: IfElseRectSVGProps) {
const {type, onClick, diagnostic, icon, text, className} = props;
return (
        <Tooltip type={type} onClick={onClick} text={text} diagnostic={diagnostic} placement="right" arrow={true}>
        <g id="IfElse" className={className} transform="translate(7 6)">
                    <g transform="matrix(1, 0, 0, 1, -7, -6)" >
                        <g id="IfElsePolygon" transform="translate(33.5, 3) rotate(45)">
                            <rect width="40.903" height="40.903" className="if-else-rect" rx="6" stroke="none" />
                            <rect x="0.5" y="0.5" width="39.903" className="if-else-rect click-effect" height="39.903" rx="5.5" fill="none" />
                        </g>
                    </g>
                    {icon}
                </g>
            </Tooltip>
    )
}
