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
import { CellPortModel } from '../../Cell/CellPort/CellPortModel';


export class ExternalModel extends SharedNodeModel {

    constructor(externalName: string) {
        super('externalNode', externalName);
        
        this.addPort(new CellPortModel(externalName , PortModelAlignment.LEFT));
        this.addPort(new CellPortModel(externalName , PortModelAlignment.RIGHT));
        this.addPort(new CellPortModel(externalName , PortModelAlignment.TOP));
        this.addPort(new CellPortModel(externalName , PortModelAlignment.BOTTOM));        
    }
}
