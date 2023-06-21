/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from 'react';
import { GatewayLinkWidget } from './GatewayLinkWidget';
import { GATEWAY_LINK_TYPE } from "../types";
import { DefaultLinkFactory } from "@projectstorm/react-diagrams-defaults";
import { GatewayLinkModel } from "./GatewayLinkModel";

export class GatewayLinkFactory extends DefaultLinkFactory {

    constructor() {
        super(GATEWAY_LINK_TYPE);
    }

    generateModel(event: { initialConfig: any }): GatewayLinkModel {
        return new GatewayLinkModel(event.initialConfig.level);
    }

    generateReactWidget(event: { model: GatewayLinkModel }): JSX.Element {
        return <GatewayLinkWidget link={event.model} engine={this.engine}/>;
    }
}
