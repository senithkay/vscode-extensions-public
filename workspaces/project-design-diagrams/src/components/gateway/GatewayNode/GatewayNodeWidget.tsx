/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from 'react';
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { GatewayNodeModel } from './GatewayNodeModel';
import { GatewayContainer } from './style';
import { GatewayPortWidget } from '../GatewayPort/GatewayPortWidget';
import { GatewayPortModel } from '../GatewayPort/GatewayPortModel';

interface GatewayNodeWidgetProps {
    node: GatewayNodeModel;
    engine: DiagramEngine;
}

export function GatewayNodeWidget(props: GatewayNodeWidgetProps) {
    const { node, engine } = props;

    let transform: string = '';
    let topMargin: number = 0;
    let leftMargin: number = 0;
    switch (node.type) {
        case 'NORTH':
            transform = 'rotate(0)';
            topMargin = -200;
            leftMargin = 500;
            break;
        case 'SOUTH':
            transform = 'rotate(0)';
            break;
        case 'EAST':
            topMargin = 200;
            leftMargin = 1000;
            break;
        case 'WEST':
            break;
        default:
    }

    return (
        <GatewayContainer
            topMargin = {topMargin}
            leftMargin = {leftMargin}
            rotate = {transform}
        >
            {node.label}
            <GatewayPortWidget
                port={node.getPort('in') as GatewayPortModel}
                engine={engine}
                type={node.type}
            />
            <GatewayPortWidget
                port={node.getPort('out') as GatewayPortModel}
                engine={engine}
                type={node.type}
            />
        </GatewayContainer>
    );
}
