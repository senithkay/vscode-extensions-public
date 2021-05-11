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

import { AssignmentStatement, LocalVarDecl, RecordField, SpecificField, Visitor } from "@ballerina/syntax-tree";

import { FieldViewState, SourcePointViewState, TargetPointViewState } from "../viewstate";

export const MAIN_TARGET_NAME = 'MAIN_TARGET';

export class DataPointVisitor implements Visitor {
    private _sourcePointMap: Map<string, SourcePointViewState> = new Map();
    private _targetPointMap: Map<string, TargetPointViewState> = new Map();
    private nameComponents: string[] = [];
    private returnTypeX: number = 0;
    private readonly sourceTypeX: number = 0;
    private hasDataMapperTypeDesc: boolean;

    constructor(maxOffset: number) {
        this.sourceTypeX = 150 + maxOffset;
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

    beginVisitAssignmentStatement(node: AssignmentStatement) {
        if (node.dataMapperViewState) {
            const viewState = node.dataMapperViewState as FieldViewState;
            this.nameComponents.push(viewState.name);
            this.hasDataMapperTypeDesc = node.dataMapperTypeDescNode !== undefined;

            if (viewState.sourcePointViewState) {
                viewState.sourcePointViewState.bBox.x = this.sourceTypeX;
                viewState.sourcePointViewState.bBox.y = viewState.bBox.y;
                this._sourcePointMap.set(this.generateDataPointName(this.nameComponents), viewState.sourcePointViewState);
            }

            if (viewState.targetPointViewState) {
                viewState.targetPointViewState.bBox.x = 450;
                viewState.targetPointViewState.bBox.y = viewState.bBox.y;
                this._targetPointMap.set(this.generateDataPointName(this.nameComponents), viewState.targetPointViewState);
            }
        }
    }

    endVisitAssignmentStatement(node: AssignmentStatement) {
        if (node.dataMapperViewState) {
            this.nameComponents.splice(this.nameComponents.length - 1, 1);
            this.hasDataMapperTypeDesc = false;
        }
    }

    beginVisitLocalVarDecl(node: LocalVarDecl) {
        if (node.dataMapperViewState) {
            const viewstate = node.dataMapperViewState as FieldViewState;
            this.nameComponents.push(viewstate.name);
            this.hasDataMapperTypeDesc = node.dataMapperTypeDescNode !== undefined;

            if (viewstate.sourcePointViewState) {
                viewstate.sourcePointViewState.bBox.x = this.sourceTypeX;
                viewstate.sourcePointViewState.bBox.y = viewstate.bBox.y;
                this._sourcePointMap.set(this.generateDataPointName(this.nameComponents), viewstate.sourcePointViewState);
            }

            if (viewstate.targetPointViewState) {
                viewstate.targetPointViewState.bBox.x = 450;
                viewstate.targetPointViewState.bBox.y = viewstate.bBox.y;
                this._targetPointMap.set(this.generateDataPointName(this.nameComponents), viewstate.targetPointViewState);
            }
        }
    }

    endVisitLocalVarDecl(node: LocalVarDecl) {
        if (node.dataMapperViewState) {
            this.nameComponents.splice(this.nameComponents.length - 1, 1);
            this.hasDataMapperTypeDesc = false;
        }
    }

    beginVisitRecordField(node: RecordField) {
        if (node.dataMapperViewState) {
            const viewstate = node.dataMapperViewState as FieldViewState;
            this.nameComponents.push(viewstate.name);

            if (viewstate.sourcePointViewState) {
                viewstate.sourcePointViewState.bBox.x = this.sourceTypeX;
                viewstate.sourcePointViewState.bBox.y = viewstate.bBox.y;
                this._sourcePointMap.set(this.generateDataPointName(this.nameComponents), viewstate.sourcePointViewState);
            }

            if (viewstate.targetPointViewState) {
                viewstate.targetPointViewState.bBox.x = 450;
                viewstate.targetPointViewState.bBox.y = viewstate.bBox.y;
                this._targetPointMap.set(this.generateDataPointName(this.nameComponents), viewstate.targetPointViewState);
            }
        }
    }

    endVisitRecordField(node: RecordField) {
        if (node.dataMapperViewState) {
            this.nameComponents.splice(this.nameComponents.length - 1, 1);
        }
    }

    beginVisitSpecificField(node: SpecificField) {
        if (node.dataMapperViewState && !this.hasDataMapperTypeDesc) {
            const viewstate = node.dataMapperViewState as FieldViewState;
            this.nameComponents.push(viewstate.name);

            if (viewstate.sourcePointViewState) {
                viewstate.sourcePointViewState.bBox.x = this.sourceTypeX;
                viewstate.sourcePointViewState.bBox.y = viewstate.bBox.y;
                this._sourcePointMap.set(this.generateDataPointName(this.nameComponents), viewstate.sourcePointViewState);
            }

            if (viewstate.targetPointViewState) {
                viewstate.targetPointViewState.bBox.x = 450;
                viewstate.targetPointViewState.bBox.y = viewstate.bBox.y;
                this._targetPointMap.set(this.generateDataPointName(this.nameComponents), viewstate.targetPointViewState);
            }
        }
    }

    endVisitSpecificField(node: SpecificField) {
        if (node.dataMapperViewState && !this.hasDataMapperTypeDesc) {
            this.nameComponents.splice(this.nameComponents.length - 1, 1);
        }
    }
}
