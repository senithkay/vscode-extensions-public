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
import * as React from "react";

import { ArrowHead } from "../../ArrowHead";

export interface ActionInvoLineProps {
    clientInvoX: number,
    clientInvoY: number,
    actionX: number,
    actionY: number,
    direction: "left" | "right",
    className: string
}

export function ActionInvoLineC(props: ActionInvoLineProps) {
    const { clientInvoX, clientInvoY, actionX, actionY, direction, className } = props;

    return (
        <g>
            <line x1={clientInvoX} y1={clientInvoY} x2={actionX} y2={actionY} className={className}/>
            <ArrowHead x={actionX} y={actionY} direction={direction} />
        </g>
    );
}

export const ActionInvoLine = ActionInvoLineC;
