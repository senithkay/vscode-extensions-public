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
import { EntityModel } from "./EntityModel";
import { EntityLinkModel } from "../EntityLink/EntityLinkModel";
import { EntityHeadWidget } from "./EntityHead/EntityHead";
import { EntityNode } from "./styles";
import { DiagramContext } from "../DiagramContext/DiagramContext";
import { END_NODE, START_NODE } from "../../resources";

interface EntityWidgetProps {
    node: EntityModel;
    engine: DiagramEngine;
}

export function EntityWidget(props: EntityWidgetProps) {
    const { node, engine } = props;
    const { selectedNodeId } = useContext(DiagramContext);
    const [selectedLink, setSelectedLink] = useState<EntityLinkModel>(undefined);

    useEffect(() => {
        node.registerListener({
            SELECT: (event: any) => {
                setSelectedLink(event.entity as EntityLinkModel);
            },
            UNSELECT: () => {
                setSelectedLink(undefined);
            },
        });
    }, [node]);

    const handleOnHeaderWidgetClick = () => {
        // TODO: handle entity click
    };

    return (
        <EntityNode
            isSelected={node.getID() === selectedNodeId || node.isNodeSelected(selectedLink, node.getID())}
            isPill={node.entityObject.name === START_NODE || node.entityObject.name === END_NODE}
        >
            <EntityHeadWidget
                engine={engine}
                node={node}
                isSelected={node.getID() === selectedNodeId || node.isNodeSelected(selectedLink, node.getID())}
                onClick={handleOnHeaderWidgetClick}
            />
        </EntityNode>
    );
}
