/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Point } from "@projectstorm/geometry";
import { PortModel, PortModelGenerics } from "@projectstorm/react-diagrams";
import { QueryExpression } from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { RightAnglePortModel } from "../../Port/RightAnglePort/RightAnglePortModel";
import { DataMapperNodeModel } from "../commons/DataMapperNode";

export const EXPANDED_MAPPING_HEADER_NODE_TYPE = "datamapper-node-expanded-mapping-header";

export class ExpandedMappingHeaderNode extends DataMapperNodeModel {

    public x: number;
    public y: number;
    public sourcePort: RightAnglePortModel;
    public targetPorts: PortModel<PortModelGenerics>[];

    constructor(
        public context: IDataMapperContext,
        public queryExpr: QueryExpression
    ) {
        super(
            context,
            EXPANDED_MAPPING_HEADER_NODE_TYPE
        );
    }

    initPorts() {
        this.sourcePort = new RightAnglePortModel(false, EXPANDED_MAPPING_HEADER_NODE_TYPE)
        this.addPort(this.sourcePort);
    }

    initLinks() {
        for (const targetPort of this.targetPorts) {
            const link = this.sourcePort.link(targetPort)
            this.getModel().addAll(link);
        }
    }

    setPosition(point: Point): void;
    setPosition(x: number, y: number): void;
    setPosition(x: unknown, y?: unknown): void {
        if (typeof x === 'number' && typeof y === 'number') {
            if (!this.x || !this.y) {
                this.x = x;
                this.y = y;
            }
            super.setPosition(x, y);
        }
    }
}
