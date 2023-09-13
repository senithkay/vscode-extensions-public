/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { PortModelAlignment } from "@projectstorm/react-diagrams";
import { SharedNodeModel } from "../../shared-node/shared-node";
import { ConnectionPortModel } from "../ConnectionPort/ConnectionPortModel";
import { Connection } from "../../../types";
import { CONNECTION_NODE } from "../../../resources";

export enum Orientation {
    VERTICAL = "vertical",
    HORIZONTAL = "horizontal",
}

export class ConnectionModel extends SharedNodeModel {
    readonly connection: Connection;
    readonly orientation: Orientation;

    constructor(connectionName: string, connection: Connection, orientation?: Orientation) {
        super(CONNECTION_NODE, connectionName);
        this.connection = connection;
        this.orientation = orientation || Orientation.VERTICAL;

        this.addPort(new ConnectionPortModel(connectionName, PortModelAlignment.TOP));
        this.addPort(new ConnectionPortModel(connectionName, PortModelAlignment.BOTTOM));

        this.addPort(new ConnectionPortModel(connectionName, PortModelAlignment.LEFT));
        this.addPort(new ConnectionPortModel(connectionName, PortModelAlignment.RIGHT));
    }
}
