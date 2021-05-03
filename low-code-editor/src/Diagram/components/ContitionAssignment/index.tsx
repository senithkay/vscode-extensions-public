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
import React from "react";

import classNames from "classnames";

import "./style.scss"

export let CONDITION_ASSIGNMENT_NAME_WIDTH = 125;

export function ContitionAssignment(props: { x: number, y: number, assignment: string, className?: string }) {
    const { assignment, className, ...xyProps } = props;

    const assignmentMaxWidth = assignment.length >= 15;
    const assignmentWidth = assignment.length * 8
    let assignmentX = 0;

    assignmentX = (assignmentWidth > CONDITION_ASSIGNMENT_NAME_WIDTH) ? CONDITION_ASSIGNMENT_NAME_WIDTH + (assignmentWidth / 4) : assignmentX = CONDITION_ASSIGNMENT_NAME_WIDTH - assignmentWidth;

    return (
        <svg {...xyProps}>
            <text
                className={classNames("assignment-text", className)}
                id="Assignment_text"
                transform="translate(0 11)"
            >
                <tspan x={assignmentX} y="0"> {assignmentMaxWidth ? assignment.slice(0, 16) + "..." : assignment} </tspan>
            </text>
        </svg>
    );
}
