/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { PortModelAlignment } from '@projectstorm/react-diagrams';
import { SharedNodeModel } from '../../shared-node/shared-node';
import { ComponentPortModel } from '../ComponentPort/ComponentPortModel';
import { Component } from '../../../types';
import { COMPONENT_NODE } from '../../../resources';

export class ComponentModel extends SharedNodeModel {
    readonly component: Component;

    constructor(componentName: string, component: Component) {
        super(COMPONENT_NODE, componentName);
        this.component = component;

        this.addPort(new ComponentPortModel(componentName, PortModelAlignment.LEFT));
        this.addPort(new ComponentPortModel(componentName, PortModelAlignment.RIGHT));

        this.addPort(new ComponentPortModel(componentName, PortModelAlignment.TOP));
        this.addPort(new ComponentPortModel(componentName, PortModelAlignment.BOTTOM));
    }
}
