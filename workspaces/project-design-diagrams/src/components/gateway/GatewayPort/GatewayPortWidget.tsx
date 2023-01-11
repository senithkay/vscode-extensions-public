/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */
import React, { CSSProperties } from 'react';
import { DiagramEngine, PortWidget } from '@projectstorm/react-diagrams-core';
import { GatewayPortModel } from './GatewayPortModel';
import { GatewayType } from "../types";

interface GatewayPortWidgetProps {
    engine: DiagramEngine;
    port: GatewayPortModel;
    type: GatewayType;
}

export function GatewayPortWidget(props: GatewayPortWidgetProps) {
    const { engine, port, type } = props;
    let portStyles: CSSProperties = { bottom: 0 };
    switch (type) {
        case 'NORTH':
            portStyles = { top: 30, left: 40 };
            break;
        case 'EAST':
            portStyles = { top: 12 };
            break;
        case 'SOUTH':
            portStyles = { top: 12, left: 40 };
            break;
        case 'WEST':
            portStyles = { top: 12, left: 40 };
            break;
    }

    return (
        <PortWidget
            port={port}
            engine={engine}
            style={{
                height: '5px',
                position: 'absolute',
                width: '2px',
                ...portStyles
            }}
        />
    );
}
