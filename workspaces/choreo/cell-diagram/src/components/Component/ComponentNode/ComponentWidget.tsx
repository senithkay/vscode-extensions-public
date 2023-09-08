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
import { ComponentModel } from './ComponentModel';
import { ComponentLinkModel } from '../ComponentLink/ComponentLinkModel';
import { ComponentHeadWidget } from './ComponentHead/ComponentHead';
import { ComponentNode } from './styles';
import { DiagramContext } from '../../DiagramContext/DiagramContext';
import { ComponentPortWidget } from '../ComponentPort/ComponentPortWidget';
import { InclusionPortsContainer } from '../../Connector/ConnectorNode/styles';

interface ComponentWidgetProps {
    node: ComponentModel;
    engine: DiagramEngine;
}

export function ComponentWidget(props: ComponentWidgetProps) {
    const { node, engine } = props;
    const { collapsedMode, selectedNodeId, setSelectedNodeId, focusedNodeId, setFocusedNodeId } = useContext(DiagramContext);
    const [selectedLink, setSelectedLink] = useState<ComponentLinkModel>(undefined);
    const [isCollapsed, setCollapsibleStatus] = useState<boolean>(collapsedMode);

    useEffect(() => {
        node.registerListener({
            'SELECT': (event: any) => {
                setSelectedLink(event.component as ComponentLinkModel);
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
        <ComponentNode
            isSelected={node.getID() === selectedNodeId || node.isNodeSelected(selectedLink, node.getID())}
            isFocused={node.getID() === focusedNodeId}
        >
            <ComponentHeadWidget
                engine={engine}
                node={node}
                isSelected={node.getID() === selectedNodeId || node.isNodeSelected(selectedLink, node.getID())}
                onClick={handleOnHeaderWidgetClick}
                isCollapsed={isCollapsed}
                setCollapsedStatus={setCollapsibleStatus}
            />

            <InclusionPortsContainer>
                <ComponentPortWidget
                    port={node.getPort(`top-${node.getID()}`)}
                    engine={engine}
                />
                <ComponentPortWidget
                    port={node.getPort(`bottom-${node.getID()}`)}
                    engine={engine}
                />
            </InclusionPortsContainer>
        </ComponentNode>
    );
}
