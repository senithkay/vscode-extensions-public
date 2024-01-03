/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from 'react';
import { PortModelAlignment } from '@projectstorm/react-diagrams-core';
import { BaseNodeModel, BaseNodeProps } from '../../base/base-node/base-node';
import { OFFSET } from '../../../constants';
import { MediatorPortWidget } from '../../port/MediatorPortWidget';

interface SequenceNodeProps extends BaseNodeProps {
    side: "right" | "left",
    nodes: BaseNodeModel[],
}

export function SequenceNodeWidget(props: SequenceNodeProps) {
    const node = props.node;
    const nodes = props.nodes;
    const height = (nodes.length > 1 ? (nodes[nodes.length - 1]).getY() - (nodes[0]).getY() : nodes[0].height) + 300 ;

    let width = 0;
    nodes.forEach((node: any) => {
        width = Math.max(width, node.width);
    });
    width += OFFSET.MARGIN.SEQUENCE;
    node.width = width;
    node.height = height;

    // set port positions
    const nodePosition = node.getPosition();

    const leftPort = node.getPortByAllignment(PortModelAlignment.LEFT);
    leftPort.setPosition(nodePosition.x, nodePosition.y + node.height / 2);
    const rightPort = node.getPortByAllignment(PortModelAlignment.RIGHT);
    rightPort.setPosition(nodePosition.x, nodePosition.y + node.height / 2);

    const topPort = node.getPortByAllignment(PortModelAlignment.TOP);
    topPort.setPosition(nodePosition.x + node.width / 2, nodePosition.y);
    const bottomPort = node.getPortByAllignment(PortModelAlignment.BOTTOM);
    bottomPort.setPosition(nodePosition.x + node.width / 2, nodePosition.y);

    node.fireEvent({}, "updateDimensions");
    return (
        <>
            <div style={{
                width: width,
                height: height,
                border: "2px solid gold",
                background: "var(--vscode-editor-background)",
                borderRadius: props.side == "right" ? "0 25px 25px 0" : "25px 0 0 25px",
            }}></div>
            <MediatorPortWidget
                port={topPort}
                engine={props.diagramEngine}
                node={props.node}
            />
            <MediatorPortWidget
                port={bottomPort}
                engine={props.diagramEngine}
                node={props.node}
            />
        </>
    );
}
