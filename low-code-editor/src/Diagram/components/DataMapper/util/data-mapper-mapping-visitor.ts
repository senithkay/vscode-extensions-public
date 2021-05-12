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
    AssignmentStatement,
    FieldAccess,
    LocalVarDecl,
    SimpleNameReference,
    SpecificField,
    Visitor
} from "@ballerina/syntax-tree";

import { DraftUpdatePosition } from "../../../view-state/draft";
import { ConnectionViewState, FieldViewState, SourcePointViewState, TargetPointViewState } from "../viewstate";


export class DataMapperMappingVisitor implements Visitor {
    private isVisitingReturnStatement: boolean = false;
    private nameParts: string[] = [];
    private sourcePoints: Map<string, SourcePointViewState>;
    private targetPoints: Map<string, TargetPointViewState>;
    private references: string[] = [];

    constructor(sourcePoints: Map<string, SourcePointViewState>, targetPoints: Map<string, TargetPointViewState>) {
        this.sourcePoints = sourcePoints;
        this.targetPoints = targetPoints;
    }

    beginVisitAssignmentStatement(node: AssignmentStatement) {
        if (node.dataMapperViewState) {
            const viewState = node.dataMapperViewState as FieldViewState;
            this.nameParts.push(viewState.name);
            this.targetPoints.get(this.generateDataPointName(this.nameParts)).position = node.expression.position;
        }
    }

    endVisitAssignmentStatement(node: AssignmentStatement) {
        if (node.dataMapperViewState) {
            const viewstate = node.dataMapperViewState as FieldViewState;
            this.nameParts.splice(this.nameParts.length - 1, 1);
            this.references.forEach(ref => {
                const connectionVS = this._generateConnection(
                    ref,
                    this.generateDataPointName(this.nameParts),
                    node.expression.position
                );
                this.sourcePoints.get(ref).connections.push(connectionVS);
            });

            this.references = [];
        }
    }

    beginVisitLocalVarDecl(node: LocalVarDecl) {
        if (node.dataMapperViewState) {
            const viewState = node.dataMapperViewState as FieldViewState;
            this.nameParts.push(viewState.name);
            this.targetPoints.get(this.generateDataPointName(this.nameParts)).position = node.initializer.position;
        }
    }

    endVisitLocalVarDecl(node: LocalVarDecl) {
        if (node.dataMapperViewState) {
            const viewstate = node.dataMapperViewState as FieldViewState;
            this.nameParts.splice(this.nameParts.length - 1, 1);
            this.references.forEach(ref => {
                const connectionVS = this._generateConnection(
                    ref,
                    this.generateDataPointName(this.nameParts),
                    node.initializer.position
                );
                this.sourcePoints.get(ref).connections.push(connectionVS);
            });
            this.references = [];
        }
    }

    beginVisitSpecificField(node: SpecificField) {
        if (node.dataMapperViewState) {
            const viewState = node.dataMapperViewState as FieldViewState;
            this.nameParts.push(viewState.name);
            this.targetPoints.get(this.generateDataPointName(this.nameParts)).position = node.valueExpr.position;
        }
    }

    endVisitSpecificField(node: SpecificField) {
        if (node.dataMapperViewState) {
            const viewstate = node.dataMapperViewState as FieldViewState;
            this.references.forEach(ref => {
                const connectionVS = this._generateConnection(
                    ref,
                    this.generateDataPointName(this.nameParts),
                    node.valueExpr.position
                );
                this.sourcePoints.get(ref).connections.push(connectionVS);
            });

            this.references = [];
            this.nameParts.splice(this.nameParts.length - 1, 1);
        }
    }

    beginVisitSimpleNameReference(node: SimpleNameReference) {
        if (node.dataMapperViewState) {
            this.references.push(node.source);
        }
    }

    beginVisitFieldAccess(node: FieldAccess) {
        if (node.dataMapperViewState) {
            this.references.push(node.source);
        }
    }

    generateDataPointName(nameParts: string[]) {
        let name = '';

        nameParts.forEach((part: string, i: number) => {
            name += `${i !== 0 ? '.' : ''}${part}`;
        });

        return name;
    }

    _generateConnection(reference: string, targetName: string, position: DraftUpdatePosition): ConnectionViewState {
        const sourcePointVS = this.sourcePoints.get(reference);
        const targetPointVS = this.targetPoints.get(targetName);

        if (sourcePointVS && targetPointVS) {
            return new ConnectionViewState(
                sourcePointVS.bBox,
                targetPointVS.bBox,
                position
            );
        }

        return undefined;
    }
}
