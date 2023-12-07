/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useRef, useState } from "react";
import { DiagramEngine, PortModel, PortModelAlignment } from "@projectstorm/react-diagrams";
import { EntityPortWidget } from "../../EntityPort/EntityPortWidget";
import { EntityModel } from "../EntityModel";
import { EntityHead, EntityName, OutPorts, OutPortsWrapper } from "../styles";
import { END_NODE, START_NODE } from "../../../resources";
import { getEntityPortId } from "../../EntityPort/EntityPortModel";
import { WorkerPortWidget } from "../../Port/PortWidget";

interface ServiceHeadProps {
    engine: DiagramEngine;
    node: EntityModel;
    isSelected: boolean;
    onClick: () => void;
}

export function EntityHeadWidget(props: ServiceHeadProps) {
    const { engine, node, isSelected, onClick } = props;
    const headPorts = useRef<PortModel[]>([]);
    const [_isHovered, setIsHovered] = useState<boolean>(false);

    const displayName: string = node.entityObject.name === START_NODE ? "Start" : node.entityObject.name === END_NODE ? "End" : node.entityObject.name;

    useEffect(() => {
        headPorts.current.push(node.getPortFromID(getEntityPortId(node.getID(), PortModelAlignment.LEFT)));
        node.entityObject.links.map((link) => {
            headPorts.current.push(node.getPortFromID(getEntityPortId(node.getID(), PortModelAlignment.RIGHT, link.name)));
        });
    }, [node]);

    const handleOnHover = (task: string) => {
        setIsHovered(task === "SELECT" ? true : false);
    };

    return (
        <EntityHead
            isSelected={isSelected}
            onMouseOver={() => handleOnHover("SELECT")}
            onMouseLeave={() => handleOnHover("UNSELECT")}
            data-testid={`entity-head-${displayName}`}
        >
            <WorkerPortWidget port={node.getPort(getEntityPortId(node.getID(), PortModelAlignment.LEFT))} engine={engine} />
        

            <EntityName onClick={onClick}>{displayName}</EntityName>

            <OutPortsWrapper>
                {node.entityObject.links.map((link, index) => (
                    <OutPorts>
                        <WorkerPortWidget
                            key={index}
                            port={node.getPort(getEntityPortId(node.getID(), PortModelAlignment.RIGHT, link.name))}
                            engine={engine}
                        />
                    </OutPorts>
                ))}
            </OutPortsWrapper>
        </EntityHead>
    );
}
