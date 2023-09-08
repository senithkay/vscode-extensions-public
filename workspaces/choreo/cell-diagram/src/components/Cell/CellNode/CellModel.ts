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
import { CellPortModel } from '../CellPort/CellPortModel';
import { ConnectorModel } from '../../Connector/ConnectorNode/ConnectorModel';
import { getCellPortName } from './cell-util';

export enum CellBounds {
    NorthBound = "nb",
    SouthBound = "sb",
    EastBound = "eb",
    WestBound = "wb",
}

export class CellModel extends SharedNodeModel {
    readonly connectorNodes?: ConnectorModel[];

    constructor(cellName: string, connectorNodes?: ConnectorModel[]) {
        super('cellNode', cellName);
        this.connectorNodes = connectorNodes;

        // North bound ports - for public exposed APIs
        const northBoundPortName = getCellPortName(cellName, CellBounds.NorthBound);
        this.addPort(new CellPortModel(northBoundPortName , PortModelAlignment.TOP));
        this.addPort(new CellPortModel(northBoundPortName, PortModelAlignment.BOTTOM));
        
        // East bound ports
        const eastBoundPortName = getCellPortName(cellName, CellBounds.EastBound);
        this.addPort(new CellPortModel(eastBoundPortName, PortModelAlignment.LEFT));
        this.addPort(new CellPortModel(eastBoundPortName, PortModelAlignment.RIGHT));
        
        // West bound ports
        const westBoundPortName = getCellPortName(cellName, CellBounds.WestBound);
        this.addPort(new CellPortModel(westBoundPortName, PortModelAlignment.LEFT));
        this.addPort(new CellPortModel(westBoundPortName, PortModelAlignment.RIGHT));
        
        // South bound ports - for connectors
        if (this.connectorNodes) {
            this.connectorNodes.forEach((connectorNode: ConnectorModel) => {
                const southBoundPortName = getCellPortName(cellName, CellBounds.SouthBound, connectorNode.getID());
                this.addPort(new CellPortModel(southBoundPortName, PortModelAlignment.TOP));
                this.addPort(new CellPortModel(southBoundPortName, PortModelAlignment.BOTTOM));
            });
        }
    }
}
