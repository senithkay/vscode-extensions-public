/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { NodeModel, DefaultPortModel } from '@projectstorm/react-diagrams';
import { STNode } from '@wso2-enterprise/mi-syntax-tree/src';

export class MediatorNodeModel extends NodeModel {
    readonly stNode: STNode;
    
    constructor(stNode: STNode) {
        super({
            type: "mediator-node",
        });
        this.stNode = stNode;
        this.addPort(new DefaultPortModel({ in: true, name: 'in' }));
        this.addPort(new DefaultPortModel({ in: false, name: 'out' }));
    }
}
