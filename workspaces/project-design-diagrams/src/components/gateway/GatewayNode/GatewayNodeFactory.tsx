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
