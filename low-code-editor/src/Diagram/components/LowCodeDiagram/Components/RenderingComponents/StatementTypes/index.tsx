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
    const statementtextPadding = DefaultConfig.dotGap;
    const statementRectwidth = statementWidth + statementRectPadding;
    const statementRectX = statementTypeMaxWidth - (statementWidth + (statementRectPadding / 3));

    const maxStatementRectX = statementRectwidth + (statementtextPadding * 2);

    const statmentTypeMaxWidth = statementType.length >= 12;

    const statementRect: ReactElement = (
        <g className="statement-text-wrapper">
            <rect width={statmentTypeMaxWidth ? maxStatementRectX : statementRectwidth} height="14" rx="4" stroke="none" />
            <rect x={statmentTypeMaxWidth ? statementRectX - statementtextPadding : statementRectX} y="0" width={statmentTypeMaxWidth ? maxStatementRectX : statementRectwidth} height="13.25" rx="3.625" fill="none" />
        </g>
    );

    return (
        <svg {...xyProps} width="150" height="24" className="statement-wrapper">
            <g>
                <text className="statement-name">
                    <tspan x={statmentTypeMaxWidth ? statmentTypeX - statementtextPadding : statmentTypeX} id={"statementLegnth_" + key_id} y="10">
                        {statmentTypeMaxWidth ? statementType.slice(0, 12) + "..." : statementType}
                    </tspan>
                </text>
                {statementType.length > 0 && statementRect}
            </g>
        </svg >
    );
}
