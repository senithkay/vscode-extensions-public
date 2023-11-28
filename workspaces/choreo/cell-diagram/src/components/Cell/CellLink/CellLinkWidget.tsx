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
    const hasObservabilityLayer = hasLayer(DiagramLayer.OBSERVABILITY);
    const hasDiffLayer = hasLayer(DiagramLayer.DIFF);

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
        if (!hasObservabilityLayer || !link.observations || link.observations.length === 0) {
            return 0;
        }
        return link.observations?.reduce((acc, obs) => acc + obs.requestCount, 0);
    };

    const strokeWidth = () => {
        const requestCount = getRequestCount();
        return requestCount ? link.scaleValueToLinkWidth(requestCount, min, max) : 2;
    };

    const strokeColor = () => {
        if (isSelected) {
            return Colors.PRIMARY_SELECTED;
        }
        if (hasDiffLayer && link.observationOnly) {
            return Colors.ERROR;
        }
        if (hasObservabilityLayer && link.observations?.length > 0) {
            return Colors.PRIMARY;
        }
        return Colors.DEFAULT_TEXT;
    };

    const strokeDash = () => {
        if (hasDiffLayer && !(link.observations?.length > 0)) {
            return "8,8";
        }
        return "";
    };

    const midPoint = link.getMidPoint();

    return (
        <>
            <g onMouseOver={handleMouseOver} onMouseLeave={handleMouseLeave} pointerEvents={"all"} className={CELL_LINK}>
                <defs>
                    <marker
                        id={link.getLinkArrowId()}
                        markerWidth="6"
                        markerHeight="6"
                        markerUnits="strokeWidth"
                        refX="3"
                        refY="3"
                        viewBox="0 0 6 6"
                        orient="auto"
                    >
                        <polygon points="0,6 0,0 6,3" fill={strokeColor()}></polygon>
                    </marker>
                </defs>
                <path d={link.getCurvePath()} cursor={"pointer"} fill={"none"} stroke={"transparent"} strokeWidth={40} />
                <path
                    id={link.getID()}
                    d={link.getCurvePath()}
                    cursor={"pointer"}
                    fill={"none"}
                    stroke={strokeColor()}
                    strokeWidth={strokeWidth()}
                    strokeDasharray={strokeDash()}
                    markerEnd={link.showArrowHead() ? "url(#" + link.getLinkArrowId() + ")" : ""}
                />
                {hasDiffLayer && link.observationOnly && (
                    <text x={midPoint.x} y={midPoint.y} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: "20px" }}>
                        !!
                    </text>
                )}
            </g>
            {(hasObservabilityLayer || link.tooltip) && (
                <Popover
                    id={link.getID()}
                    open={open}
                    anchorEl={anchorEl}
                    sx={link.observations?.length > 0 && !link.tooltip ? observabilityPopOverStyle : tooltipPopOverStyle}
                >
                    {link.tooltip && <TooltipLabel tooltip={link.tooltip} />}
                    {link.observations?.length > 0 && !link.tooltip && <ObservationLabel observations={link.observations} />}
                </Popover>
            )}
        </>
    );
}
