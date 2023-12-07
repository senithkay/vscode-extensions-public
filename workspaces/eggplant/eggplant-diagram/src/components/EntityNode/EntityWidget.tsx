/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useContext, useEffect, useState } from "react";
import { DiagramEngine, PortModelAlignment } from "@projectstorm/react-diagrams";
import { EntityModel } from "./EntityModel";
import { EntityLinkModel } from "../EntityLink/EntityLinkModel";
import { EntityHeadWidget } from "./EntityHead/EntityHead";
import { EntityName, EntityNode, FieldName, OutPorts, OutPortsWrapper, RecordFieldContainer } from "./styles";
import { DiagramContext } from "../DiagramContext/DiagramContext";
import { END_NODE, START_NODE } from "../../resources";
import { WorkerLinkModel } from "../Link/LinkModel";
import { WorkerPortWidget } from "../Port/PortWidget";
import { getEntityPortId } from "../EntityPort/EntityPortModel";

interface EntityWidgetProps {
    node: EntityModel;
    engine: DiagramEngine;
}




export function EntityWidget(props: EntityWidgetProps) {
    const { node, engine } = props;
    const { selectedNodeId } = useContext(DiagramContext);
    const [selectedLink, setSelectedLink] = useState<WorkerLinkModel>(undefined);

    // useEffect(() => {
    //     node.registerListener({
    //         SELECT: (event: any) => {
    //             setSelectedLink(event.entity as LinkModel);
    //         },
    //         UNSELECT: () => {
    //             setSelectedLink(undefined);
    //         },
    //     });
    // }, [node]);

    const handleOnHeaderWidgetClick = () => {
        // TODO: handle entity click
    };

    const displayName: string = node.entityObject.name === START_NODE ? "Start" : node.entityObject.name === END_NODE ? "End" : node.entityObject.name;

    return (
        <RecordFieldContainer
            isSelected={node.getID() === selectedNodeId}
            isPill={node.entityObject.name === START_NODE || node.entityObject.name === END_NODE}
        >
            {/* <EntityHeadWidget
                engine={engine}
                node={node}
                isSelected={node.getID() === selectedNodeId}
                onClick={handleOnHeaderWidgetClick}
            /> */}

            <WorkerPortWidget port={node.getPort(getEntityPortId(node.getID(), PortModelAlignment.LEFT))} engine={engine} />


            <FieldName onClick={handleOnHeaderWidgetClick}>{displayName}</FieldName>

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
        </RecordFieldContainer>
    );
}
