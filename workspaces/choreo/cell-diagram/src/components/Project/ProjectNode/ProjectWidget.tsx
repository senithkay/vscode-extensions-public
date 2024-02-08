/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useContext, useEffect, useRef, useState } from "react";
import { DiagramEngine, PortModel } from "@projectstorm/react-diagrams";
import { ProjectModel } from "./ProjectModel";
import { ProjectHeadWidget } from "./ProjectHeadWidget/ProjectHeadWidget";
import { ProjectName, ProjectNode, TopArrowContainer } from "./styles";
import { DiagramContext } from "../../DiagramContext/DiagramContext";
import { AdvancedLinkModel } from "../AdvancedLink/AdvancedLinkModel";
import { Colors } from "../../../resources";

interface ProjectWidgetProps {
    node: ProjectModel;
    engine: DiagramEngine;
}

export function ProjectWidget(props: ProjectWidgetProps) {
    const { node, engine } = props;
    const { selectedNodeId, focusedNodeId, componentMenu, onComponentDoubleClick } = useContext(DiagramContext);
    const [selectedLink, setSelectedLink] = useState<AdvancedLinkModel>(undefined);
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const headPorts = useRef<PortModel[]>([]);

    const displayName: string = node.project.name;

    useEffect(() => {
        const listener = node.registerListener({
            SELECT: (event: any) => {
                setSelectedLink(event.project as AdvancedLinkModel);
            },
            UNSELECT: () => {
                setSelectedLink(undefined);
            },
        });
        headPorts.current.push(node.getPortFromID(`right-${node.getID()}`));
        return () => {
            node.deregisterListener(listener);
        };
    }, [node]);

    const handleOnHover = (task: string) => {
        setIsHovered(task === "SELECT" ? true : false);
        node.handleHover(headPorts.current, task);
    };

    const handleOnWidgetDoubleClick = () => {
        if (onComponentDoubleClick) {
            onComponentDoubleClick(node.project.id);
        }
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
        handleOnHover("SELECT");
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        handleOnHover("UNSELECT");
    };

    const handleOnContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };

    return (
        <>
            <TopArrowContainer>
                <svg width="124" height="50" viewBox="0 0 50 50">
                    <line
                        x1="25"
                        y1="-4000"
                        x2="25"
                        y2="-6"
                        style={{
                            stroke: Colors.OUTLINE_VARIANT,
                            strokeWidth: 2,
                            markerEnd: `url(#${node.getID()}-top-arrow-head)`,
                            opacity: 0.5,
                            strokeDasharray: "8, 5",
                        }}
                    />
                    <defs>
                        <marker
                            markerWidth="4"
                            markerHeight="4"
                            refX="3"
                            refY="2"
                            viewBox="0 0 4 4"
                            orient="auto"
                            id={`${node.getID()}-top-arrow-head`}
                        >
                            <polygon points="0,4 0,0 4,2" fill={Colors.OUTLINE_VARIANT}></polygon>
                        </marker>
                    </defs>
                </svg>
            </TopArrowContainer>
            <ProjectNode
                isSelected={node.getID() === selectedNodeId}
                isFocused={node.getID() === focusedNodeId}
                onMouseOver={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onDoubleClick={handleOnWidgetDoubleClick}
                onContextMenu={handleOnContextMenu}
            >
                <ProjectHeadWidget
                    engine={engine}
                    node={node}
                    isSelected={node.getID() === selectedNodeId}
                    isFocused={node.getID() === focusedNodeId || isHovered}
                    menuItems={componentMenu}
                />
                <ProjectName>{displayName}</ProjectName>
            </ProjectNode>
        </>
    );
}
