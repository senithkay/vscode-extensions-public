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

import { STNode } from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../Context/diagram";
import { ErrorSnippet } from "../../../Types/type";

import "./style.scss"
import { DefaultTooltip } from "../DefaultTooltip";

interface ProcessRectSVGProps {
    type?: string,
    className?: string,
    onClick?: () => void,
    text?: { heading?: string, content?: string, example?: string, code?: string },
    diagnostic?: ErrorSnippet,
    processTypeIndicator?: JSX.Element[];
    model: STNode
}

export function ProcessRectSVG(props: ProcessRectSVGProps) {
    const { type, onClick, diagnostic, processTypeIndicator, text, className, model } = props;
    const diagramContext = useContext(Context);
    const showTooltip = diagramContext?.api?.edit?.showTooltip;
    const diagnosticStyles = diagnostic?.severity === "ERROR" ? "data-processor-error" : "data-processor-warning";
    const processRectStyles = diagnostic.diagnosticMsgs ? diagnosticStyles : "data-processor process-active"
    const [tooltipComp, setTooltipComp] = useState(undefined);
    const sourceSnippet = model?.source;

    const rectSVG = (
        <g id="Process" className={processRectStyles} transform="translate(-221.5 -506)">
            <g transform="matrix(1, 0, 0, 1, 222, 509)">
                <g id="ProcessRect-2" transform="translate(5.5 4)">
                    <rect width="48" height="48" rx="4" />
                    <rect x="-0.5" y="-0.5" width="49" height="49" rx="4.5" className="click-effect" />
                </g>
            </g>
            {processTypeIndicator}
        </g>
    );

    const defaultTooltip = (
        <DefaultTooltip text={sourceSnippet}>{rectSVG}</DefaultTooltip>
    );

    useEffect(() => {
        if (model && showTooltip) {
            setTooltipComp(showTooltip(rectSVG, undefined, onClick, model));
        }
    }, [model]);

    return (
        <>
            {tooltipComp ? tooltipComp : defaultTooltip}
        </>
    );
}
