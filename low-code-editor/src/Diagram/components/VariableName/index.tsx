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

import { PropertyIcon } from "../../../assets/icons";
import Tooltip from '../../../components/Tooltip';
import { DefaultConfig } from "../../visitors/default";

import "./style.scss";

export let VARIABLE_NAME_WIDTH = 125;
export const ICON_SVG_WRAPPER_WIDTH = 25;

export function VariableName(props: { x: number, y: number, variableName: string, processType: string, key_id: number, statementType?: string }) {
    const { processType, variableName, key_id, statementType, ...xyProps } = props;
    const [textWidth, setTextWidth] = useState(VARIABLE_NAME_WIDTH);
    const [statementTextWidth, setStatementTextWidth] = useState(VARIABLE_NAME_WIDTH);

    useEffect(() => {
        setTextWidth(document.getElementById("variableLegnth_" + key_id).getBoundingClientRect().width);
        setStatementTextWidth(document.getElementById("statementLegnth_" + key_id).getBoundingClientRect().width);
    }, []);

    const variableMaxWidth = variableName.length >= 15;
    const variableWidth = textWidth
    let variableX = 0;

    const statementTypeMaxWidth = 132;
    const statementWidth = statementTextWidth;
    const statmentTypeX = statementTypeMaxWidth - statementWidth;

    const statementRectPadding = 20;
    const statementRectwidth = statementWidth + statementRectPadding;
    const statementRectX = statementTypeMaxWidth - (statementWidth + (statementRectPadding / 3));

    variableX = (variableWidth > VARIABLE_NAME_WIDTH) ? variableWidth - ICON_SVG_WRAPPER_WIDTH : variableX = (VARIABLE_NAME_WIDTH - variableWidth - (DefaultConfig.dotGap * 2));

    const iconX = (variableWidth > 125) ? VARIABLE_NAME_WIDTH : VARIABLE_NAME_WIDTH - (variableWidth + ICON_SVG_WRAPPER_WIDTH);

    const variableTextComp: ReactElement = (
        <text id="getResponse" transform="translate(36 1)" className="variable-name">
            <tspan
                id={"variableLegnth_" + key_id}
                x={variableX}
                y="25"
            >
                {variableMaxWidth ? variableName.slice(0, 10) + "..." : variableName}
            </tspan>
        </text>
    );

    const statementTextComp: ReactElement = (
        <g>
            <text className="statement-name">
                <tspan x={statmentTypeX} id={"statementLegnth_" + key_id} y="10">
                    {statementType}
                </tspan>
            </text>
            <g className="statement-text-wrapper">
                <rect width={statementWidth} height="14" rx="4" stroke="none" />
                <rect x={statementRectX} y="0" width={statementRectwidth} height="13.25" rx="3.625" fill="none" />
            </g>
        </g>
    );

    return (
        <svg {...xyProps} width="150" height="24" className="variable-wrapper">
            {variableMaxWidth ?
                <Tooltip arrow={true} placement="top-start" title={variableName} inverted={false} interactive={true}>
                    {variableTextComp}
                </Tooltip>
                :
                variableTextComp
            }
            {statementTextComp}
        </svg >
    );
}
