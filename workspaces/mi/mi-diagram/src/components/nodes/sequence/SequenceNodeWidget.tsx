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
import { MediatorPortWidget } from '../../port/MediatorPortWidget';
import { IN_SEQUENCE_TAG, OUT_SEQUENCE_TAG } from '../../compartments/Sequence';

interface SequenceNodeProps extends BaseNodeProps {
    side: "right" | "left"
}

export function SequenceNodeWidget(props: SequenceNodeProps) {
    const node = props.node;
    const nodes = props.diagramEngine.getModel().getNodes();
    const inSeqNodes = nodes.filter((node: any) => node.parentNode?.tag === IN_SEQUENCE_TAG);
    const outSeqNodes = nodes.filter((node: any) => node.parentNode?.tag === OUT_SEQUENCE_TAG);
    const canvasHeightInSeqNodes = inSeqNodes.length > 0 ? inSeqNodes[inSeqNodes.length - 1].getY() + inSeqNodes[inSeqNodes.length - 1].height : 0;
    const canvasHeightOutSeqNodes = outSeqNodes.length > 0 ? outSeqNodes[0].getY() + outSeqNodes[0].height : 0;
    const height = Math.max(canvasHeightInSeqNodes, canvasHeightOutSeqNodes) + (OFFSET.BETWEEN.Y) + 70;

    let width = 0;
    inSeqNodes.forEach((node: any) => {
        width = Math.max(width, node.width);
    });
    outSeqNodes.forEach((node: any) => {
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
