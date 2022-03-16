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

import classNames from "classnames";

import { Context } from "../../../Context/diagram";
import { DefaultConfig } from "../../../Visitors/default";
import { DefaultTooltip } from "../DefaultTooltip";

import "./style.scss"

export let CONDITION_ASSIGNMENT_NAME_WIDTH = 125;

export function ConditionAssignment(props: { x: number, y: number, assignment: string, className?: string, key_id: number }) {
    const { assignment, className, key_id, ...xyProps } = props;
    const [textWidth, setTextWidth] = useState(CONDITION_ASSIGNMENT_NAME_WIDTH);
    const diagramContext = useContext(Context);
    const showTooltip = diagramContext?.api?.edit?.showTooltip;
    const [tooltip, setTooltip] = useState(undefined);

    useEffect(() => {
        setTextWidth(document.getElementById("textLegnth_" + key_id)?.getBoundingClientRect().width);
    }, []);

    const assignmentMaxWidth = assignment?.length >= 15;
    const assignmentWidth = textWidth
    let assignmentX = 0;

    assignmentX = (assignmentWidth > CONDITION_ASSIGNMENT_NAME_WIDTH) ? CONDITION_ASSIGNMENT_NAME_WIDTH - DefaultConfig.dotGap : assignmentX = (CONDITION_ASSIGNMENT_NAME_WIDTH - assignmentWidth - (DefaultConfig.dotGap * 2));
    const assignemtComponant: ReactElement = (
        <text
            className={classNames("assignment-text", className)}
            id="Assignment_text"
            transform="translate(15 11)"
        >
            <tspan x={assignmentX} y="0" id={"textLegnth_" + key_id}>  {assignmentMaxWidth ? assignment.slice(0, 16) + "..." : assignment} </tspan>
        </text>
    );

    //TODO:Add new tooltip component to support this scenario
    // const defaultTooltip = (
    //     <DefaultTooltip text={{ heading: assignment }}>{assignemtComponant}</DefaultTooltip>
    // );

    // useEffect(() => {
    //     if (assignmentMaxWidth && showTooltip) {
    //         setTooltip(showTooltip(assignemtComponant, "heading", { heading: assignment }, "top-start", true, undefined, undefined, false, undefined, {
    //             inverted: false,
    //             interactive: true
    //         }));
    //     }
    // }, [assignment]);

    return (
        <svg {...xyProps}>
            {assignemtComponant}
        </svg >
    );
}
