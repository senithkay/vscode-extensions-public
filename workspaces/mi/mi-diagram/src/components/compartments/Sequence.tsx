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
import { InvisibleNodeModel } from '../nodes/InvisibleNode/InvisibleNodeModel';
import { BaseNodeModel } from '../base/base-node/base-node';
import { NavigationWrapperCanvasWidget } from '@wso2-enterprise/ui-toolkit';
import { OFFSET } from '../../constants';

export interface SequenceDiagramProps {
    nodes: BaseNodeModel[];
    invertDirection: boolean;
}

SequenceDiagram.defaultProps = {
    invertDirection: false
}

export function SequenceDiagram(props: SequenceDiagramProps) {
    const [diagramEngine, setEngine] = useState<DiagramEngine>(generateEngine());
    const [model] = useState<DiagramModel>(new DiagramModel());
    const [isLoading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        setLoading(true);
        (async () => {
            const nodes = [...props.nodes];
            if (nodes.length > 0) {

                let canvasPortNode;
                if (!props.invertDirection) {
                    const nodeRange = {
                        start: {
                            line: 0,
                            character: 0
                        },
                        end: {
                            line: nodes[0].getRange().start.line,
                            character: nodes[0].getRange().start.character
                        }
                    }
                    canvasPortNode = new InvisibleNodeModel("border", nodeRange, null);
                } else {
                    const nodeRange = {
                        start: {
                            line: nodes[nodes.length - 1].getRange().end.line,
                            character: nodes[nodes.length - 1].getRange().end.character
                        },
                        end: {
                            line: nodes[nodes.length - 1].getRange().end.line,
                            character: nodes[nodes.length - 1].getRange().end.character
                        }
                    }
                    canvasPortNode = new InvisibleNodeModel("border", nodeRange, null);
                }
                canvasPortNode.setPosition(-OFFSET.START.X, OFFSET.START.Y);
                const canvasPortLink = props.invertDirection ? createLinks(nodes[nodes.length - 1], canvasPortNode) : createLinks(canvasPortNode, nodes[0]);
                model.addAll(...canvasPortLink);

                if (nodes.length > 1) {
                    for (let i = 0; i < nodes.length; i++) {
                        for (let j = i + 1; j < nodes.length; j++) {
                            if (nodes[i].getParentNode() == nodes[j].getParentNode()) {
                                const link = createLinks(nodes[i], nodes[j]);
                                model.addAll(...link);
                                break;
                            }
                        }
                    }
                }

                model.setOffsetX(OFFSET.START.X);
                diagramEngine.setModel(model);
                setEngine(diagramEngine);
                await autoDistribute();
                setLoading(false);
            } else {
                setLoading(false);
            }
        })();
    }, []);

    async function autoDistribute() {
        if (!props.invertDirection) {
            let x = OFFSET.START.X;
            let y = OFFSET.START.Y;
            for (let i = 1; i < diagramEngine.getModel().getNodes().length; i++) {
                const node = diagramEngine.getModel().getNodes()[i];
                console.log(node);
                node.setPosition(x, y);
                x += OFFSET.BETWEEN.X;
                y += OFFSET.BETWEEN.Y;
            }
        } else {
            let x = 500;
            let y = OFFSET.START.Y;
            for (let i = 0; i < diagramEngine.getModel().getNodes().length - 1; i++) {
                const node = diagramEngine.getModel().getNodes()[i];
                console.log(node);
                node.setPosition(x, y);
                x -= node.width + OFFSET.BETWEEN.X;
                y += OFFSET.BETWEEN.Y;
            }
        }
    };

    if (isLoading) {
        return <h1>Loading...</h1>;
    } else {
        return <div style={{
            backgroundColor: 'var(--vscode-panel-background)',
            maxHeight: "50vh",
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
