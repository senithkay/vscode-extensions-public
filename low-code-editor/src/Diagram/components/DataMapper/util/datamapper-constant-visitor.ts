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
import { BooleanLiteral, NumericLiteral, StringLiteral, Visitor } from '@ballerina/syntax-tree'

import { FieldViewState } from '../viewstate'

export const CONSTANT_TYPE = 'constant';

export class ConstantVisitor implements Visitor {
    private constantsMap: Map<string, FieldViewState>;
    private constantList: FieldViewState[];

    constructor() {
        this.constantsMap = new Map();
        this.constantList = [];
    }

    beginVisitStringLiteral(node: StringLiteral) {
        if (node.dataMapperViewState && node.dataMapperViewState instanceof FieldViewState) {
            const viewstate = node.dataMapperViewState;

            if (viewstate.type === CONSTANT_TYPE) {
                this.addConstantToMap(viewstate);
                this.constantList.push(viewstate);
            }
        }
    }

    beginVisitBooleanLiteral(node: BooleanLiteral) {
        if (node.dataMapperViewState && node.dataMapperViewState instanceof FieldViewState) {
            const viewstate = node.dataMapperViewState;

            if (viewstate.type === CONSTANT_TYPE) {
                this.addConstantToMap(viewstate);
                this.constantList.push(viewstate);
            }
        }
    }

    beginVisitNumericLiteral(node: NumericLiteral) {
        if (node.dataMapperViewState && node.dataMapperViewState instanceof FieldViewState) {
            const viewstate = node.dataMapperViewState;

            if (viewstate.type === CONSTANT_TYPE) {
                this.addConstantToMap(viewstate);
                this.constantList.push(viewstate);
            }
        }
    }

    addConstantToMap(viewstate: FieldViewState) {
        if (!this.constantsMap.has(viewstate.name)) {
            this.constantsMap.set(viewstate.value, viewstate);
        }
    }

    public getConstantsMap(): Map<string, FieldViewState> {
        return this.constantsMap;
    }

    public getConstantList(): FieldViewState[] {
        return this.constantList;
    }
}
