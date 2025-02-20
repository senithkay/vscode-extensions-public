/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import { DiagramEngine } from "@projectstorm/react-diagrams";
import { ExternalLinkModel } from "./ExternalLinkModel";
import { Colors, EXTERNAL_LINK } from "../../../resources";

interface WidgetProps {
    engine: DiagramEngine;
    link: ExternalLinkModel;
}

export function ExternalLinkWidget(props: WidgetProps) {
    const { link } = props;

    const [isSelected, setIsSelected] = useState<boolean>(false);

    useEffect(() => {
        const listener = link.registerListener({
            SELECT: selectPath,
            UNSELECT: unselectPath,
        });
        return () => {
            link.deregisterListener(listener);
        };
    }, [link]);

    const selectPath = () => {
        setIsSelected(true);
        link.selectLinkedNodes();
    };

    const unselectPath = () => {
        setIsSelected(false);
        link.resetLinkedNodes();
    };

    return (
        <g className={EXTERNAL_LINK}>
            <defs>
                <marker
                    id={link.getLinkArrowId()}
                    markerWidth="8"
                    markerHeight="8"
                    markerUnits="strokeWidth"
                    refX="4"
                    refY="3"
                    viewBox="0 0 6 6"
                    orient="auto"
                >
                    <polygon points="0,6 0,0 5,3" fill={isSelected ? Colors.SECONDARY : Colors.OUTLINE}></polygon>
                </marker>
            </defs>
            <path
                id={link.getID()}
                d={link.withRightOffset ? link.getCurvePathWithOffset() : link.getCurvePath()}
                fill={"none"}
                stroke={isSelected ? Colors.SECONDARY : Colors.OUTLINE}
                strokeWidth={2}
                markerEnd={"url(#" + link.getLinkArrowId() + ")"}
            />
        </g>
    );
}
