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
import { getSVGIcon } from '../Icons';

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
            {getSVGIcon(props.name, props.description, node.width, node.height)}
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

