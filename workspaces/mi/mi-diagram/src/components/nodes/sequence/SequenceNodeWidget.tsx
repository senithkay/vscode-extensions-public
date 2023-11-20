/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from 'react';
import { PortModelAlignment, PortWidget } from '@projectstorm/react-diagrams-core';
import { BaseNodeProps } from '../../base/base-node/base-node';
import { OFFSET } from '../../../constants';
import { SequenceNodeModel } from './SequenceNodeModel';

interface SequenceNodeProps extends BaseNodeProps {
    side: "right" | "left"
}

export function SequenceNodeWidget(props: SequenceNodeProps) {
    const isOut = props.side == "left";
    const inSeqNodes = props.diagramEngine.getModel().getNodes().filter((node: any) => !node.isInOutSequenceNode() && !(node instanceof SequenceNodeModel));
    const outSeqNodes = props.diagramEngine.getModel().getNodes().filter((node: any) => node.isInOutSequenceNode() && !(node instanceof SequenceNodeModel));
    const canvasWidthInSeqNodes = inSeqNodes.length > 0 ? inSeqNodes[inSeqNodes.length - 1].getX() + OFFSET.BETWEEN.X : 0;
    const canvasWidthOutSeqNodes = outSeqNodes.length > 0 ? outSeqNodes[outSeqNodes.length - 1].getX() + OFFSET.BETWEEN.X : 0;
    const width = Math.max(canvasWidthInSeqNodes, canvasWidthOutSeqNodes);
    const seqHeight = 70;
    const height = 140;
    props.node.setPosition(OFFSET.START.X, OFFSET.START.Y + (isOut ? OFFSET.START.Y_INVERTED : 0) - (height - seqHeight) / 2);

    return (
        <>
            <div style={{
                width: width,
                height: height,
                border: "2px solid gold",
                background: "var(--vscode-editor-background)",
                borderRadius: props.side == "right" ? "0 25px 25px 0" : "25px 0 0 25px",
            }}></div>
            <PortWidget
                style={{
                    left: 0,
                    top: -seqHeight / 2 + height / 2,
                    height: 0,
                    position: 'absolute'
                }}
                port={props.node.getPort(PortModelAlignment.RIGHT)}
                engine={props.diagramEngine}
            >
            </PortWidget>
        </>
    );
}
