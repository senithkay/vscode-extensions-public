/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from 'react';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';
import { GatewayNodeWidget } from './GatewayNodeWidget';
import { GatewayNodeModel } from './GatewayNodeModel';
import { GATEWAY_NODE_TYPE, GatewayType } from '../types';

interface GenerateReactWidgetProps {
    model: GatewayNodeModel;
}

export class GatewayNodeFactory extends AbstractReactFactory<GatewayNodeModel,
    DiagramEngine> {
    constructor() {
        super(GATEWAY_NODE_TYPE);
    }

    // eslint-disable-next-line class-methods-use-this
    generateModel(event: {
        initialConfig: { type: GatewayType; label: string };
    }) {
        return new GatewayNodeModel(
            event.initialConfig.type,
            event.initialConfig.label
        );
    }

    generateReactWidget(event: GenerateReactWidgetProps): JSX.Element {
        return <GatewayNodeWidget engine={this.engine} node={event.model}/>;
    }
}
