import React, { useEffect, useState } from "react";
import { DiagramEngine } from "@projectstorm/react-diagrams";
import { CellLinkModel } from "./CellLinkModel";
import { Colors } from "../../../resources";
import { ObservationLabel } from "../../ObservationLabel/ObservationLabel";

interface WidgetProps {
    engine: DiagramEngine;
    link: CellLinkModel;
}

export function CellLinkWidget(props: WidgetProps) {
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
        <g onMouseOver={handleMouseOver} onMouseLeave={handleMouseLeave} pointerEvents={"all"}>
            <polygon points={link.getArrowHeadPoints()} fill={isSelected ? Colors.PRIMARY_SELECTED : Colors.DEFAULT_TEXT} />
            <path
                id={link.getID()}
                d={link.getCurvePath()}
                cursor={"pointer"}
                fill={"none"}
                stroke={isSelected ? Colors.PRIMARY_SELECTED : Colors.DEFAULT_TEXT}
                strokeWidth={1}
            />
            {isSelected && link.observations?.size > 0 && (
                <foreignObject x={middlePosition.x} y={middlePosition.y} width="240" height="180">
                    <ObservationLabel observations={link.observations} />
                </foreignObject>
            )}
        </g>
    );
}
