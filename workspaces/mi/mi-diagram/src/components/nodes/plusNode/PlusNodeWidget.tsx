/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from 'react';
import { PortWidget } from '@projectstorm/react-diagrams-core';
import { BaseNodeProps } from '../../base/base-node/base-node';

export interface PlusNodeWidgetProps extends BaseNodeProps {
    level: string;
}

export function PlusNodeWidget(props: PlusNodeWidgetProps) {
    return (
        <>
            <svg
                width={props.width}
                height={props.height}
                viewBox="0 0 600 600"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <g
                    style={{ cursor: "pointer" }}
                >
                    <circle cx="300" cy="300" r="300" fill="#fff" stroke="#000" strokeWidth="2" filter="url(#shadow)" />
                    <path d="M300 200V400M200 300H400" stroke="#000" strokeWidth="40" strokeLinecap="round" />
                    <defs>
                        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feOffset result="offOut" in="SourceAlpha" dx="5" dy="5" />
                            <feGaussianBlur result="blurOut" in="offOut" stdDeviation="5" />
                            <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
                        </filter>
                    </defs>
                </g>
            </svg>
            <PortWidget
                style={{
                    left: 0,
                    top: props.height / 2,
                    position: 'absolute'
                }}
                port={props.node.getPortByAllignment('left')}
                engine={props.diagramEngine}
            >
            </PortWidget>
            <PortWidget
                style={{
                    right: 0,
                    top: props.height / 2,
                    position: 'absolute'
                }}
                port={props.node.getPortByAllignment('right')}
                engine={props.diagramEngine}
            >
            </PortWidget>
        </>
    );
}

