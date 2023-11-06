import React, { useEffect, useState } from "react";
import { DiagramEngine } from "@projectstorm/react-diagrams";
import { CellLinkModel } from "./CellLinkModel";
import { CELL_LINK, Colors } from "../../../resources";
import { Popover } from "@mui/material";
import { ObservationLabel } from "../../ObservationLabel/ObservationLabel";

interface WidgetProps {
    engine: DiagramEngine;
    link: CellLinkModel;
}

export function CellLinkWidget(props: WidgetProps) {
    const { link } = props;

    const [isSelected, setIsSelected] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = React.useState<null | SVGGElement>(null);

    const open = link.observations?.length > 0 && Boolean(anchorEl);

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
            <g onMouseOver={handleMouseOver} onMouseOut={handleMouseLeave} pointerEvents={"all"} className={CELL_LINK}>
                <polygon points={link.getArrowHeadPoints()} fill={isSelected ? Colors.PRIMARY_SELECTED : Colors.DEFAULT_TEXT} />
                <path d={link.getCurvePath()} cursor={"pointer"} fill={"none"} stroke={"transparent"} strokeWidth={30} />
                <path
                    id={link.getID()}
                    d={link.getCurvePath()}
                    cursor={"pointer"}
                    fill={"none"}
                    stroke={isSelected ? Colors.PRIMARY_SELECTED : Colors.DEFAULT_TEXT}
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
                    boxShadow: "0px 1px 3px rgba(0,0,0,0.1), 0px 1px 2px rgba(0,0,0,0.06)",
                }}
            >
                <ObservationLabel observations={link.observations} />
            </Popover>
        </>
    );
}
