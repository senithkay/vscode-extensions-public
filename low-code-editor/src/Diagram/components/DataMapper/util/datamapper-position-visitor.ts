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
    RequiredParam,
    ReturnTypeDescriptor,
    Visitor
} from '@ballerina/syntax-tree';
import { DataPointViewstate } from '../viewstate'

const DEFAULT_OFFSET = 20;

export class DataMapperPositionVisitor implements Visitor {
    private height: number;
    private startHeight: number;
    private startOffset: number;

    constructor(height: number, startOffset: number) {
        this.height = height;
        this.startOffset = startOffset;
        this.startHeight = height;
    }

    beginVisitRequiredParam(node: RequiredParam) {
        if (node.dataMapperViewstate) {
            const viewState: DataPointViewstate = node.dataMapperViewstate as DataPointViewstate;
            viewState.bBox.x = this.startOffset;
            viewState.bBox.y = this.height;
            switch (viewState.type) {
                case 'record':
                    this.calculateRecordTypePosition(viewState.fields, this.startOffset + DEFAULT_OFFSET);
                    break;
                default:
                    // ignored
            }

            this.height += DEFAULT_OFFSET * 2;
        }
    }

    beginVisitReturnTypeDescriptor(node: ReturnTypeDescriptor) {
        if (node.dataMapperViewstate) {
            const viewState: DataPointViewstate = node.dataMapperViewstate as DataPointViewstate;
            viewState.bBox.x = this.startOffset + 400;
            this.height = this.startHeight;
            viewState.bBox.y = this.height;
            switch (viewState.type) {
                case 'record':
                    this.calculateRecordTypePosition(viewState.fields, this.startOffset + 400 + DEFAULT_OFFSET);
                    break;
                default:
                // ignored
            }

            this.height += DEFAULT_OFFSET * 2;

        }
    }

    calculateRecordTypePosition(fields: DataPointViewstate[], offset: number) {
        fields.forEach(field => {
            this.height += DEFAULT_OFFSET;
            field.bBox.y = this.height;
            field.bBox.x = offset;

            if (field.type === 'record') {
                this.calculateRecordTypePosition(field.fields, offset + DEFAULT_OFFSET);
            }
        })
    }

}
