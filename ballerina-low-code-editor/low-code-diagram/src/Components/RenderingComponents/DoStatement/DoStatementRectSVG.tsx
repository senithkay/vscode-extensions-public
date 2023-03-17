/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */
import React, { useContext, useEffect, useState } from "react";

import { STNode } from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../Context/diagram";
import { ErrorSnippet } from "../../../Types/type";
import { DefaultTooltip } from "../DefaultTooltip";

interface DoStatementRectSVGProps {
    type?: string,
    className?: string,
    onClick?: () => void,
    text?: { heading?: string, content?: string, example?: string, code?: string },
    diagnostic?: ErrorSnippet,
    model: STNode
}

export function DoStatementRectSVG(props: DoStatementRectSVGProps) {
    const { onClick, diagnostic, model } = props;
    const diagnosticStyles = diagnostic?.severity === "ERROR" ? "do-statement-block-error" : "foreach-block-warning";
    const doStatementRectStyles = diagnostic?.diagnosticMsgs ? diagnosticStyles : "do-statement-block";
    const diagramContext = useContext(Context);
    const showTooltip = diagramContext?.api?.edit?.showTooltip;
    const [tooltipComp, setTooltipComp] = useState(undefined);
    const sourceSnippet = "";

    const svgElement = (
        <g id="DoStatement" className={doStatementRectStyles} transform="translate(7 6)">
            <g transform="matrix(1, 0, 0, 1, -7, -6)" >
                <g id="DoStatementPolygon" className="do-statement-polygon" transform="translate(33.5, 3) rotate(45)">
                    <rect width="40.903" height="40.903" className="do-statement-rect" rx="6" stroke="none" />
                    <rect x="0.5" y="0.5" width="39.903" className="do-statement-rect click-effect" height="39.903" rx="5.5" fill="none" />
                </g>
            </g>
            <g className="do-statement-icon" id="DoStatement_icon" transform="translate(17, 15)">
                <path className="do-statement-rect-icon-shape-1" id="Combined_Shape" d="M6.29,14.71a1,1,0,0,1-.083-1.32l.083-.094L7.585,12H6A6,6,0,0,1,5.775,0L6,0a1,1,0,0,1,.116,1.993L6,2a4,4,0,0,0-.2,8L6,10H7.586L6.29,8.7a1,1,0,0,1-.083-1.32l.083-.094a1,1,0,0,1,1.32-.084l.095.084,3,3,.009.009.7.7-.692.693-.03.03L7.7,14.71a1,1,0,0,1-1.415,0Z" transform="translate(0 4)" />
                <path className="do-statement-rect-icon-shape-2" id="Combined_Shape-2" d="M6.29,14.71a1,1,0,0,1-.083-1.32l.083-.094L7.585,12H6A6,6,0,0,1,5.775,0L6,0a1,1,0,0,1,.116,1.993L6,2a4,4,0,0,0-.2,8L6,10H7.586L6.29,8.7a1,1,0,0,1-.083-1.32l.083-.094a1,1,0,0,1,1.32-.084l.095.084,3,3,.009.009.7.7-.692.693-.03.03L7.7,14.71a1,1,0,0,1-1.415,0Z" transform="translate(19.914 16.002) rotate(-180)" />
            </g>
        </g>
    );


    const defaultTooltip = (
        <DefaultTooltip text={sourceSnippet}>{svgElement}</DefaultTooltip>
    );

    useEffect(() => {
        if (model && showTooltip) {
            setTooltipComp(showTooltip(svgElement, undefined, onClick, model));
        }
    }, [model]);

    return (
        <>
            {tooltipComp ? tooltipComp : defaultTooltip}
        </>
    )
}
