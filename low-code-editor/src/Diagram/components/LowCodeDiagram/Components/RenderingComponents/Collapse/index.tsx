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
import React, { useContext } from "react";

import { Context } from "../../../Context/diagram";
import { BlockViewState } from "../../../ViewState";

import { CollapseSVG, COLLAPSE_SVG_WIDTH_WITH_SHADOW } from "./CollapseSVG";
import "./style.scss";

export interface CollapsEProps {
    blockViewState: BlockViewState | any;
}

export function Collapse(props: CollapsEProps) {
    const { props: { syntaxTree }, actions: { diagramCleanDraw } } = useContext(Context);

    const { blockViewState } = props;
    const viewState = blockViewState.collapseView;
    const handleOnClick = () => {
        blockViewState.collapseView = undefined;
        diagramCleanDraw(syntaxTree);
    };

    const classes = "collapse-button";
    const x = viewState.bBox.cx;
    const y = viewState.bBox.cy;
    return (
        <g className={classes} onClick={handleOnClick}>
            <CollapseSVG x={x - (COLLAPSE_SVG_WIDTH_WITH_SHADOW / 2)} y={y} />
        </g>
    );
}
