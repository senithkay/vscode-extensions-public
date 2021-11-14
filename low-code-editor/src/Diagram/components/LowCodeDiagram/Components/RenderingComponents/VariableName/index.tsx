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
// tslint:disable: jsx-no-multiline-js align  jsx-wrap-multiline
import React, { ReactElement, useEffect, useState } from "react";

import { PropertyIcon } from "../../../../../../assets/icons";
import Tooltip from '../../../../../../components/Tooltip';
import { DefaultConfig } from "../../../../../visitors/default";

import "./style.scss";

export let VARIABLE_NAME_WIDTH = 125;
export const ICON_SVG_WRAPPER_WIDTH = 25;

export function VariableName(props: { x: number, y: number, variableName: string, processType: string, key_id: number }) {
    const { processType, variableName, key_id, ...xyProps } = props;
    const [textWidth, setTextWidth] = useState(VARIABLE_NAME_WIDTH);

    useEffect(() => {
        setTextWidth(document.getElementById("variableLegnth_" + key_id).getBoundingClientRect().width);
    }, []);

    const variableMaxWidth = variableName.length >= 15;
    const variableWidth = textWidth
    let variableX = 0;

    variableX = (variableWidth > VARIABLE_NAME_WIDTH) ? variableWidth - ICON_SVG_WRAPPER_WIDTH : variableX = (VARIABLE_NAME_WIDTH - variableWidth - (DefaultConfig.dotGap * 2));

    const iconX = (variableWidth > 125) ? VARIABLE_NAME_WIDTH : VARIABLE_NAME_WIDTH - (variableWidth + ICON_SVG_WRAPPER_WIDTH);

    const variableTextComp: ReactElement = (
        <text id="getResponse" transform="translate(36 1)" className="variable-name">
            <tspan
                id={"variableLegnth_" + key_id}
                x={variableX}
                y="15"
            >
                {variableMaxWidth ? variableName.slice(0, 10) + "..." : variableName}
            </tspan>
        </text>
    );

    return (
        <svg {...xyProps} width="150" height="24" >
            {variableMaxWidth ?
                <Tooltip arrow={true} placement="top-start" title={variableName} inverted={false} interactive={true}>
                    {variableTextComp}
                </Tooltip>
                :
                variableTextComp
            }
            {processType === "Variable" &&
                (
                    <g id="Reactangle_wrapper" fill="#fff" stroke="#ccd1f2" strokeMiterlimit="10" strokeWidth="1" transform="translate(18 0)">
                        <rect x={iconX} width="24" height="24" rx="4" stroke="none" />
                        <rect x={iconX + 0.5} y="0.5" width="23" height="23" rx="3.5" fill="none" />
                    </g>
                )
            }
            < g id="Variable_icon" transform="translate(4 4)">
                {(processType === "Variable" || processType === "Action") && <PropertyIcon height={16} width={16} x={iconX + 18} y={0} transform="translate(0 0)" />}
            </g>
        </svg >
    );
}
