/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from 'react';
import { BaseNodeProps } from '../../../base/base-node/base-node';
import { MediatorPortWidget } from '../../../port/MediatorPortWidget';
import { SimpleMediatorNodeModel } from './SimpleMediatorModel';

export interface SimpleMediatorWidgetProps extends BaseNodeProps {
    name: string;
    description: string;
}

export function MediatorNodeWidget(props: SimpleMediatorWidgetProps) {
    const node: SimpleMediatorNodeModel = props.node as SimpleMediatorNodeModel;

    const nodePosition = node.getPosition();

    const leftPort = node.getPortByAllignment('left');
    const rightPort = node.getPortByAllignment('right');
    leftPort.setPosition(nodePosition.x, nodePosition.y + node.height / 2);
    rightPort.setPosition(nodePosition.x + node.width, nodePosition.y + node.height / 2);

    return (
        <>
            <svg
                width={props.node.width}
                height={props.node.height}
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
                >{props.name} ({props.description})</text>
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

