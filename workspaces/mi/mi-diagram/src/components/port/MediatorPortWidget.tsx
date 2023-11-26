/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { CSSProperties } from 'react';
import { DiagramEngine, PortModelAlignment, PortWidget } from '@projectstorm/react-diagrams';
import { MediatorPortModel } from './MediatorPortModel';
import { inclusionPortStyles, sidePortStyles } from './styles';

interface CustomPortProps {
    port: MediatorPortModel;
    engine: DiagramEngine;
    node: any;
}

export function MediatorPortWidget(props: CustomPortProps) {
    const { port, engine } = props;
    const portStyles: CSSProperties = port.getOptions().alignment === PortModelAlignment.LEFT ?
        { left: 0, ...sidePortStyles } : port.getOptions().alignment === PortModelAlignment.RIGHT ?
            { left: 0, ...sidePortStyles } : port.getOptions().alignment === PortModelAlignment.TOP ?
                { top: 0, ...inclusionPortStyles } : { bottom: 0, ...inclusionPortStyles };

    return (
        <PortWidget
            engine={engine}
            port={port}
            style={{
                    ...portStyles,
                    left: 0,
                    top: props.node.height / 2,
                    
                }}
        />
    )
}
