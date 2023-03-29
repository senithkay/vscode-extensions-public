/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
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
import {
    ExpressionFunctionBody,
    IdentifierToken,
    SelectClause,
    STNode,
} from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { EditableRecordField } from "../../Mappings/EditableRecordField";
import { FieldAccessToSpecificFied } from "../../Mappings/FieldAccessToSpecificFied";
import {
    getSearchFilteredOutput
} from "../../utils/dm-utils";
import { DataMapperNodeModel, TypeDescriptor } from "../commons/DataMapperNode";

export const UNION_TYPE_NODE_TYPE = "data-mapper-node-union-type";

export class UnionTypeNode extends DataMapperNodeModel {

    public recordField: EditableRecordField;
    public typeName: string;
    public rootName: string;
    public mappings: FieldAccessToSpecificFied[];
    public x: number;
    public y: number;

    constructor(
        public context: IDataMapperContext,
        public value: ExpressionFunctionBody | SelectClause,
        public typeIdentifier: TypeDescriptor | IdentifierToken,
        public typeDef: Type
    ) {
        super(
            context,
            UNION_TYPE_NODE_TYPE
        );
    }

    async initPorts() {
        this.typeDef = getSearchFilteredOutput(this.typeDef);
    }

    initLinks(): void {
        this.mappings = this.genMappings(this.value.expression);
        this.createLinks(this.mappings);
    }

    private createLinks(mappings: FieldAccessToSpecificFied[]) {
        mappings.forEach((mapping) => {
            // TODO: Handle create links
        });
    }

    async deleteField(field: STNode) {
        // TODO: Handle delete
    }

    public updatePosition() {
        this.setPosition(this.position.x, this.position.y);
    }

    setPosition(point: Point): void;
    setPosition(x: number, y: number): void;
    setPosition(x: unknown, y?: unknown): void {
        if (typeof x === 'number' && typeof y === 'number') {
            if (!this.x || !this.y) {
                this.x = x;
                this.y = y;
            }
            super.setPosition(x, y || this.y);
        }
    }
}
