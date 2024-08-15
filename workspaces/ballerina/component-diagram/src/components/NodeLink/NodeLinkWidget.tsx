/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

/** @jsxImportSource @emotion/react */
import { css, keyframes } from "@emotion/react";
import { useState } from "react";
import { DiagramEngine } from "@projectstorm/react-diagrams";
import { NodeLinkModel } from "./NodeLinkModel";
import { Colors } from "../../resources/constants";

interface NodeLinkWidgetProps {
    link: NodeLinkModel;
    engine: DiagramEngine;
}

const fadeInZoomIn = keyframes`
    0% {
        opacity: 0;
        transform: scale(0.5);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
`;

export const NodeLinkWidget: React.FC<NodeLinkWidgetProps> = ({ link, engine }) => {
    const [isHovered, setIsHovered] = useState(false);

    const linkColor = isHovered ? Colors.PRIMARY : Colors.ON_SURFACE;

    return (
        <g pointerEvents={"all"} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <path
                id={link.getID() + "-bg"}
                d={link.getSVGPath()}
                fill={"none"}
                stroke={"transparent"}
                strokeWidth={16}
            />
            <path
                id={link.getID()}
                d={link.getSVGPath()}
                fill={"none"}
                stroke={link.showAddButton && linkColor}
                strokeWidth={1.5}
                strokeDasharray={link.brokenLine ? "5,5" : "0"}
                markerEnd={link.showArrowToNode() ? `url(#${link.getID()}-arrow-head)` : ""}
            />

            <defs>
                <marker
                    markerWidth="4"
                    markerHeight="4"
                    refX="3"
                    refY="2"
                    viewBox="0 0 4 4"
                    orient="auto"
                    id={`${link.getID()}-arrow-head`}
                >
                    <polygon points="0,4 0,0 4,2" fill={link.showAddButton && linkColor}></polygon>
                </marker>
            </defs>
        </g>
    );
};
