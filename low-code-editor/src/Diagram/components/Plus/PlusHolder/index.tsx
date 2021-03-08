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
// tslint:disable: jsx-no-multiline-js
import React from "react";

import cn from "classnames";

import { PlusViewState } from "../../../view-state";
import { DefaultConfig } from "../../../visitors/default";

// import { DottedConditionSVG, DOTTED_CONDITION_SVG_WIDTH, DOTTED_CONDITION_SVG_WIDTH_WITH_SHADOW } from "./DottedConditionSVG";
import { DottedConnectorSVG /*, DOTTED_CONNECTOR_SVG_WIDTH, DOTTED_CONNECTOR_SVG_WIDTH_WITH_SHADOW */ } from "./DottedConnectorSVG";
import { DottedProcessSVG, DOTTED_PROCESS_SVG_WIDTH, DOTTED_PROCESS_SVG_WIDTH_WITH_SHADOW } from "./DottedProcessSVG";
import { DOTTED_STOP_SVG_WIDTH, /* DottedStopSVG, DOTTED_STOP_SVG_WIDTH_WITH_SHADOW */ } from "./DottedStopSVG";
import "./style.scss"

export const PLUS_HOLDER_HEIGHT = 121;
export const PLUS_HOLDER_WIDTH = 385;

const defaultConf = DefaultConfig.plusHolder;

export interface PlusHolderProps {
    x: number,
    y: number,
    initPlus: boolean,
    plusViewState?: PlusViewState,
    onClick: (type: string) => void
}

export const PlusHolderC = (props: PlusHolderProps) => {
    const { x, y, initPlus, onClick, plusViewState } = props;
    const plusHolderRect = cn("plusHolderRect");

    const stopSVGVisible: boolean = plusViewState ? plusViewState.isLast : false;
    const plusHolderWidth: number = stopSVGVisible ? PLUS_HOLDER_WIDTH :
        (PLUS_HOLDER_WIDTH - DOTTED_STOP_SVG_WIDTH - (defaultConf.element.gap * 2));
    const paddingLeft: number = stopSVGVisible ? defaultConf.paddingLeft : defaultConf.paddingWithoutStop;

    const statementX = x - ((DOTTED_PROCESS_SVG_WIDTH_WITH_SHADOW / 2) + (plusHolderWidth / 2)) + paddingLeft + defaultConf.element.shadowGap + (DOTTED_PROCESS_SVG_WIDTH / 2);
    const apisX = statementX + defaultConf.element.width + defaultConf.element.gap;

    const statementOnClick = () => onClick("STATEMENT");
    const apisOnClick = () => onClick("APIS");

    return (
        <g className={"plusholder"}>
            {!initPlus ?
                <rect
                    // tslint:disable-next-line: jsx-no-multiline-js jsx-wrap-multiline
                    x={x - (plusHolderWidth / 2)}
                    ry={DefaultConfig.plusHolder.radius}
                    rx={DefaultConfig.plusHolder.radius}
                    className={plusHolderRect}
                    y={y}
                    height={PLUS_HOLDER_HEIGHT}
                    width={plusHolderWidth}
                />
                :
                null
            }
            <g>
                <g onClick={statementOnClick}><DottedProcessSVG x={statementX} y={y + defaultConf.element.topGap} text="STATEMENT" /></g>
                <g onClick={apisOnClick}><DottedConnectorSVG x={apisX} y={y} text="APIS" /></g>
            </g>
        </g >
    );
}

export const PlusHolder = PlusHolderC;
