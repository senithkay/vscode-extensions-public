/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { DiagramEngine, PortModel } from '@projectstorm/react-diagrams';
import { AbstractModelFactory } from '@projectstorm/react-canvas-core';
import { GatewayPortModel } from './GatewayPortModel';
import { GATEWAY_PORT_TYPE } from "../types";

export class GatewayPortFactory extends AbstractModelFactory<PortModel,
    DiagramEngine> {
    constructor() {
        super(GATEWAY_PORT_TYPE);
    }

    // eslint-disable-next-line class-methods-use-this
    generateModel(event: { initialConfig: any }): PortModel {
        return new GatewayPortModel(
            event.initialConfig.name,
            event.initialConfig.type,
            event.initialConfig.type,
        );
    }
}
