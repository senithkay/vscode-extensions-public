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
import { PortModelAlignment } from '@projectstorm/react-diagrams';
import { DiagramEngine, PortWidget } from '@projectstorm/react-diagrams-core';
import { ServicePortModel } from './ServicePortModel';

interface CustomPortWidgetProps {
    engine: DiagramEngine;
    port: ServicePortModel;
}

export function ServicePortWidget(props: CustomPortWidgetProps) {
    const { engine, port } = props;
    let portStyles: CSSProperties = { right: 0 };
    switch (port.getOptions().alignment) {
        case PortModelAlignment.LEFT:
            if (port.getID().includes(`left-gw-`)) {
                portStyles = { left: 0, top: 25, zIndex: 1 };
            } else {
                portStyles = { left: 0, zIndex: 0 };
            }
            break;
        case PortModelAlignment.TOP:
            portStyles = { top: 0 };
            break;
    }

    return <PortWidget
        port={port}
        engine={engine}
        style={{
            height: '5px',
            position: 'absolute',
            width: '2px',
            ...portStyles
        }}
    />
}
