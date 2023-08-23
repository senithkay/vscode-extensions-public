/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useContext, useEffect, useState } from 'react';
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { ConnectorModel } from './ConnectorModel';
import { ConnectorLinkModel } from '../ConnectorLink/ConnectorLinkModel';
import { ConnectorHeadWidget } from './ConnectorHead/ConnectorHead';
import { ConnectorName, ConnectorNode, InclusionPortsContainer } from './styles';
import { DiagramContext } from '../../DiagramContext/DiagramContext';
import { getConnectorNameFromId } from './connector-util';
import { ConnectorPortWidget } from '../ConnectorPort/ConnectorPortWidget';

interface ConnectorWidgetProps {
    node: ConnectorModel;
    engine: DiagramEngine;
}

export function ConnectorWidget(props: ConnectorWidgetProps) {
    const { node, engine } = props;
    const { collapsedMode, selectedNodeId, setHasDiagnostics, setSelectedNodeId, focusedNodeId, setFocusedNodeId } = useContext(DiagramContext);
    const [selectedLink, setSelectedLink] = useState<ConnectorLinkModel>(undefined);
    const [isCollapsed, setCollapsibleStatus] = useState<boolean>(collapsedMode);

    const displayName: string = getConnectorNameFromId(node.connectorObject.id) || node.getID().slice(node.getID().lastIndexOf(':') + 1);

    useEffect(() => {
        node.registerListener({
            'SELECT': (event: any) => {
                setSelectedLink(event.connector as ConnectorLinkModel);
            },
            'UNSELECT': () => { setSelectedLink(undefined) }
        })
    }, [node]);

    useEffect(() => {
        setCollapsibleStatus(collapsedMode);
    }, [collapsedMode])

    const handleOnHeaderWidgetClick = () => {
        setSelectedNodeId(node.getID());
        setFocusedNodeId(undefined);
    }

    return (
        <ConnectorNode
            isSelected={node.getID() === selectedNodeId || node.isNodeSelected(selectedLink, node.getID())}
            isFocused={node.getID() === focusedNodeId}
        >
            <ConnectorHeadWidget
                engine={engine}
                node={node}
                isSelected={node.getID() === selectedNodeId || node.isNodeSelected(selectedLink, node.getID())}
                onClick={handleOnHeaderWidgetClick}
                isCollapsed={isCollapsed}
                setCollapsedStatus={setCollapsibleStatus}
            />
             <ConnectorName
                onClick={handleOnHeaderWidgetClick}
            >
                {displayName}
            </ConnectorName>
            <InclusionPortsContainer>
                <ConnectorPortWidget
                    port={node.getPort(`top-${node.getID()}`)}
                    engine={engine}
                />
                <ConnectorPortWidget
                    port={node.getPort(`bottom-${node.getID()}`)}
                    engine={engine}
                />
            </InclusionPortsContainer>
        </ConnectorNode>
    );
}
