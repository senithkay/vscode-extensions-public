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
import React, { useContext, useEffect, useState } from "react";

import { Context } from "../../../Context/diagram";
import { ErrorSnippet } from "../../../Types/type";
import { DefaultTooltip } from "../DefaultTooltip";

interface ForEachRectSVGProps {
    type?: string,
    className?: string,
    onClick?: () => void,
    text?: { heading?: string, content?: string, example?: string, code?: string },
    diagnostic?: ErrorSnippet,
}

export function ForEachRectSVG(props: ForEachRectSVGProps) {
    const { type, onClick, text, diagnostic } = props;
    const diagnosticStyles = diagnostic?.severity === "ERROR" ? "foreach-block-error" : "foreach-block-warning";
    const forEachRectStyles = diagnostic ? diagnosticStyles : "foreach-block";
    const diagramContext = useContext(Context);
    const showTooltip = diagramContext?.api?.edit?.showTooltip;
    const [tooltip, setTooltip] = useState(undefined);
    const [diagTooltip, setDiagTooltip] = useState(undefined);

    const svgElement = (
        <g id="Foreach" className={forEachRectStyles} transform="translate(7 6)">
            <g transform="matrix(1, 0, 0, 1, -7, -6)" >
                <g id="ForeachPolygon" className="foreach-polygon" transform="translate(33.5, 3) rotate(45)">
                    <rect width="40.903" height="40.903" className="for-each-rect" rx="6" stroke="none" />
                    <rect x="0.5" y="0.5" width="39.903" className="for-each-rect click-effect" height="39.903" rx="5.5" fill="none" />
                </g>
            </g>
            <g className="foreach-icon" id="Foreach_icon" transform="translate(17, 15)">
                <path className="for-each-rect-icon-shape-1" id="Combined_Shape" d="M6.29,14.71a1,1,0,0,1-.083-1.32l.083-.094L7.585,12H6A6,6,0,0,1,5.775,0L6,0a1,1,0,0,1,.116,1.993L6,2a4,4,0,0,0-.2,8L6,10H7.586L6.29,8.7a1,1,0,0,1-.083-1.32l.083-.094a1,1,0,0,1,1.32-.084l.095.084,3,3,.009.009.7.7-.692.693-.03.03L7.7,14.71a1,1,0,0,1-1.415,0Z" transform="translate(0 4)" />
                <path className="for-each-rect-icon-shape-2" id="Combined_Shape-2" d="M6.29,14.71a1,1,0,0,1-.083-1.32l.083-.094L7.585,12H6A6,6,0,0,1,5.775,0L6,0a1,1,0,0,1,.116,1.993L6,2a4,4,0,0,0-.2,8L6,10H7.586L6.29,8.7a1,1,0,0,1-.083-1.32l.083-.094a1,1,0,0,1,1.32-.084l.095.084,3,3,.009.009.7.7-.692.693-.03.03L7.7,14.71a1,1,0,0,1-1.415,0Z" transform="translate(19.914 16.002) rotate(-180)" />
            </g>
        </g>
    );

    const defaultTooltip = (
        <DefaultTooltip text={text} diagnostic={diagnostic}>{svgElement}</DefaultTooltip>
    );

    // TODO: Check how we can optimize this by rewriting the tooltip
    // component.
    useEffect(() => {
        if (text && showTooltip) {
            setTooltip(showTooltip(svgElement, type, text, "right", true, undefined, undefined, false, onClick));
        }
        return () => {
            setTooltip(undefined);
            setDiagTooltip(undefined);
        };
    }, [text]);

    useEffect(() => {
        if (diagnostic && showTooltip) {
            setDiagTooltip(showTooltip(svgElement, type, undefined, "right", true, diagnostic, undefined, false, onClick));
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
    )
}
