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
import React, { ReactElement, useEffect, useState } from "react";

import { DefaultConfig } from "../../../../../visitors/default";

import "./style.scss";

export let STATEMENT_TYPE_WIDTH = 125;
export const ICON_SVG_WRAPPER_WIDTH = 25;

export function StatementTypes(props: { x: number, y: number, key_id: number, statementType: string }) {
    const { key_id, statementType, ...xyProps } = props;
    const [statementTextWidth, setStatementTextWidth] = useState(STATEMENT_TYPE_WIDTH);

    useEffect(() => {
        setStatementTextWidth(document.getElementById("statementLegnth_" + key_id).getBoundingClientRect().width);
    }, []);

    const statementTypeMaxWidth = 132;
    const statementWidth = statementTextWidth;
    const statmentTypeX = statementTypeMaxWidth - statementWidth;

    const statementRectPadding = 25;
    const statementTextPadding = DefaultConfig.dotGap;
    const statementRectwidth = statementWidth + statementRectPadding;
    const statementRectX = statementTypeMaxWidth - (statementWidth + (statementRectPadding / 4));

    const maxStatementRectX = statementRectwidth + statementTextPadding;

    const statmentTypeMaxWidth = statementType && statementType.length >= 12;
    const statementReactX = statmentTypeMaxWidth ?
        (statementRectX - statementTextPadding) : (statementRectX - statementTextPadding / 2);

    const statementTruncate = statmentTypeMaxWidth && statementType && statementType.slice(0, 10);

    const statementRect: ReactElement = (
        <g className="statement-text-wrapper">
            <rect
                width={statmentTypeMaxWidth ? maxStatementRectX : statementRectwidth}
                height="14"
                rx="4"
                stroke="none"
            />
            <rect
                x={statementReactX}
                y="0"
                width={statmentTypeMaxWidth ? maxStatementRectX : statementRectwidth}
                height="13.25"
                rx="3.625"
                fill="none"
            />
        </g>
    );
    const statementTruncateText: ReactElement = (
        <>
            {statementTruncate}
            <tspan x={statementTruncate + statementTextPadding} y="10" className="dottedText">
                ...
            </tspan>
        </>
    )

    return (
        <svg {...xyProps} width="150" height="24" className="statement-wrapper">
            <g>
                <text className="statement-name">
                    <tspan
                        x={statmentTypeMaxWidth ? statmentTypeX - statementTextPadding : statmentTypeX}
                        id={"statementLegnth_" + key_id}
                        y="10"
                    >
                        {statmentTypeMaxWidth ? statementTruncateText : statementType}
                    </tspan>
                </text>
                {statementType && statementType.length > 0 && statementRect}
            </g>
        </svg>
    );
}
