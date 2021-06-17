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
import { AssignmentStatement, ExplicitAnonymousFunctionExpression, FieldAccess, LocalVarDecl, RecordField, RecordTypeDesc, SpecificField, STKindChecker, Visitor } from '@ballerina/syntax-tree';
import { expression } from 'joi';

import { DataMapperViewState, FieldViewState } from '../viewstate';

export const FIELD_HEIGHT: number = 40;
export const ADD_FIELD_FORM_HEIGHT: number = 60;
export const DEFAULT_FIELD_WIDTH: number = 250;
const FIELD_OFFSET: number = 15;
export class DataMapperSizingVisitor implements Visitor {
    // private hasTypeDescNode: boolean = false;
    // private hasInlineTypeDesc: boolean = false;
    private offSet: number = 0;
    private maxWidth: number = 0;
    private viewstateMap: Map<string, DataMapperViewState> = new Map();
    private nameparts: string[] = [];
    private hasMappingConstructor: boolean = false;

    beginVisitAssignmentStatement(node: AssignmentStatement) {
        if (node.dataMapperViewState) {
            const viewstate = node.dataMapperViewState as FieldViewState;
            // this.hasTypeDescNode = node.dataMapperTypeDescNode !== undefined;
            this.hasMappingConstructor = STKindChecker.isMappingConstructor(node.expression);

            this.nameparts.push(viewstate.name);

            this.viewstateMap.set(this.generateDataPointName(this.nameparts), viewstate);
            viewstate.bBox.w = DEFAULT_FIELD_WIDTH

            if (viewstate.bBox.w > this.maxWidth) {
                this.maxWidth = viewstate.bBox.w;
            }

            if (node.dataMapperTypeDescNode || STKindChecker.isMappingConstructor(node.expression)) {
                this.offSet += FIELD_OFFSET;
            }
        }
    }

    endVisitAssignmentStatement(node: AssignmentStatement) {
        if (node.dataMapperViewState) {
            const viewState: FieldViewState = node.dataMapperViewState as FieldViewState;
            let height: number = 0;
            height += FIELD_HEIGHT; // title height

            if (this.hasMappingConstructor) {
                const expressionNode = node.expression; if (STKindChecker.isMappingConstructor(expressionNode)) {
                    expressionNode.fields.filter(field => !STKindChecker.isCommaToken(field)).forEach(field => {
                        const fieldVS = field.dataMapperViewState as FieldViewState;

                        height += fieldVS.bBox.h;
                    })
                }
            } else {
                if (node.dataMapperTypeDescNode && STKindChecker.isRecordTypeDesc(node.dataMapperTypeDescNode)) {
                    const typeDescNode: RecordTypeDesc = node.dataMapperTypeDescNode as RecordTypeDesc;
                    typeDescNode.fields.forEach(field => {
                        const viewstate: FieldViewState = field.dataMapperViewState as FieldViewState;
                        height += viewstate.bBox.h;
                    });
                }
            }

            if (viewState.draftViewState) {
                height += ADD_FIELD_FORM_HEIGHT;
                viewState.draftViewState.bBox.h = ADD_FIELD_FORM_HEIGHT;
            }

            viewState.bBox.h = height;

            // cleanup
            this.nameparts.splice(this.nameparts.length - 1, 1);
            if (node.dataMapperTypeDescNode || STKindChecker.isMappingConstructor(node.expression)) {
                this.offSet -= FIELD_OFFSET;
            }
        }
    }

    beginVisitLocalVarDecl(node: LocalVarDecl) {
        if (node.dataMapperViewState) {
            const viewstate = node.dataMapperViewState as FieldViewState;
            // this.hasTypeDescNode = node.dataMapperTypeDescNode !== undefined;
            // this.hasInlineTypeDesc = viewstate.hasInlineRecordDescription;
            this.hasMappingConstructor = STKindChecker.isMappingConstructor(node.initializer);

            this.nameparts.push(viewstate.name);
            this.viewstateMap.set(this.generateDataPointName(this.nameparts), viewstate);

            viewstate.bBox.w = DEFAULT_FIELD_WIDTH

            if (viewstate.bBox.w > this.maxWidth) {
                this.maxWidth = viewstate.bBox.w;
            }

            if (node.dataMapperTypeDescNode || STKindChecker.isMappingConstructor(node.initializer) || viewstate.hasInlineRecordDescription) {
                this.offSet += FIELD_OFFSET;
            }
        }
    }

    endVisitLocalVarDecl(node: LocalVarDecl) {
        if (node.dataMapperViewState) {
            const viewState: FieldViewState = node.dataMapperViewState as FieldViewState;
            let height: number = 0;

            height += FIELD_HEIGHT; // title height

            if (this.hasMappingConstructor) {
                const expressionNode = node.initializer;
                if (STKindChecker.isMappingConstructor(expressionNode)) {
                    expressionNode.fields.filter(field => !STKindChecker.isCommaToken(field)).forEach(field => {
                        const fieldVS = field.dataMapperViewState as FieldViewState;

                        height += fieldVS.bBox.h;
                    })
                }
            } else {
                if (node.dataMapperTypeDescNode && STKindChecker.isRecordTypeDesc(node.dataMapperTypeDescNode)) {
                    const typeDescNode: RecordTypeDesc = node.dataMapperTypeDescNode as RecordTypeDesc;
                    typeDescNode.fields.forEach(field => {
                        const viewstate: FieldViewState = field.dataMapperViewState as FieldViewState;
                        height += viewstate.bBox.h;
                    });
                }

                if (viewState.hasInlineRecordDescription) {
                    const typedBindingPattern = node.typedBindingPattern;

                    if (STKindChecker.isRecordTypeDesc(typedBindingPattern.typeDescriptor)) {
                        const typeDescNode: RecordTypeDesc = typedBindingPattern.typeDescriptor as RecordTypeDesc;
                        typeDescNode.fields.forEach(field => {
                            const viewstate: FieldViewState = field.dataMapperViewState as FieldViewState;
                            height += viewstate.bBox.h;
                        });
                    }
                }
            }

            if (viewState.draftViewState) {
                height += ADD_FIELD_FORM_HEIGHT;
                viewState.draftViewState.bBox.h = ADD_FIELD_FORM_HEIGHT;
            }

            viewState.bBox.h = height;

            // cleanup
            this.nameparts.splice(this.nameparts.length - 1, 1);
            if (node.dataMapperTypeDescNode || STKindChecker.isMappingConstructor(node.initializer) || viewState.hasInlineRecordDescription) {
                this.offSet -= FIELD_OFFSET;
            }
        }
    }

    beginVisitSpecificField(node: SpecificField) {
        if (node.dataMapperViewState && this.hasMappingConstructor) {
            const viewstate = node.dataMapperViewState as FieldViewState;
            viewstate.bBox.h = FIELD_HEIGHT;
            viewstate.bBox.w = this.offSet + DEFAULT_FIELD_WIDTH;
            this.nameparts.push(viewstate.name);
            this.viewstateMap.set(this.generateDataPointName(this.nameparts), viewstate);

            if (viewstate.bBox.w > this.maxWidth) {
                this.maxWidth = viewstate.bBox.w;
            }

            if (STKindChecker.isMappingConstructor(node.valueExpr)) {
                this.offSet += FIELD_OFFSET;
            }
        }
    }

    endVisitSpecificField(node: SpecificField) {
        if (node.dataMapperViewState && this.hasMappingConstructor) {
            const viewstate = node.dataMapperViewState as FieldViewState;
            viewstate.bBox.h = FIELD_HEIGHT;
            const valueExpr = node.valueExpr;
            let height: number = 0;
            if (valueExpr) {
                if (STKindChecker.isMappingConstructor(valueExpr)) {
                    valueExpr.fields.filter(field => !STKindChecker.isCommaToken(field)).forEach(field => {
                        const fieldVS = field.dataMapperViewState as FieldViewState;

                        height += fieldVS.bBox.h;
                    })
                }
            }

            if (viewstate.draftViewState) {
                height += ADD_FIELD_FORM_HEIGHT;
                viewstate.draftViewState.bBox.h = ADD_FIELD_FORM_HEIGHT;
            }

            viewstate.bBox.h += height;

            // cleanup
            this.nameparts.splice(this.nameparts.length - 1, 1);
            if (STKindChecker.isMappingConstructor(node.valueExpr)) {
                this.offSet -= FIELD_OFFSET;
            }

        }
    }

    beginVisitRecordField(node: RecordField) {
        if (node.dataMapperViewState && !this.hasMappingConstructor) {
            const viewstate = node.dataMapperViewState as FieldViewState;
            viewstate.bBox.h = FIELD_HEIGHT;
            viewstate.bBox.w = this.offSet + DEFAULT_FIELD_WIDTH;

            if (viewstate.bBox.w > this.maxWidth) {
                this.maxWidth = viewstate.bBox.w;
            }

            this.nameparts.push(viewstate.name);
            this.viewstateMap.set(this.generateDataPointName(this.nameparts), viewstate);

            if (node.dataMapperTypeDescNode || viewstate.hasInlineRecordDescription) {
                this.offSet += FIELD_OFFSET;
            }
        }
    }

    endVisitRecordField(node: RecordField) {
        if (node.dataMapperViewState && !this.hasMappingConstructor) {
            const viewstate = node.dataMapperViewState as FieldViewState;

            let height: number = 0;

            if (node.dataMapperTypeDescNode && STKindChecker.isRecordTypeDesc(node.dataMapperTypeDescNode)) {
                const typeDescNode: RecordTypeDesc = node.dataMapperTypeDescNode as RecordTypeDesc;
                typeDescNode.fields.forEach(field => {
                    const fieldViewState = field.dataMapperViewState as FieldViewState;
                    height += fieldViewState.bBox.h;
                });
            }

            if (viewstate.hasInlineRecordDescription) {
                if (STKindChecker.isRecordTypeDesc(node.typeName)) {
                    const typeDescNode: RecordTypeDesc = node.typeName as RecordTypeDesc;
                    typeDescNode.fields.forEach(field => {
                        const fieldViewState = field.dataMapperViewState as FieldViewState;
                        height += fieldViewState.bBox.h;
                    });
                }
            }

            viewstate.bBox.h += height;

            // clean up
            this.nameparts.splice(this.nameparts.length - 1, 1);
            if (node.dataMapperTypeDescNode || viewstate.hasInlineRecordDescription) {
                this.offSet -= FIELD_OFFSET;
            }
        }
    }

    getViewStateMap(): Map<string, DataMapperViewState> {
        return this.viewstateMap;
    }

    getMaxWidth(): number {
        return this.maxWidth;
    }

    generateDataPointName(nameParts: string[]) {
        let name = '';

        nameParts.forEach((part: string, i: number) => {
            name += `${i !== 0 ? '.' : ''}${part}`;
        });

        return name;
    }
}
