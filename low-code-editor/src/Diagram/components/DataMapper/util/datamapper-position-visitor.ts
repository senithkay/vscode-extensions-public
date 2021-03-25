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
import {
    ExplicitAnonymousFunctionExpression,
    RecordField,
    RecordTypeDesc,
    RequiredParam,
    ReturnTypeDescriptor, traversNode,
    Visitor
} from '@ballerina/syntax-tree';

import { DataMapperFunctionViewState, TypeDescViewState } from "../viewstate";

const DEFAULT_OFFSET = 20;

export class DataMapperPositionVisitor implements Visitor {
    private startHeight: number;
    private height: number;
    private offset: number;
    private _maxOffset: number = 0;

    constructor(height: number, startOffset: number) {
        this.height = height;
        this.offset = startOffset;
        this.startHeight = height;
    }

    beginVisitRequiredParam(node: RequiredParam) {
        if (node.dataMapperViewState) {
            const viewState: TypeDescViewState = node.dataMapperViewState as TypeDescViewState;
            viewState.bBox.y = this.height;
            viewState.bBox.x = this.offset;

            this.offset += DEFAULT_OFFSET;
        }
    }

    endVisitRequiredParam(node: RequiredParam) {
        if (node.dataMapperViewState) {
            this.height += DEFAULT_OFFSET;
            this.offset -= DEFAULT_OFFSET;
        }
    }

    beginVisitReturnTypeDescriptor(node: ReturnTypeDescriptor) {
        if (node.dataMapperViewState) {
            const viewState: TypeDescViewState = node.dataMapperViewState as TypeDescViewState;
            this.height = this.startHeight;
            viewState.bBox.y = this.height;
            this.offset = 400 + this._maxOffset;
            viewState.bBox.x = this.offset;

            this.offset += DEFAULT_OFFSET;
        }
    }

    endVisitReturnTypeDescriptor(node: ReturnTypeDescriptor) {
        if (node.dataMapperViewState) {
            this.offset -= DEFAULT_OFFSET;
        }
    }

    beginVisitRecordField(node: RecordField) {
        if (node.dataMapperViewState) {
            const viewState: TypeDescViewState = node.dataMapperViewState as TypeDescViewState;
            this.height += DEFAULT_OFFSET;
            viewState.bBox.y = this.height;
            viewState.bBox.x = this.offset;

            if (this._maxOffset < this.offset && viewState.isSource ) {
                this._maxOffset = this.offset;
            }

            this.offset += DEFAULT_OFFSET;
        }
    }

    endVisitRecordField(node: RecordField) {
        if (node.dataMapperViewState) {
            this.height += DEFAULT_OFFSET;
            this.offset -= DEFAULT_OFFSET;
        }
    }


    get maxOffset(): number {
        return this._maxOffset;
    }
}

