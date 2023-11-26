/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from 'react';
import {
    DiagramModel,
    DiagramEngine
} from '@projectstorm/react-diagrams';

import { CanvasContainer } from '../../Canvas';
import { generateEngine, createLinks } from '../../utils/Utils';
import { BaseNodeModel } from '../base/base-node/base-node';
import { NavigationWrapperCanvasWidget } from '@wso2-enterprise/ui-toolkit';
import { OFFSET } from '../../constants';
import { SequenceNodeModel } from '../nodes/sequence/SequenceNodeModel';

export interface SequenceDiagramProps {
    inSequence: BaseNodeModel[];
    outSequence: BaseNodeModel[];
}

SequenceDiagram.defaultProps = {
    invertDirection: false
}

export function SequenceDiagram(props: SequenceDiagramProps) {
    const [diagramEngine, setEngine] = useState<DiagramEngine>(generateEngine());
    const [model] = useState<DiagramModel>(new DiagramModel());
    const [isLoading, setLoading] = useState<boolean>(true);
    const [canvasWidth, setCanvasWidth] = useState<number>(1000);
    const [canvasHeight, setCanvasHeight] = useState<number>(1000);

    useEffect(() => {
        setLoading(true);
        (async () => {
            const inSequenceNodes = props.inSequence;
            const outSequenceNodes = props.outSequence;

            diagramEngine.setModel(model);
            setEngine(diagramEngine);

            if (inSequenceNodes.length > 0) {
                drawSequence(inSequenceNodes, false);
            }
            if (outSequenceNodes.length > 0) {
                drawSequence(outSequenceNodes, true);
            }
            diagramEngine.getModel().getNodes()[2].registerListener({
                eventDidFire: (event: any) => {
                    if (event.function == "updateDimensions") {
                        autoDistribute();
                    }
                }
            });
            autoDistribute();
            model.setLocked(true);
            setLoading(false);
        })();
    }, []);

    function drawSequence(nodes: any[], invertDirection: boolean) {
        const range = {
            start: invertDirection ? nodes[nodes.length - 1].getNodeRange().start : nodes[0].getNodeRange().start,
            end: invertDirection ? nodes[nodes.length - 1].getNodeRange().start : nodes[0].getNodeRange().start,
        }

        let canvasPortNode = new SequenceNodeModel(`sequence-${invertDirection}`, range, invertDirection);
        const sourceNode = invertDirection ? nodes[nodes.length - 1] : canvasPortNode;
        const targetNode = invertDirection ? canvasPortNode : nodes[0];
        const canvasPortLink = createLinks(sourceNode, targetNode);
        if (!invertDirection) model.addAll(sourceNode, ...canvasPortLink, targetNode);

        if (nodes.length > 1) {
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    if (nodes[i].getParentNode() == nodes[j].getParentNode()) {
                        const link = createLinks(nodes[i], nodes[j]);
                        model.addAll(nodes[i], ...link, nodes[j]);
                        break;
                    }
                }
            }
        }
        if (invertDirection) model.addAll(sourceNode, ...canvasPortLink, targetNode);
    }

    function autoDistribute() {
        console.log("Distributing...");
        let x = OFFSET.START.X;
        let y = OFFSET.START.Y;
        let inSeqHeight = 0;
        const nodes = diagramEngine.getModel().getNodes();
        const inSeqNodes = nodes.filter((node: any) => !node.isInOutSequenceNode() && !(node instanceof SequenceNodeModel));
        const outSeqNodes = nodes.filter((node: any) => node.isInOutSequenceNode() && !(node instanceof SequenceNodeModel));
        const inSeqNode = nodes.filter((node: any) => !node.isInOutSequenceNode() && node instanceof SequenceNodeModel)[0];
        const outSeqNode = nodes.filter((node: any) => node.isInOutSequenceNode() && node instanceof SequenceNodeModel)[0];
        const canvasHeightInSeqNodes = inSeqNode ? inSeqNode.height : 0;
        const canvasHeightOutSeqNodes = outSeqNode ? outSeqNode.height : 0;

        if (inSeqNode) {
            inSeqNode.setPosition(x, y);

            x += OFFSET.BETWEEN.X;
            y += OFFSET.BETWEEN.Y;
            for (let i = 0; i < inSeqNodes.length; i++) {
                const node: any = inSeqNodes[i];
                node.setPosition(x, y + (canvasHeightInSeqNodes / 2) - node.height / 2);
                x += (node instanceof SequenceNodeModel ? 0 : node.width) + OFFSET.BETWEEN.X;
                y += OFFSET.BETWEEN.Y;
                inSeqHeight = Math.max(inSeqHeight, node.height);
            }

            x = OFFSET.START.X;
            y = OFFSET.START.Y + canvasHeightInSeqNodes + OFFSET.BETWEEN.SEQUENCE;
        }

        if (outSeqNode) {
            outSeqNode.setPosition(x, y);

            x += OFFSET.BETWEEN.X;
            y += OFFSET.BETWEEN.Y;
            for (let i = outSeqNodes.length - 1; i >= 0; i--) {
                const node: any = outSeqNodes[i];
                node.setPosition(x, y + (canvasHeightOutSeqNodes / 2) - node.height / 2);
                x += (node instanceof SequenceNodeModel ? 0 : node.width) + OFFSET.BETWEEN.X;
                y += OFFSET.BETWEEN.Y;
            }
        }

        if (inSeqNode && outSeqNode && inSeqNodes.length > 0 && outSeqNodes.length > 0) {
            // create links between in and out
            const link = createLinks(inSeqNodes[inSeqNodes.length - 1] as any, outSeqNodes[0] as any, false, true)[0];
            model.addAll(link);
        }

        const canvasWidthInSeqNodes = inSeqNode ? inSeqNode.width : 0;
        const canvasWidthOutSeqNodes = outSeqNode ? outSeqNode.width : 0;
        const canvasWidth = Math.max(canvasWidthInSeqNodes, canvasWidthOutSeqNodes);
        setCanvasWidth(canvasWidth + OFFSET.START.X + OFFSET.MARGIN.LEFT + OFFSET.MARGIN.RIGHT);
        setCanvasHeight(canvasHeightInSeqNodes + canvasHeightOutSeqNodes + OFFSET.START.Y + OFFSET.MARGIN.TOP + OFFSET.MARGIN.BOTTOM);
    };

    if (isLoading) {
        return <h1>Loading...</h1>;
    } else {
        return <div style={{
            backgroundColor: 'var(--vscode-panel-background)',
            height: canvasHeight,
            width: canvasWidth,
            overflow: "hidden",
        }}>
            <CanvasContainer>
                <NavigationWrapperCanvasWidget
                    diagramEngine={diagramEngine as any}
                    disableZoom={true}
                />
            </CanvasContainer>
        </div>;
    }
}
