/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useContext, useEffect, useState } from "react";
import { DiagramEngine } from "@projectstorm/react-diagrams";
import { ComponentModel } from "./ComponentModel";
import { ComponentLinkModel } from "../ComponentLink/ComponentLinkModel";
import { ComponentHeadWidget } from "./ComponentHead/ComponentHead";
import { ComponentName, ComponentNode, PortsContainer } from "./styles";
import { DiagramContext } from "../../DiagramContext/DiagramContext";
import { ComponentPortWidget } from "../ComponentPort/ComponentPortWidget";
import { MoreVertMenu } from "../../MoreVertMenu/MoreVertMenu";

interface ComponentWidgetProps {
    node: ComponentModel;
    engine: DiagramEngine;
}

export function ComponentWidget(props: ComponentWidgetProps) {
    const { node, engine } = props;
    const { selectedNodeId, focusedNodeId, onComponentClick } = useContext(DiagramContext);
    const [selectedLink, setSelectedLink] = useState<ComponentLinkModel>(undefined);
    const [isHovered, setIsHovered] = useState<boolean>(false);

    const displayName: string = node.component.label || node.component.id;

    useEffect(() => {
        const listener = node.registerListener({
            SELECT: (event: any) => {
                setSelectedLink(event.component as ComponentLinkModel);
            },
            UNSELECT: () => {
                setSelectedLink(undefined);
            },
        });
        return () => {
            node.deregisterListener(listener);
        };
    }, [node]);

    const handleOnWidgetClick = () => {
        if (onComponentClick) {
            onComponentClick(node.component.id);
        }
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    return (
        <ComponentNode
            isSelected={node.getID() === selectedNodeId || node.isNodeSelected(selectedLink, node.getID())}
            isFocused={node.getID() === focusedNodeId}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleOnWidgetClick}
        >
            {isHovered && (
                <MoreVertMenu
                    id={node.component.id}
                    menuItems={[
                        { label: "Go to source", callback: (id) => console.log("Go to source - clicked", id) },
                        { label: "Observe", callback: (id) => console.log("Observe - clicked", id) },
                    ]}
                />
            )}
            <ComponentHeadWidget
                engine={engine}
                node={node}
                isSelected={node.getID() === selectedNodeId || node.isNodeSelected(selectedLink, node.getID())}
                isFocused={node.getID() === focusedNodeId}
            />
            <ComponentName>{displayName}</ComponentName>

            <PortsContainer>
                <ComponentPortWidget port={node.getPort(`top-${node.getID()}`)} engine={engine} />
                <ComponentPortWidget port={node.getPort(`bottom-${node.getID()}`)} engine={engine} />
            </PortsContainer>
        </ComponentNode>
    );
}
