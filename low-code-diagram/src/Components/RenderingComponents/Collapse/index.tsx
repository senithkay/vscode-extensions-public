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
import React from "react";

import { BlockViewState, CollapseViewState } from "../../../ViewState";
import { DefaultConfig } from "../../../Visitors";
import { COLLAPSE_SVG_HEIGHT, COLLAPSE_SVG_WIDTH } from "../ForEach/ColapseButtonSVG";

import { CollapseButtonSVG } from "./CollapseButtonSVG";
import { CollapsedComponentSVG } from "./CollapsedComponentSVG";
import { ExpandedContainer } from "./ExpandedContainer";

interface CollapseProps {
    collapseVS: CollapseViewState;
    onExpandClick?: () => void;
}


export default function CollapseComponent(props: CollapseProps) {
    const { collapseVS, onExpandClick } = props;
    const x = collapseVS.bBox.cx;
    const y = collapseVS.bBox.cy;
    return (
        <g >
            {collapseVS.collapsed && <CollapsedComponentSVG x={x} y={y} onExpandClick={onExpandClick} />}
            {!collapseVS.collapsed && <ExpandedContainer collapseVS={collapseVS} />}
        </g>
    )
}
