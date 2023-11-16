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
    DagreEngine,
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
    const [haveNodes, setHaveNodes] = useState<boolean>(false);
    const [isDitributing, setIsDitributing] = useState<boolean>(true);

    const dagreEngine = new DagreEngine({
        graph: {
            rankdir: props.invertDirection ? 'RL' : 'LR',
            ranksep: 70,
            edgesep: 50,
            nodesep: 10,
            ranker: 'longest-path',
            marginx: 120,
            marginy: 40
        }
    });

    useEffect(() => {
        setLoading(true);
        setHaveNodes(false);
        setIsDitributing(true);
        (async () => {
            const nodes = [...props.nodes];
            if (nodes.length > 0) {
                model.addAll(...nodes);

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

                let canvasPortNode;
                let canvasPortLink;
                if (props.invertDirection) {
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
                    canvasPortLink = createLinks(nodes[nodes.length - 1], canvasPortNode);
                } else {
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
                    canvasPortLink = createLinks(canvasPortNode, nodes[0]);
                }

                canvasPortNode.setPosition(0, OFFSET.START.Y);
                model.setOffsetX(OFFSET.START.X);

                model.setLocked(true);

                diagramEngine.setModel(model);
                setEngine(diagramEngine);
                setHaveNodes(true);
                setLoading(false);
                await autoDistribute();

                model.addAll(canvasPortNode, ...canvasPortLink);

                setIsDitributing(false);
            } else {
                setLoading(false);
                setIsDitributing(false);
            }
        })();
    }, []);

    async function autoDistribute() {
        return new Promise(function (resolve) {
            setTimeout(() => {
                dagreEngine.redistribute(diagramEngine.getModel());
                diagramEngine.setModel(model);
                resolve(true);
            }, 30);
        });
    };

    if (isLoading) {
        return <h1>Loading...</h1>;
    } else {
        return <div style={{
            backgroundColor: 'var(--vscode-panel-background)',
            maxHeight: "50vh",
            overflow: "hidden",
            opacity: isDitributing ? "0%" : "100%",
        }}>
            <CanvasContainer>
                {haveNodes && <NavigationWrapperCanvasWidget
                    diagramEngine={diagramEngine as any}
                    disableZoom={true}
                />}
            </CanvasContainer>
        </div>;
    }
}
