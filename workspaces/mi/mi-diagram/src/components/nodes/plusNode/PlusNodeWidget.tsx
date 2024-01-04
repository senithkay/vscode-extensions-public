/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useContext } from 'react';
import { BaseNodeProps } from '../../base/base-node/base-node';
import SidePanelContext from '../../sidePanel/SidePanelContexProvider';
import { Range } from '@wso2-enterprise/mi-syntax-tree/lib/src';
import { MediatorPortWidget } from '../../port/MediatorPortWidget';

export interface PlusNodeWidgetProps extends BaseNodeProps {
    range: Range;
    documentUri: string;
}

export function PlusNodeWidget(props: PlusNodeWidgetProps) {
    const node = props.node;
    const sidePanelContext = useContext(SidePanelContext)

    const nodePosition = node.getPosition();

    const leftPort = node.getPortByAllignment('left');
    const rightPort = node.getPortByAllignment('right');
    leftPort.setPosition(nodePosition.x, nodePosition.y + node.height / 2);
    rightPort.setPosition(nodePosition.x + node.width, nodePosition.y + node.height / 2);
    const topPort = node.getPortByAllignment('top');
    const bottomPort = node.getPortByAllignment('bottom');
    topPort.setPosition(nodePosition.x + node.width / 2, nodePosition.y);
    bottomPort.setPosition(nodePosition.x + node.width / 2, nodePosition.y + node.height);

    function handleClick() {
        sidePanelContext.setNodeRange(props.range);
        sidePanelContext.setIsOpen(true);
    }

    return (
        <>
            <svg
                width={props.node.width}
                height={props.node.height}
                viewBox="0 0 600 600"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <g
                    style={{ cursor: "pointer" }}
                    onClick={handleClick}
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

