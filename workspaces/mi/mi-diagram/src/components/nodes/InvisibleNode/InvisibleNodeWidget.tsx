/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from 'react';
import { PortModelAlignment, PortWidget } from '@projectstorm/react-diagrams-core';
import { BaseNodeProps } from '../../base/base-node/base-node';

export function InvisibleNodeWidget(props: BaseNodeProps) {
    return (
        <><PortWidget
            style={{
                right: 0,
                top: 0,
                position: 'absolute'
            }}
            port={props.node.getPort(PortModelAlignment.RIGHT)}
            engine={props.diagramEngine}
        >
        </PortWidget>
        </>
    );
}

