/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import { Point } from "@projectstorm/geometry";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { DataMapperNodeModel } from "../commons/DataMapperNode";

export const LOCAL_VAR_MANAGER_NODE_TYPE = "datamapper-node-manage-local-vars";

export class LocalVarManagerNode extends DataMapperNodeModel {
    public x: number;
    public y: number;
    constructor(
        public context: IDataMapperContext
    ) {
        super(
            context,
            LOCAL_VAR_MANAGER_NODE_TYPE
        );
    }

    async initPorts() {
        // Ports are not applicable
    }

    initLinks() {
        // Links are not applicable
    }

    setPosition(point: Point): void;
    setPosition(x: number, y: number): void;
    setPosition(x: unknown, y?: unknown): void {
        if (typeof x === 'number' && typeof y === 'number') {
            if (!this.x || !this.y) {
                this.x = x;
                this.y = y;
                super.setPosition(x, y);
            }
        }
    }
}
