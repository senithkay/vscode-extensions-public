/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
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
            height: '0.5px',
            position: 'absolute',
            width: '2px',
            ...portStyles
        }}
    />
}
