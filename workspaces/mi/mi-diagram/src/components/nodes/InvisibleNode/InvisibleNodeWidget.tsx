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
import { OFFSET } from '../../../constants';

export function InvisibleNodeWidget(props: BaseNodeProps) {
    props.diagramEngine.getModel().registerListener({
        eventWillFire: (event: any) => {
            if (event.offsetX && event.offsetY) {
                const zoom = props.diagramEngine.getModel().getZoomLevel() / 100;
                const offsetX = - event.offsetX;
                const offsetY = (OFFSET.START.Y * zoom) - event.offsetY + (props.node.isInOutSequenceNode() ? OFFSET.BETWEEN.SEQUENCE : 0);
                props.node.setPosition(offsetX, offsetY);
            }
        }
    });

    return (
        <><PortWidget
            style={{
                right: 0,
                top: props.node.height / 2,
                width: props.node.width,
                height: props.node.height,
                position: 'absolute'
            }}
            port={props.node.getPort(PortModelAlignment.RIGHT)}
            engine={props.diagramEngine}
        >
        </PortWidget>
        </>
    );
}

