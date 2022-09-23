/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React, { useState } from "react";

import { CollapseViewState } from "../../../ViewState";
import { COLLAPSE_SVG_HEIGHT, COLLAPSE_SVG_WIDTH } from "../ForEach/ColapseButtonSVG";

import { CollapseButtonSVG } from "./CollapseButtonSVG";

interface ExpandedContainerProps {
    collapseVS: CollapseViewState;
    onExpandClick?: () => void;
}

export function ExpandedContainer(props: ExpandedContainerProps) {
    const { collapseVS, onExpandClick } = props;
    const [mouseOverExpand, setMouseOverExpand] = useState<boolean>(false);

    const x = collapseVS.bBox.cx;
    const y = collapseVS.bBox.cy;

    const onMouseOverExpandButton = () => {
        setMouseOverExpand(true);
    }

    const onMouseLeave = () => {
        setMouseOverExpand(false);
    }

    const containerFooter = (
        <line
            x1={x + collapseVS.bBox.lw - COLLAPSE_SVG_WIDTH / 2}
            y1={y + collapseVS.bBox.h}
            x2={x + collapseVS.bBox.lw + COLLAPSE_SVG_WIDTH / 2}
            y2={y + collapseVS.bBox.h}
            stroke={'#A6B3FF'}
            strokeWidth={1}
        />
    );

    const container = (
        <rect
            className="expanded-section-border"
            width={collapseVS.bBox.w}
            height={collapseVS.bBox.h - COLLAPSE_SVG_HEIGHT / 2}
            x={x}
            y={y + COLLAPSE_SVG_HEIGHT / 2}
            // stroke={'#5567D5'}
            opacity={0.4}
            fill={'#DCE1FF'}
            rx={6}
            // strokeDasharray={2}
        />
    );

    return (
        <g className="expanded-block">
            {mouseOverExpand && container}
            {!mouseOverExpand && containerFooter}
            <CollapseButtonSVG
                x={x + collapseVS.bBox.lw - COLLAPSE_SVG_HEIGHT / 2}
                y={y}
                onMouseEnter={onMouseOverExpandButton}
                onMouseLeave={onMouseLeave}
            />
        </g>
    );
}
