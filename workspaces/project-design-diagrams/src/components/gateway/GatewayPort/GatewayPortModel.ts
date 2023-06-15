/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */
import {
    LinkModel,
    PortModel,
    DefaultLinkModel,
    PortModelAlignment,
} from '@projectstorm/react-diagrams';
import { GATEWAY_PORT_TYPE, GatewayType } from "../types";

export class GatewayPortModel extends PortModel {
    constructor(name: string, alignment: PortModelAlignment, portType : GatewayType) {
        super({
            type: GATEWAY_PORT_TYPE,
            name,
            id: `${portType}-${name}`,
            alignment
        });
    }

    // eslint-disable-next-line class-methods-use-this
    createLinkModel(): LinkModel {
        return new DefaultLinkModel();
    }
}
