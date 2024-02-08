/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { DiagramEngine } from "@projectstorm/react-diagrams";
import { ProjectModel } from "../ProjectModel";
import { ProjectCellNode } from "../styles";
import { MoreVertMenuItem } from "../../../../types";
import { ProjectPortWidget } from "../../ProjectPort/ProjectPortWidget";
import { generateRoundedOctagonSVG } from "../../../Cell/CellNode/CellWidget";

interface ServiceHeadProps {
    engine: DiagramEngine;
    node: ProjectModel;
    isSelected: boolean;
    isFocused: boolean;
    menuItems: MoreVertMenuItem[];
}

export function ProjectHeadWidget(props: ServiceHeadProps) {
    const { engine, node, isSelected, isFocused } = props;

    const cellHeight = 120;
    const strokeWidth = 2;

    return (
        <ProjectCellNode
            id={node.project.id}
            height={cellHeight}
            borderWidth={strokeWidth}
            isSelected={isSelected || isFocused}
        >
            {generateRoundedOctagonSVG(cellHeight)}

            <ProjectPortWidget
                port={node.getPort(`top-${node.getID()}`)}
                engine={engine}
                isSelected={isSelected || isFocused}
            />
            <ProjectPortWidget
                port={node.getPort(`bottom-${node.getID()}`)}
                engine={engine}
                isSelected={isSelected || isFocused}
            />

            <ProjectPortWidget
                port={node.getPort(`left-${node.getID()}`)}
                engine={engine}
                isSelected={isSelected || isFocused}
            />
            <ProjectPortWidget
                port={node.getPort(`right-${node.getID()}`)}
                engine={engine}
                isSelected={isSelected || isFocused}
            />
        </ProjectCellNode>
    );
}
