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
import { ConnectionModel } from "./ConnectionModel";
import { ConnectionHeadWidget } from "./ConnectionHead/ConnectionHead";
import { ConnectionName, ConnectionNode, InclusionPortsContainer } from "./styles";
import { DiagramContext } from "../../DiagramContext/DiagramContext";
import { ConnectionPortWidget } from "../ConnectionPort/ConnectionPortWidget";
import { ExternalLinkModel } from "../../External/ExternalLink/ExternalLinkModel";
import { getMetadataFromConnection } from "../../../utils";
import { ConnectionType } from "../../../types";

interface ConnectionWidgetProps {
    node: ConnectionModel;
    engine: DiagramEngine;
}

export function ConnectionWidget(props: ConnectionWidgetProps) {
    const { node, engine } = props;
    const { collapsedMode, selectedNodeId, focusedNodeId } = useContext(DiagramContext);
    const [selectedLink, setSelectedLink] = useState<ExternalLinkModel>(undefined);
    const [isCollapsed, setCollapsibleStatus] = useState<boolean>(collapsedMode);
    const metadata = getMetadataFromConnection(node.connection);
    const displayName = (metadata.type === ConnectionType.Connector ? metadata.organization : metadata.component) || node.connection.id;

    useEffect(() => {
        node.registerListener({
            SELECT: (event: any) => {
                setSelectedLink(event.connection as ExternalLinkModel);
            },
            UNSELECT: () => {
                setSelectedLink(undefined);
            },
        });
    }, [node]);

    useEffect(() => {
        setCollapsibleStatus(collapsedMode);
    }, [collapsedMode]);

    const handleOnHeaderWidgetClick = () => {
        // setSelectedNodeId(node.getID());
        // setFocusedNodeId(undefined);
    };

    return (
        <ConnectionNode
            isSelected={node.getID() === selectedNodeId || node.isNodeSelected(selectedLink, node.getID())}
            isFocused={node.getID() === focusedNodeId}
        >
            <ConnectionHeadWidget
                engine={engine}
                node={node}
                isSelected={node.getID() === selectedNodeId || node.isNodeSelected(selectedLink, node.getID())}
                isCollapsed={isCollapsed}
                setCollapsedStatus={setCollapsibleStatus}
            />
            <ConnectionName onClick={handleOnHeaderWidgetClick}>{displayName}</ConnectionName>
            <InclusionPortsContainer>
                <ConnectionPortWidget port={node.getPort(`top-${node.getID()}`)} engine={engine} />
                <ConnectionPortWidget port={node.getPort(`bottom-${node.getID()}`)} engine={engine} />
            </InclusionPortsContainer>
        </ConnectionNode>
    );
}
