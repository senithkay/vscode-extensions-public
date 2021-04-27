/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

import { LocalVarDecl, MappingConstructor, RecordField, RecordTypeDesc, SpecificField, Visitor } from "@ballerina/syntax-tree";

import { DataMapperViewState } from "../viewstate";


const DEFAULT_OFFSET = 20;

export class DataMapperPositionVisitor implements Visitor {
    private height: number;
    private offset: number;
    private startOffset: number;
    private maxOffset: number;

    constructor(height: number, startOffset: number) {
        this.height = height;
        this.offset = startOffset;
        this.startOffset = startOffset;
        this.maxOffset = 0;
    }

    beginVisitLocalVarDecl(node: LocalVarDecl) {
        if (node.dataMapperViewState) {
            const viewState = node.dataMapperViewState as DataMapperViewState;
            viewState.bBox.x = this.offset;
            viewState.bBox.y = this.height;
        }
    }

    endVisitLocalVarDecl(node: LocalVarDecl) {
        if (node.dataMapperViewState) {
            this.height += DEFAULT_OFFSET * 2;
            this.offset = this.startOffset;
        }
    }

    beginVisitRecordTypeDesc(node: RecordTypeDesc) {
        if (node.dataMapperViewState) {
            this.height += DEFAULT_OFFSET;
            this.offset += DEFAULT_OFFSET;

            if (this.maxOffset < this.offset) {
                this.maxOffset = this.offset;
            }
        }
    }

    endVisitRecordTypeDesc(node: RecordTypeDesc) {
        if (node.dataMapperViewState) {
            this.offset -= DEFAULT_OFFSET;
        }
    }

    beginVisitRecordField(node: RecordField) {
        if (node.dataMapperViewState) {
            const viewState = node.dataMapperViewState as DataMapperViewState;
            viewState.bBox.y = this.height;
            viewState.bBox.x = this.offset;
        }
    }

    endVisitRecordField(node: RecordField) {
        if (node.dataMapperViewState) {
            this.height += DEFAULT_OFFSET;
        }
    }

    beginVisitMappingConstructor(node: MappingConstructor) {
        if (node.dataMapperViewState) {
            this.height += DEFAULT_OFFSET;
            this.offset += DEFAULT_OFFSET;

            if (this.maxOffset < this.offset) {
                this.maxOffset = this.offset;
            }
        }
    }

    beginVisitSpecificField(node: SpecificField) {
        if (node.dataMapperViewState) {
            const viewstate = node.dataMapperViewState as DataMapperViewState;

            viewstate.bBox.x = this.offset;
            viewstate.bBox.y = this.height;
        }
    }

    endVisitSpecificField(node: SpecificField) {
        if (node.dataMapperViewState) {
            this.height += DEFAULT_OFFSET;
        }
    }

    endVisitMappingConstructor(node: MappingConstructor) {
        if (node.dataMapperViewState) {
            this.offset -= DEFAULT_OFFSET;
            this.height -= DEFAULT_OFFSET;
        }
    }
}
