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

import React, { ReactNode } from "react";

import { ErrorSnippet } from "../../../../Types/type";
// import Tooltip from "../../../../../../../components/TooltipV2";
// import { ErrorSnippet } from "../../../../../../../DiagramGenerator/generatorUtil";


interface ConnectorRectSVGProps {
    type?: string,
    className?: string,
    onClick?: () => void,
    text?: { heading?: string, content?: string, example?: string, code?: string },
    diagnostic?: ErrorSnippet,
    icon?: ReactNode;
}

export function ConnectorRectSVG(props: ConnectorRectSVGProps) {
    const { type, onClick, diagnostic, text } = props;
    const diagnosticStyles = diagnostic?.severity === "ERROR" ? "connector-process-error " : "connector-process-warning";
    const connectorRectStyles = diagnostic ? diagnosticStyles : "connector-process-default"
    return (
        // <Tooltip type={type} onClick={onClick} text={text} diagnostic={diagnostic} placement="right" arrow={true}>
            <g id="Group_2_Copy_2" className={connectorRectStyles} transform="translate(5 1)" >
                <g transform="matrix(1, 0, 0, 1, -3, -5.5)">
                    <g id="Rectangle_Copy_17-2" transform="translate(1 5.5)" className="connector-process">
                        <rect width="48" height="48" rx="4" />
                        <rect x="-0.5" y="-0.5" width="49" height="49" rx="4.5"/>
                    </g>
                </g>
                <text id="new" transform="translate(10.25 27.5)" className="connector-text">
                    <tspan x="0" y="0">new</tspan>
                </text>
            </g>
        // </Tooltip>
    )
}
