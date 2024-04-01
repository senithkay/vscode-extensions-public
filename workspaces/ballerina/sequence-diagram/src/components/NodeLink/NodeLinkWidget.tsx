/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

/** @jsxImportSource @emotion/react */
import React from "react";
import { DiagramEngine } from "@projectstorm/react-diagrams";
import { NodeLinkModel } from "./NodeLinkModel";
import { Colors } from "../../resources/constants";

interface NodeLinkWidgetProps {
    link: NodeLinkModel;
    engine: DiagramEngine;
}

export const NodeLinkWidget: React.FC<NodeLinkWidgetProps> = ({ link, engine }) => {
    return (
        <g pointerEvents={"all"}>
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
                stroke={Colors.PRIMARY}
                strokeWidth={1.5}
                strokeDasharray={link.brokenLine ? "5,5" : "0"}
                markerEnd={link.showArrowToNode() ? `url(#${link.getID()}-arrow-head)` : ""}
            />
            <defs>
                <marker
                    markerWidth="8"
                    markerHeight="8"
                    refX="8"
                    refY="4"
                    viewBox="0 0 8 8"
                    orient="auto"
                    id={`${link.getID()}-arrow-head`}
                >
                    <polygon points="0,8 0,0 8,4" fill={Colors.PRIMARY}></polygon>
                </marker>
            </defs>
        </g>
    );
};
