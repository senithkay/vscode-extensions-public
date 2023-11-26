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
import { BaseNodeProps } from '../../base/base-node/base-node';
import { OFFSET } from '../../../constants';
import { SequenceNodeModel } from './SequenceNodeModel';
import { MediatorPortWidget } from '../../port/MediatorPortWidget';

interface SequenceNodeProps extends BaseNodeProps {
    side: "right" | "left"
}

export function SequenceNodeWidget(props: SequenceNodeProps) {
    const node = props.node;
    const inSeqNodes = props.diagramEngine.getModel().getNodes().filter((node: any) => !node.isInOutSequenceNode() && !(node instanceof SequenceNodeModel));
    const outSeqNodes = props.diagramEngine.getModel().getNodes().filter((node: any) => node.isInOutSequenceNode() && !(node instanceof SequenceNodeModel));
    const canvasWidthInSeqNodes = inSeqNodes.length > 0 ? inSeqNodes[inSeqNodes.length - 1].getX() + inSeqNodes[inSeqNodes.length - 1].width : 0;
    const canvasWidthOutSeqNodes = outSeqNodes.length > 0 ? outSeqNodes[0].getX() + outSeqNodes[0].width : 0;
    const width = Math.max(canvasWidthInSeqNodes, canvasWidthOutSeqNodes) + (OFFSET.BETWEEN.X) + 70;

    let height = 0;
    inSeqNodes.forEach((node: any) => {
        height = Math.max(height, node.height);
    });
    outSeqNodes.forEach((node: any) => {
        height = Math.max(height, node.height);
    });
    height += OFFSET.MARGIN.SEQUENCE;
    node.width = width;
    node.height = height;

    // set port positions
    const nodePosition = node.getPosition();

    const leftPort = node.getPortByAllignment(PortModelAlignment.LEFT);
    leftPort.setPosition(nodePosition.x, nodePosition.y + node.height / 2);
    const rightPort = node.getPortByAllignment(PortModelAlignment.RIGHT);
    rightPort.setPosition(nodePosition.x, nodePosition.y + node.height / 2);

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
                port={leftPort}
                engine={props.diagramEngine}
                node={props.node}
            />
            <MediatorPortWidget
                port={rightPort}
                engine={props.diagramEngine}
                node={props.node}
            />
        </>
    );
}
