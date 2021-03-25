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

import { RecordField, RequiredParam, ReturnTypeDescriptor, Visitor } from "@ballerina/syntax-tree";

import { SourcePointViewState, TargetPointViewState, TypeDescViewState } from "../viewstate";

export const MAIN_TARGET_NAME = 'MAIN_TARGET';

export class DataPointVisitor implements Visitor {
    private _sourcePointMap: Map<string, SourcePointViewState> = new Map();
    private _targetPointMap: Map<string, TargetPointViewState> = new Map();
    private nameComponents: string[] = [];
    private returnTypeX: number = 0;
    private readonly sourceTypeX: number = 0;

    constructor(maxOffset: number) {
        this.sourceTypeX = 100 + maxOffset;
    }

    beginVisitRequiredParam(node: RequiredParam) {
        if (node.dataMapperViewState) {
            const viewState: TypeDescViewState = node.dataMapperViewState as TypeDescViewState;
            viewState.sourcePointViewState.bBox.x = this.sourceTypeX;
            viewState.sourcePointViewState.bBox.y = viewState.bBox.y;
            this.sourcePointMap.set(viewState.name, viewState.sourcePointViewState);
            this.nameComponents.push(viewState.name);
        }
    }

    endVisitRequiredParam(node: RequiredParam) {
        if (node.dataMapperViewState) {
            this.nameComponents.splice(this.nameComponents.length - 1, 1);
        }
    }

    beginVisitReturnTypeDescriptor(node: ReturnTypeDescriptor) {
        if (node.dataMapperViewState) {
            const viewState: TypeDescViewState = node.dataMapperViewState as TypeDescViewState;
            this.returnTypeX = viewState.bBox.x - 20; // todo: move this to a constant file
            viewState.targetPointViewState.bBox.x = this.returnTypeX;
            viewState.targetPointViewState.bBox.y = viewState.bBox.y;
            this.targetPointMap.set(MAIN_TARGET_NAME, viewState.targetPointViewState);
            this.nameComponents.push(MAIN_TARGET_NAME);
        }
    }

    endVisitReturnTypeDescriptor(node: ReturnTypeDescriptor) {
        if (node.dataMapperViewState) {
            this.nameComponents.splice(this.nameComponents.length - 1, 1);
        }
    }

    beginVisitRecordField(node: RecordField) {
        if (node.dataMapperViewState) {
            const viewState: TypeDescViewState = node.dataMapperViewState as TypeDescViewState;
            this.nameComponents.push(viewState.name);
            if (viewState.isSource) {
                viewState.sourcePointViewState.bBox.x = this.sourceTypeX;
                viewState.sourcePointViewState.bBox.y = viewState.bBox.y;
                this.sourcePointMap.set(this.generateDataPointName(this.nameComponents), viewState.sourcePointViewState);
            }

            if (viewState.isTarget) {
                viewState.targetPointViewState.bBox.x = this.returnTypeX;
                viewState.targetPointViewState.bBox.y = viewState.bBox.y;
                this.targetPointMap.set(this.generateDataPointName(this.nameComponents), viewState.targetPointViewState);
            }
        }
    }

    endVisitRecordField(node: RecordField) {
        if (node.dataMapperViewState) {
            this.nameComponents.splice(this.nameComponents.length - 1, 1);
        }
    }

    get sourcePointMap(): Map<string, SourcePointViewState> {
        return this._sourcePointMap;
    }

    get targetPointMap(): Map<string, TargetPointViewState> {
        return this._targetPointMap;
    }

    generateDataPointName(nameParts: string[]) {
        let name = '';

        nameParts.forEach((part: string, i: number) => {
            name += `${i !== 0 ? '.' : ''}${part}`;
        });

        return name;
    }
}
