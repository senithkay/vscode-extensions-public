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
import { ComponentLinkModel } from "./ComponentLinkModel";
import { COMPONENT_LINK, Colors } from "../../../resources";
import { ObservationLabel } from "../../ObservationLabel/ObservationLabel";

interface WidgetProps {
    engine: DiagramEngine;
    link: ComponentLinkModel;
}

export function ComponentLinkWidget(props: WidgetProps) {
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

    const handleMouseOver = () => {
        selectPath();
    };

    const handleMouseLeave = () => {
        unselectPath();
    };

    const middlePosition = link.getTooltipPosition();

    return (
        <g onMouseOver={handleMouseOver} onMouseLeave={handleMouseLeave} pointerEvents={"all"} className={COMPONENT_LINK}>
            <polygon points={link.getArrowHeadPoints()} fill={isSelected ? Colors.PRIMARY_SELECTED : Colors.PRIMARY} />
            <path
                id={link.getID()}
                d={link.getCurvePath()}
                cursor={"pointer"}
                fill={"none"}
                stroke={isSelected ? Colors.PRIMARY_SELECTED : Colors.PRIMARY}
                strokeWidth={2}
            />
            {isSelected && link.observations?.length > 0 && (
                <foreignObject x={middlePosition.x} y={middlePosition.y} width="240" height="240">
                    <ObservationLabel observations={link.observations} />
                </foreignObject>
            )}
        </g>
    );
}
