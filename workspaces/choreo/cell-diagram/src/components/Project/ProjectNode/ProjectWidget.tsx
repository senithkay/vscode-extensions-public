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
import { ProjectLinkModel } from "../ProjectLink/ProjectLinkModel";
import { ProjectHeadWidget } from "./ProjectHeadWidget/ProjectHeadWidget";
import { ProjectName, ProjectNode } from "./styles";
import { DiagramContext } from "../../DiagramContext/DiagramContext";

interface ProjectWidgetProps {
    node: ProjectModel;
    engine: DiagramEngine;
}

export function ProjectWidget(props: ProjectWidgetProps) {
    const { node, engine } = props;
    const { selectedNodeId, focusedNodeId, componentMenu, onComponentDoubleClick } = useContext(DiagramContext);
    const [selectedLink, setSelectedLink] = useState<ProjectLinkModel>(undefined);
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const headPorts = useRef<PortModel[]>([]);

    const displayName: string = node.project.name;

    useEffect(() => {
        const listener = node.registerListener({
            SELECT: (event: any) => {
                setSelectedLink(event.project as ProjectLinkModel);
            },
            UNSELECT: () => {
                setSelectedLink(undefined);
            },
        });
        headPorts.current.push(node.getPortFromID(`left-${node.getID()}`));
        headPorts.current.push(node.getPortFromID(`right-${node.getID()}`));
        headPorts.current.push(node.getPortFromID(`bottom-${node.getID()}`));

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
        <ProjectNode
            isSelected={node.getID() === selectedNodeId || node.isNodeSelected(selectedLink, node.getID())}
            isFocused={node.getID() === focusedNodeId}
            onMouseOver={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onDoubleClick={handleOnWidgetDoubleClick}
            onContextMenu={handleOnContextMenu}
        >
            <ProjectHeadWidget
                engine={engine}
                node={node}
                isSelected={node.getID() === selectedNodeId || node.isNodeSelected(selectedLink, node.getID())}
                isFocused={node.getID() === focusedNodeId || isHovered}
                menuItems={componentMenu}
            />
            <ProjectName>{displayName}</ProjectName>
        </ProjectNode>
    );
}
