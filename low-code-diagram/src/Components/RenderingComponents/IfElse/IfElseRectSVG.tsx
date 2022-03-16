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

import { STNode } from "@wso2-enterprise/syntax-tree";
import React, { ReactElement, ReactNode, useContext, useEffect, useState } from "react";
import { DiagramTooltipCodeSnippet } from "../../../../../low-code-ui-components";

import { Context } from "../../../Context/diagram";
import { ErrorSnippet } from "../../../Types/type";
interface IfElseRectSVGProps {
    type?: string,
    className?: string,
    onClick?: () => void,
    text?: { heading?: string, content?: string, example?: string, code?: string },
    icon?: ReactNode;
    STNode: STNode
}

export function IfElseRectSVG(props: IfElseRectSVGProps) {
    const { onClick, icon, className, STNode } = props;
    const diagramContext = useContext(Context);
    const showTooltip = diagramContext?.api?.edit?.showTooltip;
    const [tooltip, setTooltip] = useState(undefined);
    const [diagTooltip, setDiagTooltip] = useState(undefined);

    const component = (
        <g id="IfElse" className={className} transform="translate(7 6)">
            <g transform="matrix(1, 0, 0, 1, -7, -6)" >
                <g id="IfElsePolygon" transform="translate(33.5, 3) rotate(45)">
                    <rect width="40.903" height="40.903" className="if-else-rect" rx="6" stroke="none" />
                    <rect x="0.5" y="0.5" width="39.903" className="if-else-rect click-effect" height="39.903" rx="5.5" fill="none" />
                </g>
            </g>
            {icon}
        </g>
    );

    const defaultTooltip = (
        <DiagramTooltipCodeSnippet STNode={STNode} onClick={onClick} >{component}</DiagramTooltipCodeSnippet>
    );
    useEffect(() => {
        if (STNode && showTooltip) {
            setDiagTooltip(showTooltip(component, onClick, STNode,));
        }
        return () => {
            setTooltip(undefined);
            setDiagTooltip(undefined);
        };
    }, [STNode]);

    return (
        <>
            {defaultTooltip}
        </>
    );
}
