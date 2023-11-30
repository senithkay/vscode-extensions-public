/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from 'react';
import { PortModelAlignment } from '@projectstorm/react-diagrams-core';
import { BaseNodeProps } from '../../../base/base-node/base-node';
import { AdvancedMediatorNodeModel } from './AdvancedMediatorModel';
import { MediatorPortWidget } from '../../../port/MediatorPortWidget';
import { createLinks, setNodePositions } from '../../../../utils/Utils';
import { PlusNodeModel } from '../../plusNode/PlusNodeModel';

export interface AdvancedMediatorWidgetProps extends BaseNodeProps {
    description: string;
}

export function MediatorNodeWidget(props: AdvancedMediatorWidgetProps) {
    const node: AdvancedMediatorNodeModel = props.node as AdvancedMediatorNodeModel;
    const subSequences = node.subSequences;
    const nodePosition = node.getPosition();

    const leftPort = node.getPortByAllignment(PortModelAlignment.LEFT);
    const rightPort = node.getPortByAllignment(PortModelAlignment.RIGHT);

    let [subSequencesWidth, setSubSequencesWidth] = useState(70);

    let subSequencesHeight = 0;
    useEffect(() => {

        leftPort.setPosition(nodePosition.x, nodePosition.y + node.height / 2);
        rightPort.setPosition(nodePosition.x + node.width, nodePosition.y + node.height / 2);

        subSequences.forEach((subSequence) => {
            let subSequenceHeight = 0;
            const subNodes = subSequence.nodes;
            const subNodesAndLinks = [];

            if (subNodes.length > 1) {
                for (let i = 0; i < subNodes.length; i++) {
                    subSequenceHeight = Math.max(subSequenceHeight, subNodes[i].height);
                    for (let j = i + 1; j < subNodes.length; j++) {
                        if (subNodes[i].getParentNode() == subNodes[j].getParentNode()) {
                            const link = createLinks(subNodes[i], subNodes[j], subNodes[i].getParentNode());
                            props.diagramEngine.getModel().addAll(subNodes[i], ...link, subNodes[j]);
                            subNodesAndLinks.push(subNodes[i], ...link.filter((plusNode) => plusNode instanceof PlusNodeModel), subNodes[j]);
                            break;
                        }
                    }
                }
            } else if (subNodes.length == 1) {
                subSequenceHeight = subNodes[0].height;
                props.diagramEngine.getModel().addNode(subNodes[0]);
                subNodesAndLinks.push(subNodes[0]);
            }

            setNodePositions(subNodesAndLinks, false, nodePosition.x, nodePosition.y + subSequencesHeight + 30, subSequenceHeight + 25);
            subSequence.width = subNodes.length > 0 ? (subNodes[subNodes.length - 1].getX() - subNodes[0].getX()) + subNodes[subNodes.length - 1].width + 75 : 0;
            subSequence.height = subSequenceHeight + 25;
            subSequencesWidth = Math.max(subSequencesWidth, subSequence.width);
            subSequencesHeight += subSequence.height + 30;
        });

        node.height = subSequencesHeight + 20;
        node.width = subSequencesWidth + 112;
        setSubSequencesWidth(subSequencesWidth);
    }, [node.height, node.width, subSequencesHeight, subSequencesWidth]);

    node.fireEvent({}, "updateDimensions");
    return (
        <>
            <div style={{
                display: "flex",
                border: "1px",
                borderStyle: "solid",
                borderColor: "var(--vscode-panel-dropBorder)",
                height: props.node.height - 2,
                width: props.node.width,
                position: 'relative',
                zIndex: 1
            }}>
                <div style={{
                    padding: "10px",
                    alignItems: "center",
                    display: "flex",
                }}>
                    <svg
                        width={50}
                        height={70}
                        viewBox="0 0 600 600"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <circle id="Ellipse 1" cx="300" cy="300" r="300" fill="#3D84B8" />
                        <text
                            x="50%"
                            y="75%"
                            dominant-baseline="middle"
                            text-anchor="middle"
                            fill="white"
                            font-size="70px"
                            font-family="Arial, Helvetica, sans-serif"
                            font-weight="bold"
                        >LOG ({props.description})</text>
                        <g id="Group 1" transform="translate(10,-30)">
                            <rect
                                id="Rectangle 1"
                                x="157"
                                y="289"
                                width="128"
                                height="25"
                                rx="12.5"
                                fill="white"
                            />
                            <rect
                                id="Rectangle 5"
                                x="118"
                                y="344"
                                width="94"
                                height="25"
                                rx="12.5"
                                fill="white"
                            />
                            <rect
                                id="Rectangle 7"
                                x="118"
                                y="400"
                                width="354"
                                height="23"
                                rx="11.5"
                                fill="white"
                            />
                            <rect
                                id="Rectangle 6"
                                x="223"
                                y="344"
                                width="105"
                                height="25"
                                rx="12.5"
                                fill="white"
                            />
                            <rect
                                id="Rectangle 2"
                                x="118"
                                y="234"
                                width="143"
                                height="24"
                                rx="12"
                                fill="white"
                            />
                            <rect
                                id="Rectangle 4"
                                x="118"
                                y="179"
                                width="239"
                                height="25"
                                rx="12.5"
                                fill="white"
                            />
                            <rect
                                id="Rectangle 3"
                                x="270"
                                y="234"
                                width="87"
                                height="24"
                                rx="12"
                                fill="white"
                            />
                            <path
                                id="Vector"
                                d="M372.889 192H395.111V343.515L456.222 274.071L472 292L384 392L296 292L311.778 274.071L372.889 343.515V192Z"
                                fill="white"
                            />
                            <rect
                                id="Rectangle 8"
                                x="373"
                                y="177"
                                width="22"
                                height="34"
                                rx="10"
                                fill="white"
                            />
                            <rect
                                id="Rectangle 9"
                                x="463.447"
                                y="266"
                                width="23.4558"
                                height="34"
                                rx="10"
                                transform="rotate(41.3146 463.447 266)"
                                fill="white"
                            />
                            <rect
                                id="Rectangle 10"
                                x="288"
                                y="282.812"
                                width="23.9522"
                                height="34"
                                rx="10"
                                transform="rotate(-41.31 288 282.812)"
                                fill="white"
                            />
                        </g>
                    </svg>
                </div>
                <div
                    style={{
                        width: "fit-content",
                        padding: "10px 10px 0 10px",
                        borderWidth: "0 0 0 1px",
                        borderStyle: "solid",
                        borderColor: "var(--vscode-panel-dropBorder)",
                        // display: "grid",
                        // alignItems: "center",
                    }}
                >
                    {subSequences.map((subSequence) => {
                        return (
                            <div
                                style={{
                                    width: subSequencesWidth,
                                    height: subSequence.height,
                                    padding: "10px",
                                    marginBottom: "10px",
                                    border: "1px",
                                    borderStyle: "solid",
                                    borderColor: "var(--vscode-panel-dropBorder)",
                                    textAlign: "center",
                                }}
                            >
                                <span>{subSequence.name}</span>

                            </div>
                        );
                    },
                    )}
                </div>
            </div>
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
