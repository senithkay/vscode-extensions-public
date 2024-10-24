/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Point } from "@projectstorm/geometry";
import { OutputType, TypeKind } from "@wso2-enterprise/ballerina-core";

import { useDMCollapsedFieldsStore } from "../../../../store/store";
import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { DMTypeWithValue } from "../../Mappings/DMTypeWithValue";
import { MappingMetadata } from "../../Mappings/MappingMetadata";
import { DataMapperNodeModel } from "../commons/DataMapperNode";
import { getSearchFilteredOutput, hasNoOutputMatchFound } from "../../utils/search-utils";
import { getTypeName } from "../../utils/type-utils";
import { OBJECT_OUTPUT_TARGET_PORT_PREFIX } from "../../utils/constants";
import { STNode } from "@wso2-enterprise/syntax-tree";

export const OBJECT_OUTPUT_NODE_TYPE = "data-mapper-node-object-output";
const NODE_ID = "object-output-node";

export class ObjectOutputNode extends DataMapperNodeModel {
    public filteredOutputType: OutputType;
    public dmTypeWithValue: DMTypeWithValue;
    public typeName: string;
    public rootName: string;
    public mappings: MappingMetadata[];
    public hasNoMatchingFields: boolean;
    public x: number;
    public y: number;
    public isMapFn: boolean;

    constructor(
        public context: IDataMapperContext,
        public outputType: OutputType
    ) {
        super(
            NODE_ID,
            context,
            OBJECT_OUTPUT_NODE_TYPE
        ); 
    }

    async initPorts() {
        this.filteredOutputType = getSearchFilteredOutput(this.outputType);

        if (this.filteredOutputType) {
            this.rootName = this.filteredOutputType?.fieldName;

            const collapsedFields = useDMCollapsedFieldsStore.getState().collapsedFields;
            this.typeName = getTypeName(this.filteredOutputType);

            this.hasNoMatchingFields = hasNoOutputMatchFound(this.outputType, this.filteredOutputType);
    
            const parentPort = this.addPortsForHeader(
                this.filteredOutputType, this.rootName, "IN", OBJECT_OUTPUT_TARGET_PORT_PREFIX,
                collapsedFields, this.isMapFn
            );
    
            if (this.filteredOutputType.kind === TypeKind.Record) {
                if (this.filteredOutputType.fields.length) {
                    this.filteredOutputType.fields.forEach(field => {
                        this.addPortsForOutputField(
                            field, "IN", this.rootName, undefined, OBJECT_OUTPUT_TARGET_PORT_PREFIX,
                            parentPort, collapsedFields, parentPort.collapsed, this.isMapFn
                        );
                    });
                }
            }
        }
    }

    initLinks(): void {
        // TODO: Implement
    }

    private createLinks(mappings: MappingMetadata[]) {
        // TODO: Implement
    }

    async deleteField(field: STNode, keepDefaultVal?: boolean) {
        // TODO: Implement
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
            super.setPosition(x, y);
        }
    }
}
