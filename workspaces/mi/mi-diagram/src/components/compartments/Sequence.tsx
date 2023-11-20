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
    const [canvasWidth, setCanvasWidth] = useState<number>(0);

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

            autoDistribute();
            model.setOffsetX(-OFFSET.START.X);
            model.setLocked(true);
            setLoading(false);
        })();
    }, []);

    function drawSequence(nodes: any[], invertDirection: boolean) {
        if (nodes.length > 0) {
            const range = {
                start: invertDirection ? nodes[nodes.length - 1].getRange().start : nodes[0].getRange().start,
                end: invertDirection ? nodes[nodes.length - 1].getRange().start : nodes[0].getRange().start,
            }

            let canvasPortNode = new SequenceNodeModel(`sequence-${invertDirection}`, range, invertDirection);
            const sourceNode = invertDirection ? nodes[nodes.length - 1] : canvasPortNode;
            const targetNode = invertDirection ? canvasPortNode : nodes[0];
            const canvasPortLink = createLinks(sourceNode, targetNode);
            model.addAll(sourceNode, ...canvasPortLink, targetNode);
        }
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
    }

    function autoDistribute() {
        let x = OFFSET.START.X;
        let y = OFFSET.START.Y;
        let isSwitched = false;
        const nodes = diagramEngine.getModel().getNodes();
        const inSeqNodes = nodes.filter((node: any) => !node.isInOutSequenceNode() && !(node instanceof SequenceNodeModel));
        const outSeqNodes = nodes.filter((node: any) => node.isInOutSequenceNode() && !(node instanceof SequenceNodeModel));

        for (let i = 0; i < nodes.length; i++) {
            const node: any = nodes[i];
            const isInverted = node.isInOutSequenceNode();

            if (!isInverted) {
                node.setPosition(x, y);
                x += OFFSET.BETWEEN.X;
                y += OFFSET.BETWEEN.Y;
            } else {
                if (!isSwitched) {
                    x -= OFFSET.BETWEEN.X;
                    y += OFFSET.START.Y_INVERTED;

                    // create link between in and out
                    const link = createLinks(nodes[i - 1] as any, node, false, true, true);
                    model.addAll(...link);

                    isSwitched = true;
                }
                node.setPosition(i == nodes.length - 1 ? OFFSET.START.X : x, y);
                x -= OFFSET.BETWEEN.X;
                y += OFFSET.BETWEEN.Y;
            }
        }
        console.log(nodes)
        const canvasWidthInSeqNodes = inSeqNodes.length > 0 ? inSeqNodes[inSeqNodes.length - 1].getX() + OFFSET.BETWEEN.X : 0;
        const canvasWidthOutSeqNodes = outSeqNodes.length > 0 ? outSeqNodes[outSeqNodes.length - 1].getX() + OFFSET.BETWEEN.X : 0;
        const canvasWidth = Math.max(canvasWidthInSeqNodes, canvasWidthOutSeqNodes);
        setCanvasWidth(canvasWidth + OFFSET.MARGIN.RIGHT);
    };

    if (isLoading) {
        return <h1>Loading...</h1>;
    } else {
        return <div style={{
            backgroundColor: 'var(--vscode-panel-background)',
            maxHeight: "100vh",
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
