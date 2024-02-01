/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

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
                id={link.getID()}
                d={link.getSVGPath()}
                cursor={"pointer"}
                fill={"none"}
                stroke={Colors.PRIMARY}
                strokeWidth={2}
                markerEnd={`url(#${link.getID()}-arrow-head)`}
            />
            <defs>
                <marker
                    markerWidth="5"
                    markerHeight="5"
                    refX="4"
                    refY="2.5"
                    viewBox="0 0 5 5"
                    orient="auto"
                    id={`${link.getID()}-arrow-head`}
                >
                    <polygon points="0,5 0,0 5,2.5" fill={Colors.PRIMARY}></polygon>
                </marker>
            </defs>
        </g>
    );
};
