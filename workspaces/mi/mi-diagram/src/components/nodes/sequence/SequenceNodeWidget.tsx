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
import { BaseNodeModel, BaseNodeProps, SequenceType } from '../../base/base-node/base-node';
import { OFFSET } from '../../../constants';
import { MediatorPortWidget } from '../../port/MediatorPortWidget';
import { SequenceNodeModel } from './SequenceNodeModel';
import { PlusNodeModel } from '../plusNode/PlusNodeModel';

interface SequenceNodeProps extends BaseNodeProps {
    side: "right" | "left",
    sequenceType: SequenceType
}

export function SequenceNodeWidget(props: SequenceNodeProps) {
    const node = props.node;
    const nodes = props.diagramEngine.getModel().getNodes();
    const getCanvasDimensions = (nodes: any[], sequenceType: SequenceType) => {
        let width = 200;
        let height = 150;
        nodes.filter((node: any) => !(node instanceof SequenceNodeModel)).forEach((node: any) => {
            width = Math.max(width, node.width);
        });

        const filteredNodes = nodes.filter((node: BaseNodeModel) => node.getParentNode()?.tag === sequenceType);
        if (filteredNodes.length > 0) {

            const plusNodes = nodes.filter((node: BaseNodeModel) => node.getParentNode() == null && node instanceof PlusNodeModel && node.getSequenceType() === sequenceType);
            const lastNode = filteredNodes[filteredNodes.length - 1].isDropSequence() ? filteredNodes[filteredNodes.length - 1] : plusNodes[plusNodes.length - 1];
            height = lastNode.getY() + lastNode.height - plusNodes[0].getY() + OFFSET.BETWEEN.Y + OFFSET.MARGIN.BOTTOM;
            return { width, height };
        }
        return { width, height };
    };

    let { width, height } = getCanvasDimensions(nodes, props.sequenceType);

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
    const sequenceType = node.getSequenceType();
    return (
        <>
            <div style={{
                width: width,
                height: height,
                border: "2px solid gold",
                background: "var(--vscode-editor-background)",
                borderRadius: "20px",
            }}>
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    color: "#fff",
                    padding: "20px",
                    fontSize: "14px"
                }}>
                    {sequenceType === SequenceType.IN_SEQUENCE ? <span>In sequence</span> : sequenceType === SequenceType.OUT_SEQUENCE ? <span>Out sequence</span> : ""}
                </div>
            </div>
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
