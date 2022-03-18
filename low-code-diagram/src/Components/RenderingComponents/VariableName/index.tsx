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
import React, { ReactElement, useContext, useEffect, useState } from "react";

import { Context } from "../../../Context/diagram";
import { DefaultConfig } from "../../../Visitors/default";
import { DefaultTooltip } from "../DefaultTooltip";

import "./style.scss";

export let VARIABLE_NAME_WIDTH = 125;
export const ICON_SVG_WRAPPER_WIDTH = 25;

export function VariableName(props: { x: number, y: number, variableName: string, processType?: string, key_id: number }) {
    const { processType, variableName, key_id, ...xyProps } = props;
    const [textWidth, setTextWidth] = useState(VARIABLE_NAME_WIDTH);
    const diagramContext = useContext(Context);
    const showTooltip = diagramContext?.api?.edit?.showTooltip;
    const [tooltip, setTooltip] = useState(undefined);

    useEffect(() => {
        setTextWidth(document.getElementById("variableLegnth_" + key_id).getBoundingClientRect().width);
    }, []);

    const variableMaxWidth = variableName.length >= 15;
    const variableWidth = textWidth
    let variableX = 0;


    variableX = (variableWidth > VARIABLE_NAME_WIDTH) ? variableWidth - ICON_SVG_WRAPPER_WIDTH : variableX = (VARIABLE_NAME_WIDTH - variableWidth - (DefaultConfig.dotGap * 2));

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

    const defaultTooltip = (
        <DefaultTooltip text={{ heading: variableName }}>{variableTextComp}</DefaultTooltip>
    );

    useEffect(() => {
        if (variableName && showTooltip) {
            setTooltip(showTooltip(variableTextComp, "heading-content", { heading: variableName }, "top-start", true, undefined, undefined, false, undefined, {
                inverted: false,
                interactive: true
            }));
        }
        setTextWidth(document.getElementById("variableLegnth_" + key_id).getBoundingClientRect().width);
    }, [variableName]);

    return (
        <svg {...xyProps} width="150" height="50" className="variable-wrapper">
            {/* {tooltip ? tooltip : defaultTooltip} */}
            {/* {variableTextComp} */}
            {defaultTooltip}
        </svg >
    );
}
