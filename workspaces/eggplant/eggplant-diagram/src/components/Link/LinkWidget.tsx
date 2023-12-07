import React from "react";
import { Colors } from "../../resources";
import { WorkerLinkModel } from "./LinkModel";

interface WidgetProps {
    link: WorkerLinkModel;
}

export function LinkWidget(props: WidgetProps) {
    const { link } = props;

    return (
        <g>
            <polygon points={link.getArrowHeadPoints()} fill={Colors.DEFAULT_TEXT} />
            <path
                id={link.getID()}
                d={link.getCurvePath()}
                fill={"none"}
                pointerEvents={"all"}
                stroke={Colors.DEFAULT_TEXT}
                strokeWidth={0.75}
            />
        </g>
    );
}
