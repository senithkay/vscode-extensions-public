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

import { AssignmentStatement, LocalVarDecl, MappingConstructor, RecordField, RecordTypeDesc, SpecificField, STKindChecker, Visitor } from "@ballerina/syntax-tree";

import { DataMapperViewState, FieldViewState } from "../viewstate";

import { ADD_FIELD_FORM_HEIGHT } from "./datamapper-sizing-visitor";

export const PADDING_OFFSET = 100;
export const DEFAULT_OFFSET = 40;
const FIRST_FIELD = 'MAP_START_FIELD';

export class DataMapperPositionVisitor implements Visitor {
    private height: number;
    private offset: number;
    private startOffset: number;
    private maxOffset: number;
    private hasDataMapperTypeDesc: boolean;

    constructor(height: number, startOffset: number) {
        this.height = height;
        this.offset = startOffset;
        this.startOffset = startOffset;
        this.maxOffset = 0;
        this.hasDataMapperTypeDesc = false;
    }

    getMaxOffset(): number {
        return this.maxOffset;
    }

    setOffset(offset: number) {
        this.offset = offset;
        this.startOffset = offset;
    }

    setHeight(height: number) {
        this.height = height;
    }

    beginVisitAssignmentStatement(node: AssignmentStatement) {
        if (node.dataMapperViewState) {
            const viewState = node.dataMapperViewState as FieldViewState;
            viewState.bBox.x = this.offset + PADDING_OFFSET;
            viewState.bBox.y = this.height + PADDING_OFFSET;
            this.hasDataMapperTypeDesc = node.dataMapperTypeDescNode !== undefined;
        }
    }

    endVisitAssignmentStatement(node: AssignmentStatement) {
        if (node.dataMapperViewState) {
            const viewState = node.dataMapperViewState as FieldViewState;
            if (viewState.draftViewState) {
                this.height += DEFAULT_OFFSET;
                viewState.draftViewState.bBox.x = this.offset + PADDING_OFFSET;
                viewState.draftViewState.bBox.y = this.height + PADDING_OFFSET;
            }

            let hasDraftViewstate: boolean = false;

            if (node.expression && STKindChecker.isMappingConstructor(node.expression)) {
                node.expression.fields
                    .filter((field) => !STKindChecker.isCommaToken(field))
                    .forEach((field) => {
                        const fieldVS = field.dataMapperViewState as FieldViewState;

                        if (hasDraftViewstate) {
                            fieldVS.bBox.y += ADD_FIELD_FORM_HEIGHT - DEFAULT_OFFSET;
                        }

                        if (fieldVS.draftViewState) {
                            hasDraftViewstate = true;
                        }
                    });
            }

            this.height += DEFAULT_OFFSET * 2;
            this.offset = this.startOffset;
            this.hasDataMapperTypeDesc = false;
        }
    }

    beginVisitLocalVarDecl(node: LocalVarDecl) {
        if (node.dataMapperViewState) {
            const viewState = node.dataMapperViewState as FieldViewState;
            viewState.bBox.x = this.offset + PADDING_OFFSET;
            viewState.bBox.y = this.height + PADDING_OFFSET;
            this.hasDataMapperTypeDesc = node.dataMapperTypeDescNode !== undefined;

        }
    }

    endVisitLocalVarDecl(node: LocalVarDecl) {
        if (node.dataMapperViewState) {
            const viewState = node.dataMapperViewState as FieldViewState;

            if (viewState.draftViewState) {
                this.height += DEFAULT_OFFSET;
                viewState.draftViewState.bBox.x = this.offset + PADDING_OFFSET;
                viewState.draftViewState.bBox.y = this.height + PADDING_OFFSET;
            }

            let hasDraftViewstate: boolean = false;

            if (node.initializer && STKindChecker.isMappingConstructor(node.initializer)) {
                node.initializer.fields
                    .filter((field) => !STKindChecker.isCommaToken(field))
                    .forEach((field) => {
                        const fielVS = field.dataMapperViewState as FieldViewState;

                        if (hasDraftViewstate) {
                            fielVS.bBox.y += ADD_FIELD_FORM_HEIGHT - DEFAULT_OFFSET;
                        }

                        if (fielVS.draftViewState) {
                            hasDraftViewstate = true;
                        }
                    });
            }

            this.height += DEFAULT_OFFSET * 2;
            this.offset = this.startOffset;
            this.hasDataMapperTypeDesc = false;
        }
    }

    beginVisitRecordTypeDesc(node: RecordTypeDesc) {
        this.offset += DEFAULT_OFFSET;

        if (this.maxOffset < (this.offset - this.startOffset)) {
            this.maxOffset = this.offset - this.startOffset;
        }
    }

    endVisitRecordTypeDesc(node: RecordTypeDesc) {
        this.offset -= DEFAULT_OFFSET;
    }

    beginVisitRecordField(node: RecordField) {
        if (node.dataMapperViewState) {
            this.height += DEFAULT_OFFSET;
            const viewState = node.dataMapperViewState as DataMapperViewState;
            viewState.bBox.y = this.height + PADDING_OFFSET;
            viewState.bBox.x = this.offset + PADDING_OFFSET;
        }
    }

    beginVisitMappingConstructor(node: MappingConstructor) {
        this.offset += DEFAULT_OFFSET;

        if (this.maxOffset < (this.offset - this.startOffset)) {
            this.maxOffset = this.offset - this.startOffset;
        }
    }

    beginVisitSpecificField(node: SpecificField) {
        if (node.dataMapperViewState && !this.hasDataMapperTypeDesc) {
            this.height += DEFAULT_OFFSET;
            const viewstate = node.dataMapperViewState as FieldViewState;
            viewstate.bBox.x = this.offset + PADDING_OFFSET;
            viewstate.bBox.y = this.height + PADDING_OFFSET;

        }
    }

    endVisitSpecificField(node: SpecificField) {
        if (node.dataMapperViewState) {
            const viewstate = node.dataMapperViewState as FieldViewState;

            if (viewstate.draftViewState) {
                this.height += DEFAULT_OFFSET;
                viewstate.draftViewState.bBox.x = this.offset + PADDING_OFFSET;
                viewstate.draftViewState.bBox.y = this.height + PADDING_OFFSET;
            }


            let hasDraftViewstate: boolean = false;

            if (node.valueExpr && STKindChecker.isMappingConstructor(node.valueExpr)) {
                node.valueExpr.fields
                    .filter((field) => !STKindChecker.isCommaToken(field))
                    .forEach((field) => {
                        const fieldVS = field.dataMapperViewState as FieldViewState;

                        if (hasDraftViewstate) {
                            fieldVS.bBox.y += ADD_FIELD_FORM_HEIGHT - DEFAULT_OFFSET;
                        }

                        if (fieldVS.draftViewState) {
                            hasDraftViewstate = true;
                        }
                    });
            }

        }
    }

    endVisitMappingConstructor(node: MappingConstructor) {
        this.offset -= DEFAULT_OFFSET;

    }
}
