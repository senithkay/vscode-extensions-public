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
import { Popover } from "@mui/material";
import { ObservationLabel } from "../../ObservationLabel/ObservationLabel";
import { TooltipLabel } from "../../TooltipLabel/TooltipLabel";

interface WidgetProps {
    engine: DiagramEngine;
    link: ComponentLinkModel;
}

export function ComponentLinkWidget(props: WidgetProps) {
    const { link } = props;

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
        handlePopoverClose();
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <g onMouseEnter={handleMouseOver} onMouseOut={handleMouseLeave} pointerEvents={"all"} className={COMPONENT_LINK}>
                <polygon points={link.getArrowHeadPoints()} fill={isSelected ? Colors.PRIMARY_SELECTED : Colors.PRIMARY} />
                <path id={link.getID()} d={link.getCurvePath()} cursor={"pointer"} fill={"none"} stroke={"transparent"} strokeWidth={20} />
                <path
                    id={link.getID()}
                    d={link.getCurvePath()}
                    cursor={"pointer"}
                    fill={"none"}
                    stroke={isSelected ? Colors.PRIMARY_SELECTED : Colors.PRIMARY}
                    strokeWidth={2}
                />
            </g>
            <Popover
                id={link.getID()}
                open={open}
                anchorEl={anchorEl}
                onClose={handlePopoverClose}
                anchorOrigin={{
                    vertical: "center",
                    horizontal: "center",
                }}
                transformOrigin={{
                    vertical: "center",
                    horizontal: "center",
                }}
                sx={{
                    pointerEvents: "none",
                }}
            >
                {link.tooltip && <TooltipLabel tooltip={link.tooltip} />}
                {link.observations?.length > 0 && !link.tooltip && <ObservationLabel observations={link.observations} />}
            </Popover>
        </>
    );
}
