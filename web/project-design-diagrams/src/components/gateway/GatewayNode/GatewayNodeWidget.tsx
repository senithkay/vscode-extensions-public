/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import React, {CSSProperties } from 'react';
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

    let transform: string;
    let topMargin: number;
    let leftMargin: number;
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
            transform = 'rotate(90deg)';
            topMargin = 200;
            leftMargin = 1000;
            break;
        case 'WEST':
            transform = 'rotate(-90deg)';
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
            />
            <GatewayPortWidget
                port={node.getPort('out') as GatewayPortModel}
                engine={engine}
            />
        </GatewayContainer>
    );
}
