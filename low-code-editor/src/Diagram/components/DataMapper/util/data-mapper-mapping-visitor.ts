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
    private missingVariableRefName: string[] = [];

    constructor(sourcePoints: Map<string, SourcePointViewState>, targetPoints: Map<string, TargetPointViewState>) {
        this.sourcePoints = sourcePoints;
        this.targetPoints = targetPoints;
    }

    beginVisitAssignmentStatement(node: AssignmentStatement) {
        if (node.dataMapperViewState) {
            const viewState = node.dataMapperViewState as FieldViewState;
            this.nameParts.push(viewState.name);
            const targetPoint = this.targetPoints.get(this.generateDataPointName(this.nameParts));
            targetPoint.position = node.expression.position;
            targetPoint.value = node.expression.source;
        }
    }

    endVisitAssignmentStatement(node: AssignmentStatement) {
        if (node.dataMapperViewState) {
            const viewstate = node.dataMapperViewState as FieldViewState;
            this.references.forEach(ref => {
                let dataPointRef;
                const refArray = ref.split('.');

                do {
                    dataPointRef = this.sourcePoints.get(this.generateDataPointName(refArray));
                    if (dataPointRef === undefined && refArray.length > 1) {
                        refArray.splice(refArray.length - 1, 1);
                    }
                } while (dataPointRef === undefined && refArray.length > 1);

                if (dataPointRef) {
                    const connectionVS = this._generateConnection(
                        this.generateDataPointName(refArray),
                        this.generateDataPointName(this.nameParts),
                        node.expression.position
                    );
                    dataPointRef.connections.push(connectionVS);
                } else {
                    const name = this.generateDataPointName(refArray);
                    if (this.missingVariableRefName.indexOf(name) === -1) {
                        this.missingVariableRefName.push(name);
                    }
                }
            });
            this.nameParts.splice(this.nameParts.length - 1, 1);
            this.references = [];
        }
    }

    beginVisitLocalVarDecl(node: LocalVarDecl) {
        if (node.dataMapperViewState) {
            const viewState = node.dataMapperViewState as FieldViewState;
            this.nameParts.push(viewState.name);
            const targetPoint = this.targetPoints.get(this.generateDataPointName(this.nameParts));
            targetPoint.position = node.initializer.position;
            targetPoint.value = node.initializer.source;
        }
    }

    endVisitLocalVarDecl(node: LocalVarDecl) {
        if (node.dataMapperViewState) {
            const viewstate = node.dataMapperViewState as FieldViewState;
            this.references.forEach(ref => {
                let dataPointRef;
                const refArray = ref.split('.');

                do {
                    dataPointRef = this.sourcePoints.get(this.generateDataPointName(refArray));
                    if (dataPointRef === undefined && refArray.length > 1) {
                        refArray.splice(refArray.length - 1, 1);
                    }
                } while (dataPointRef === undefined && refArray.length > 1);

                if (dataPointRef) {
                    const connectionVS = this._generateConnection(
                        this.generateDataPointName(refArray),
                        this.generateDataPointName(this.nameParts),
                        node.initializer.position
                    );
                    dataPointRef.connections.push(connectionVS);
                } else {
                    const name = this.generateDataPointName(refArray)
                    if (this.missingVariableRefName.indexOf(name) === -1) {
                        this.missingVariableRefName.push(name);
                    }
                }
            });
            this.nameParts.splice(this.nameParts.length - 1, 1);
            this.references = [];
        }
    }

    beginVisitSpecificField(node: SpecificField) {
        if (node.dataMapperViewState) {
            const viewState = node.dataMapperViewState as FieldViewState;
            this.nameParts.push(viewState.name);
            const targetPoint = this.targetPoints.get(this.generateDataPointName(this.nameParts));
            targetPoint.position = node.valueExpr.position;
            targetPoint.value = node.valueExpr.source;
        }
    }

    endVisitSpecificField(node: SpecificField) {
        if (node.dataMapperViewState) {
            const viewstate = node.dataMapperViewState as FieldViewState;
            this.references.forEach(ref => {
                let dataPointRef;
                const refArray = ref.split('.');

                do {
                    dataPointRef = this.sourcePoints.get(this.generateDataPointName(refArray));
                    if (dataPointRef === undefined && refArray.length > 1) {
                        refArray.splice(refArray.length - 1, 1);
                    }
                } while (dataPointRef === undefined && refArray.length > 1);

                if (dataPointRef) {
                    const connectionVS = this._generateConnection(
                        this.generateDataPointName(refArray),
                        this.generateDataPointName(this.nameParts),
                        node.valueExpr.position
                    );
                    dataPointRef.connections.push(connectionVS);
                } else {
                    const name = this.generateDataPointName(refArray);
                    if (this.missingVariableRefName.indexOf(name) === -1) {
                        this.missingVariableRefName.push(name);
                    }
                }
            });

            this.references = [];
            this.nameParts.splice(this.nameParts.length - 1, 1);
        }
    }

    beginVisitSimpleNameReference(node: SimpleNameReference) {
        if (node.dataMapperViewState) {
            this.references.push(node.source.trim());
        }
    }

    beginVisitFieldAccess(node: FieldAccess) {
        if (node.dataMapperViewState) {
            this.references.push(node.source.trim());
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
                sourcePointVS,
                targetPointVS,
                position
            );
        }

        return undefined;
    }

    public getMissingVarRefList(): string[] {
        return this.missingVariableRefName;
    }
}
