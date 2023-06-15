/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
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
