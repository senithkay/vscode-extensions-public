/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useContext, useEffect, useState } from "react";
import { DiagramEngine } from "@projectstorm/react-diagrams";
import { ComponentLinkModel } from "./ComponentLinkModel";
import { COMPONENT_LINK, Colors } from "../../../resources";
import { Popover } from "@wso2-enterprise/ui-toolkit";
import { ObservationLabel } from "../../ObservationLabel/ObservationLabel";
import { TooltipLabel } from "../../TooltipLabel/TooltipLabel";
import { DiagramContext } from "../../DiagramContext/DiagramContext";
import { DiagramLayer } from "../../Controls/DiagramLayers";

interface WidgetProps {
    engine: DiagramEngine;
    link: ComponentLinkModel;
}

const tooltipPopOverStyle = {
    backgroundColor: Colors.NODE_BACKGROUND_PRIMARY,
    border: `1px solid ${Colors.PRIMARY_SELECTED}`,
    padding: "10px",
    borderRadius: "5px",
    display: "flex",
    flexDirection: "column",
    maxWidth: "280px",
    gap: "8px",
    pointerEvents: "none",
};

const observabilityPopOverStyle = {
    backgroundColor: Colors.NODE_BACKGROUND_PRIMARY,
    border: `1px solid ${Colors.PRIMARY_SELECTED}`,
    padding: "10px",
    borderRadius: "5px",
    display: "flex",
    flexDirection: "column",
    pointerEvents: "none",
};

export function ComponentLinkWidget(props: WidgetProps) {
    const { link } = props;

    const {
        diagramLayers: { hasLayer },
        observationSummary: {
            requestCount: { min, max },
        },
    } = useContext(DiagramContext);

    const [isSelected, setIsSelected] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = React.useState<null | SVGGElement>(null);

    const open = (link.tooltip || link.observations?.length > 0) && Boolean(anchorEl);

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

    const handleMouseOver = (event: React.MouseEvent<SVGGElement, MouseEvent>) => {
        event.stopPropagation();
        selectPath();
        setAnchorEl(event.currentTarget);
    };

    const handleMouseLeave = (event: React.MouseEvent<SVGGElement, MouseEvent>) => {
        event.stopPropagation();
        unselectPath();
        setAnchorEl(null);
    };

    const getRequestCount = () => {
        if (!hasLayer(DiagramLayer.OBSERVABILITY) || !link.observations || link.observations.length === 0) {
            return 0;
        }
        return link.observations?.reduce((acc, obs) => acc + obs.requestCount, 0);
    };

    const strokeWidth = () => {
        const requestCount = getRequestCount();
        return requestCount ? link.scaleValueToLinkWidth(requestCount, min, max) : 2;
    };

    const arrowHeadPoints = () => {
        const requestCount = getRequestCount();
        const strokeWidth = requestCount ? link.scaleValueToLinkWidth(requestCount, min, max) : undefined;
        return link.getArrowHeadPoints(strokeWidth);
    };

    return (
        <>
            <g onMouseOver={handleMouseOver} onMouseLeave={handleMouseLeave} pointerEvents={"all"} className={COMPONENT_LINK}>
                <polygon points={arrowHeadPoints()} fill={isSelected ? Colors.PRIMARY_SELECTED : Colors.PRIMARY} />
                <path d={link.getCurvePath()} cursor={"pointer"} fill={"none"} stroke={"transparent"} strokeWidth={40} />
                <path
                    id={link.getID()}
                    d={link.getCurvePath()}
                    cursor={"pointer"}
                    fill={"none"}
                    stroke={isSelected ? Colors.PRIMARY_SELECTED : Colors.PRIMARY}
                    strokeWidth={strokeWidth()}
                />
            </g>
            <Popover
                id={link.getID()}
                open={open}
                anchorEl={anchorEl}
                sx={link.observations?.length > 0 && !link.tooltip ? observabilityPopOverStyle : tooltipPopOverStyle}
            >
                {link.tooltip && <TooltipLabel tooltip={link.tooltip} />}
                {link.observations?.length > 0 && !link.tooltip && <ObservationLabel observations={link.observations} />}
            </Popover>
        </>
    );
}
