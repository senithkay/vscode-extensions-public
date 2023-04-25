/*
 * Copyright (c) 2023, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import { Type } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { CaptureBindingPattern, RecordTypeDesc } from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { DataMapperNodeModel } from "../commons/DataMapperNode";

export const SEARCH_NODE_TYPE = "datamapper-node-search";
export enum SearchType { Input, Output };

export class SearchNode extends DataMapperNodeModel {

    public sourceTypeDesc: RecordTypeDesc;
    public typeDef: Type;
    public sourceBindingPattern: CaptureBindingPattern;
    public x: number;
    public y: number;
    public type: SearchType

    constructor(public context: IDataMapperContext, type: SearchType) {
        super(
            context,
            SEARCH_NODE_TYPE,
        );
        this.type = type;
    }

    initPorts(): void {
        // This node does not have any ports
    }

    async initLinks() {
        // This node does not have any links
    }

    public updatePosition() {
        if (this.type === SearchType.Output) {
            this.setPosition(this.position.x, this.position.y);
        }
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
