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
import React, { ReactNode, useContext, useEffect, useState } from "react";

import { Context } from "../../../Context/diagram";
import { ErrorSnippet } from "../../../Types/type";
import { DefaultTooltip } from "../DefaultTooltip";

interface ReturnRectSVGProps {
    type?: string,
    className?: string,
    onClick?: () => void,
    text?: { heading?: string, content?: string, example?: string, code?: string },
    diagnostic?: ErrorSnippet,
    icon?: ReactNode;
}


export function ReturnRectSVG(props: ReturnRectSVGProps) {
    const { type, onClick, diagnostic, text } = props;
    const diagnosticStyles = diagnostic?.severity === "ERROR" ? "return-comp-error" : "return-comp-warning";
    const returnRectStyles = diagnostic ? diagnosticStyles : "return-comp";
    const diagramContext = useContext(Context);
    const showTooltip = diagramContext?.api?.edit?.showTooltip;
    const [tooltip, setTooltip] = useState(undefined);
    const [diagTooltip, setDiagTooltip] = useState(undefined);

    const rectSVG = (
        <g className={returnRectStyles} transform="translate(7 6)">
            <g transform="matrix(1, 0, 0, 1, -14, -9)">
                <g id="Rectangle-2" transform="translate(7 6)">
                    <rect width="82" height="32" rx="16" stroke="none" />
                    <rect x="-0.5" y="-0.5" width="83" height="33" rx="16.5" fill="none" className="click-effect" />
                </g>
            </g>
            <g>
                <text transform="translate(26 17)" >
                    <tspan x="0" y="0">return</tspan>
                </text>
                <g id="returnIcon" transform="translate(17 10)" className="return-icon">
                    <path d="M-3.5,0-7,4H0Z" transform="translate(-11 -0.5) rotate(-90)" />
                    <path d="M-7,.5H0" transform="translate(0 3)" />
                </g>
            </g>
        </g>
    );

    const defaultTooltip = (
        <DefaultTooltip text={text} diagnostic={diagnostic}>{rectSVG}</DefaultTooltip>
    );

    // TODO: Check how we can optimize this by rewriting the tooltip
    // component.
    useEffect(() => {
        if (text && showTooltip) {
            setTooltip(showTooltip(rectSVG, type, text, "right", true, undefined, undefined, false, onClick));
        }
        return () => {
            setTooltip(undefined);
            setDiagTooltip(undefined);
        };
    }, [text]);

    useEffect(() => {
        if (diagnostic && showTooltip) {
            setDiagTooltip(showTooltip(rectSVG, type, undefined, "right", true, diagnostic, undefined, false, onClick));
        }
        return () => {
            setTooltip(undefined);
            setDiagTooltip(undefined);
        };
    }, [diagnostic]);

    return (
        <>
            {tooltip ? tooltip : defaultTooltip}
            {diagTooltip ? diagTooltip : defaultTooltip}
        </>
    );
}
