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
import { generateEngine, setNodePositions, drawSequence } from '../../utils/Utils';
import { BaseNodeModel } from '../base/base-node/base-node';
import { NavigationWrapperCanvasWidget } from '@wso2-enterprise/ui-toolkit';
import { OFFSET } from '../../constants';
import { SequenceNodeModel } from '../nodes/sequence/SequenceNodeModel';
import { PlusNodeModel } from '../nodes/plusNode/PlusNodeModel';
import { SequenceNodes } from '../../utils/visitors/NodeInitVisitor';

export const IN_SEQUENCE_TAG = "inSequence";
export const OUT_SEQUENCE_TAG = "outSequence";

export interface SequenceDiagramProps {
    sequences: SequenceNodes[];
}

SequenceDiagram.defaultProps = {
    invertDirection: false
}

export function SequenceDiagram(props: SequenceDiagramProps) {
    const [diagramEngine, setEngine] = useState<DiagramEngine>(generateEngine());
    const [model] = useState<DiagramModel>(new DiagramModel());
    const [isLoading, setLoading] = useState<boolean>(true);
    const [canvasHeight, setCanvasHeight] = useState<number>(1000);

    useEffect(() => {
        setLoading(true);
        (async () => {
            const sequences = props.sequences;

            diagramEngine.setModel(model);
            setEngine(diagramEngine);

            sequences.forEach((sequence: SequenceNodes) => {
                drawSequence(sequence.nodes, sequence.type, sequence.range, model);
            });

            diagramEngine.getModel().getNodes().forEach(node => node.registerListener({
                eventDidFire: (event: any) => {
                    if (event.function === "updateDimensions") {
                        autoDistribute();
                    }
                }
            }));
            autoDistribute();
            model.setLocked(true);
            setLoading(false);
        })();
    }, []);

    function autoDistribute() {
        let x = OFFSET.START.X;
        let y = OFFSET.START.Y;
        const nodes: any = diagramEngine.getModel().getNodes();
        const inSeqNodes = nodes.filter((node: BaseNodeModel) => (!node.isInOutSequenceNode() && node instanceof PlusNodeModel && !node.getParentNode()) || node.getParentNode()?.tag === IN_SEQUENCE_TAG || node.getParentNode()?.tag === "sequence");
        const outSeqNodes = nodes.filter((node: BaseNodeModel) => (node.isInOutSequenceNode() && node instanceof PlusNodeModel && !node.getParentNode()) || node.getParentNode()?.tag === OUT_SEQUENCE_TAG);
        const inSeqNode = nodes.filter((node: any) => !node.isInOutSequenceNode() && node instanceof SequenceNodeModel)[0];
        const outSeqNode = nodes.filter((node: any) => node.isInOutSequenceNode() && node instanceof SequenceNodeModel)[0];
        const inSequenceHeight = inSeqNode ? inSeqNode.height : 0;
        const outSequenceHeight = outSeqNode ? outSeqNode.height : 0;
        const canvasWidthInSeqNodes = inSeqNode ? inSeqNode.width : 0;
        const canvasWidthOutSeqNodes = outSeqNode ? outSeqNode.width : 0;

        if (inSeqNode) {
            inSeqNode.setPosition(x, y);

            setNodePositions(inSeqNodes, x, y, canvasWidthInSeqNodes);

            x = OFFSET.START.X;
            y = OFFSET.START.Y + inSequenceHeight + OFFSET.BETWEEN.SEQUENCE;
        }

        if (outSeqNode) {
            outSeqNode.setPosition(x, y);

            setNodePositions(outSeqNodes, x, y, canvasWidthOutSeqNodes);
        }
        setCanvasHeight(inSequenceHeight + outSequenceHeight + OFFSET.START.Y + OFFSET.MARGIN.TOP + OFFSET.MARGIN.BOTTOM);
    };

    if (isLoading) {
        return <h1>Loading...</h1>;
    } else {
        return <div style={{
            backgroundColor: 'var(--vscode-panel-background)',
            height: canvasHeight,
            minHeight: "100vh",
            overflow: "hidden",
        }}>
            <CanvasContainer>
                <NavigationWrapperCanvasWidget
                    diagramEngine={diagramEngine as any}
                    disableZoom={true}
                    disableMouseEvents={true}
                />
            </CanvasContainer>
        </div>;
    }
}
