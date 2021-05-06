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
import React, { useEffect, useState } from "react";

import classNames from "classnames";

import { DefaultConfig } from "../../visitors/default";

import "./style.scss"

export let ASSIGNMENT_NAME_WIDTH = 125;

export function Assignment(props: { x: number, y: number, assignment: string, className?: string, key_id: number}) {
    const { assignment, className, key_id, ...xyProps } = props;
    const [textWidth, setTextWidth] = useState(ASSIGNMENT_NAME_WIDTH);
    useEffect(() => {
        setTextWidth(document.getElementById("textLegnth_" + key_id).getBoundingClientRect().width);
    }, []);

    const assignmentMaxWidth = assignment?.length >= 15;
    const assignmentWidth = textWidth

    return (
        <svg {...xyProps}>
            <text
                className={classNames("assignment-text", className)}
                id="Assignment_text"
                transform="translate(0 11)"
            >
                <tspan x="0" y="0" id={"textLegnth_" + key_id}>{assignmentMaxWidth ? assignment.slice(0, 16) + "..." : assignment}</tspan>
            </text>
        </svg>
    );
}
