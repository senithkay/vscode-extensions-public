import React, { useContext, useEffect, useState } from "react";
import { DiagramEngine } from "@projectstorm/react-diagrams";
import { CellLinkModel } from "./CellLinkModel";
import { CELL_LINK, Colors } from "../../../resources";
import { ObservationLabel } from "../../ObservationLabel/ObservationLabel";
import { TooltipLabel } from "../../TooltipLabel/TooltipLabel";
import { Popover } from "@wso2-enterprise/ui-toolkit";
import { DiagramContext } from "../../DiagramContext/DiagramContext";
import { DiagramLayer } from "../../Controls/DiagramLayers";

interface WidgetProps {
    engine: DiagramEngine;
    link: CellLinkModel;
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

export function CellLinkWidget(props: WidgetProps) {
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
            <g onMouseOver={handleMouseOver} onMouseLeave={handleMouseLeave} pointerEvents={"all"} className={CELL_LINK}>
                <polygon points={arrowHeadPoints()} fill={isSelected ? Colors.PRIMARY_SELECTED : Colors.DEFAULT_TEXT} />
                <path d={link.getCurvePath()} cursor={"pointer"} fill={"none"} stroke={"transparent"} strokeWidth={40} />
                <path
                    id={link.getID()}
                    d={link.getCurvePath()}
                    cursor={"pointer"}
                    fill={"none"}
                    stroke={isSelected ? Colors.PRIMARY_SELECTED : Colors.DEFAULT_TEXT}
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
